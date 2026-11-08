# Bandit Brothers — Agent Guide

E-commerce site for Bandit Brothers (bandanas, balaclavas, jerseys; India-first, INR). Live at https://www.banditbrothers.in.
One Next.js app holds the **storefront**, the **admin panel** (`/admin`), and the **backend** (server actions + two API routes). A small Firebase Cloud Functions project lives in `functions/`.

## Stack

- Next.js 16 App Router, React 19, TypeScript, `yarn` (v1). `yarn dev` (turbopack), `yarn build`, `yarn lint`. No test suite.
- Tailwind 3 + shadcn/ui (`src/components/ui/*`, generated; avoid editing by hand). Always dark theme (`<html className="dark">`).
- Firestore via `firebase-admin` on the server (`src/lib/firebase-admin.ts`) and the web SDK in the browser (`src/lib/firebase.ts`).
- Payments: Razorpay. Images: AWS S3 (products) + Firebase Storage (review photos).
- State: zustand (cart and favorites persisted to localStorage, synced across tabs via `use-broadcast-ts`), TanStack Query for fetches.
- Analytics: PostHog (production only) + Meta Pixel. Notifications: Discord bot posts to channels.
- Deployed on Vercel (inferred from `.vercelignore` / `.vercel` ignore). Firebase project: `banditbrothers-5253`.
- Path alias `@/*` → `src/*`.

## Directory map

```
src/
  app/
    layout.tsx                 root: fonts, SEO metadata, providers (MetaPixel > PostHog > TanStack > Motion), Navbar/Footer
    (index)/                   route group; IndexClientLayout mounts SearchDialog + CartSheet and does the cart-version reset
      page.tsx                 home = HeroSection + LandingPageSections
      products/                /products, /products/[productId], /products/[productId]/[designId] (variant page)
      order/page.tsx           checkout (the biggest file, ~840 lines)
      order/[orderId]/         order status page; /review = customer review form
      reviews/page.tsx         public reviews, infinite scroll via /api/reviews
      admin/                   admin panel (see below)
    api/reviews/route.ts       GET approved reviews (paginated, cached 2h)
    api/rzpWebhook/route.ts    Razorpay webhook (marks orders paid/failed)
    contact|privacy|refunds|shipping|terms/   static pages
    sitemap.ts                 built from static PRODUCTS x DESIGNS
  actions/                     "use server" functions = the backend (Firestore CRUD, Razorpay, Discord)
  data/products.ts             STATIC catalog: PRODUCTS, DESIGNS, DESIGN_CATEGORIES, DESIGN_COLORS, MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
  types/                       Order, Coupon, Review, Product/Design/ProductVariant
  constants/collections.ts     Firestore collection names (dev vs prod)
  utils/                       pricing, cart, coupon math, S3 upload, image compression, Discord/WhatsApp message builders, tracking
  hooks/, components/, provider/, lib/
functions/                     Firebase Cloud Functions (gitignored! see below)
scripts/compress-s3-images.js  one-off: recompress S3 images > 550KB (`--dry-run` supported)
docs/aws-s3-setup.md           S3 bucket/IAM/CORS setup
```

## Data model

The catalog is split between **code** and **Firestore**:

- `Product` (bandana, balaclava, square-bandana, jersey): name, `basePrice`, `sizes`, material. **Static** in `src/data/products.ts`.
- `Design` (artwork, e.g. `tri-harder`): name, colors, category, tags. **Static** in `src/data/products.ts`.
- `ProductVariant` = Product x Design, **in Firestore** `variants`. Doc id = SKU from `getSKU(productId, designId)` → e.g. `BANDANA-TRI_HARDER` (uppercase, `-` → `_`). Holds images, optional `price` override, `name` override, `isAvailable`, `isDiscoverable`, `isBestSeller`, `createdAt`.
  - Price = `variant.price ?? PRODUCTS_OBJ[productId].basePrice` (`utils/product.ts`).
  - Name = `variant.name ?? DESIGNS_OBJ[designId].name`.
  - `isAvailable === false` → hidden everywhere (client query filters it out). `isDiscoverable === false` → reachable by URL but hidden from grids.
- **To add a new design:** add it to `DESIGNS` in `data/products.ts` (deploy), then create the variant in admin → Products. A variant whose designId isn't in `DESIGNS` will crash `DESIGNS_OBJ[...]` lookups.

Firestore collections (`constants/collections.ts`):

| Collection | Doc | Notes |
|---|---|---|
| `orders` (prod) / `orders-dev` (dev) | `Order` | `status`: initiated → paid / payment-failed / cancelled / admin-cancelled. `paymentMode` discriminates `rzp` / `cash` / `manual`. Amounts in **rupees**, except `rzp.amount` and `cash.amount` in **paise**. |
| `coupons` / `coupons-dev` | `Coupon` | `code` stored uppercase, looked up by `where("code","==")`. `discountType` fixed\|percentage, `applicableVariants` ([] = all). |
| `reviews` | `Review` | `source`: website (has orderId, variantIds) or google. `status` pending/approved/rejected; only approved are public. |
| `variants` | `ProductVariant` | see above |

All timestamps are **unix seconds** (`utils/timestamp.ts` `getTimestamp()`), not ms, not Firestore Timestamps.
"Dev" = `NODE_ENV !== "production"` (`utils/misc.ts` `isProduction`), i.e. `yarn dev` hits the **real Firestore project** with suffixed collection names. `reviews` and `variants` are shared between dev and prod.

## Storefront flows

**Browsing.** `useVariants()` (TanStack, key `["variants"]`, 24h stale) fetches all `isAvailable` variants directly from Firestore with the web SDK. Product grid (`components/layouts/ProductGridLayout.tsx`) filters client-side by category/color/best-seller/favorites/sort, all held in URL search params via `useParamBasedFeatures`. Variant page (`/products/[productId]/[designId]`) builds SEO metadata server-side from Firestore (cached 24h via `unstable_cache`) and renders client-side; it redirects to `/products` if the variant isn't found.

**Cart.** `components/stores/cart.ts`: items are `{variantId, size, quantity}` + an applied `coupon`. Bumping `LATEST_CART_VERSION` in `app/(index)/IndexClientLayout.tsx` wipes every visitor's cart on next load; do it when the cart shape changes.

**Checkout** (`app/(index)/order/page.tsx`):
1. react-hook-form + zod form (name, email, phone, address, referral source). Indian pincodes auto-fill city/state via api.postalpincode.in (`lib/pincode.ts`).
2. Totals are computed **in the browser**: subtotal (`utils/cart.ts`) − coupon discount (`utils/coupon.ts`) + shipping (₹100, free when total ≥ `MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING` = ₹700).
3. Payment mode: international (country ≠ IN) → `manual`; coupon code == `NEXT_PUBLIC_CASH_AND_FREE_SHIPPING_COUPON_CODE` → `cash` (also free shipping); else `rzp`.
4. `createOrder` server action writes the order. For `rzp` it also creates a Razorpay order with `notes.dbId = <firestore id>`. For `cash`/`manual` it posts to Discord immediately.
5. `rzp`: Razorpay Checkout modal (`components/payments/RazorpayGateway.tsx`). Dismiss → order set `cancelled`. Success → cart cleared, redirect home. The **webhook**, not the client, marks the order `paid`.
6. `manual` (international): customer sees a dialog; admin later sets real shipping and sends a Razorpay payment link (see admin).

**Razorpay webhook** (`app/api/rzpWebhook/route.ts`): verifies `X-Razorpay-Signature` with `RZP_WEBHOOK_SECRET`, reads `notes.dbId`.
- `payment.captured` → updates `rzp.*`, `status: "paid"`, posts a Discord order message (or "payment link paid" for international).
- `payment.failed` → `status: "payment-failed"` unless already paid.

**Reviews.** Customer opens `/order/[orderId]/review` (link usually sent from admin via WhatsApp). Signs in to Firebase anonymously, uploads one photo to **Firebase Storage** at `reviews/{reviewId}/0.<ext>`, `createReview` writes the review as `pending` and sets `order.reviewId`, posts to the Discord reviews channel. Admin approves → appears on `/reviews` and home testimonials (via `/api/reviews`, which strips `email`).

**Home page** sections (`components/pages/home/*`): hero, product library, how-to-wear, testimonials, know-your-product (`data/know-your-product.ts`), Instagram feed (Graph API, token in `NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN`).

## Admin panel (`/admin`)

`app/(index)/admin/page.tsx`, client component, desktop only. Login: the password is run through `hash()` (a 32-bit JS string hash, `utils/misc.ts`) and compared to `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`; on match the hash is stored in localStorage. Four tabs, each fetching through server actions with local `useState` (no TanStack):

- **Orders** (`OrderManagement.tsx`): latest 50 non-cancelled orders, filter by name/phone/date client-side, 10 per page. Order details dialog, WhatsApp review-request link, and for international orders `InternationalOrderPaymentDialog`: edit subtotal/shipping/discount → `updateOrder` → `createPaymentLinkForInternationalOrder` (Razorpay payment link, copied to clipboard). The webhook marks it paid when the customer pays.
- **Coupons** (`CouponManagement.tsx`): create (code uppercased, expiry = end of day IST, optional variant restriction), toggle `isActive`.
- **Reviews** (`ReviewManagement.tsx`): latest 10 reviews, approve/reject.
- **Products** (`ProductsManagement.tsx` + `components/dialogs/AddVariantDialog.tsx`, `EditVariantDialog.tsx`): create/edit/delete variants, export image CSV. Image upload: browser converts to WebP + compresses (`utils/image.ts`), uploads **directly from the browser to S3** (`utils/s3Upload.ts`, key `{productId}/{designId}/mockup-{ms}.webp`), new URL is prepended to `images.mockup`.

## Backend (server actions)

All in `src/actions/`, marked `"use server"`, using the admin SDK (bypasses Firestore rules):

- `orders.ts`: getOrders, getOrder, createOrder, updateOrder, removeOrder, getUserDetailsFromOrders
- `coupons.ts`: validateCoupon, getCoupon, getCoupons, addCoupon, updateCoupon, deleteCoupon
- `reviews.ts`: createReview, getReviews (public, approved, no email), getReviewsAdmin, updateReview
- `products.ts`: getVariantsAdmin, createVariant, updateVariant, updateVariantMockupImage, deleteVariant
- `payments/rzp.ts`: createOrder (Razorpay order, rupees → paise), createPaymentLinkForInternationalOrder
- `discord.ts`: sendDiscordOrderMessage / sendDiscordReviewMessage (bot token, hardcoded channel IDs; dev uses a separate orders channel). Message bodies built in `utils/discordMessages.ts`.
- `internal-helper-functions.ts`: commented-out one-off migrations. Not used.

## Cloud Functions (`functions/`)

Separate package (Node 22, `firebase-functions` v2), deployed with `firebase deploy --only functions`. Emulators: `cd functions && npm run emulate` (imports `localfirestoreinit/`). Env: `functions/.env` with `SERVICE_ACCOUNT_ADMIN`.
- `onReviewDeleted`: on `reviews/{id}` delete → remove `reviewId` from the order, delete `reviews/{id}/*` in Firebase Storage.
- `syncGoogleReviews`: scheduled every 2 days, **currently an empty stub**.

Note: root `.gitignore` contains `/functions`, so this code is **not in git**.

## Environment variables (`.env`, never commit)

`FIREBASE_SERVICE_ACCOUNT_ADMIN` (JSON string), `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_PROJECT_ID`, `NEXT_PUBLIC_RZP_KEY_ID`, `RZP_KEY_SECRET`, `RZP_WEBHOOK_SECRET`, `DISCORD_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY/HOST`, `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN`, `NEXT_PUBLIC_AWS_REGION/ACCESS_KEY_ID/SECRET_ACCESS_KEY/S3_BUCKET`, `NEXT_PUBLIC_CASH_AND_FREE_SHIPPING_COUPON_CODE`. `.env.development` overrides Razorpay to test keys for `yarn dev`.

## Conventions

- New Firestore reads/writes go in `src/actions/*` as server actions; reference collections via `Collections.*`, never string literals.
- Money in rupees in app code; multiply by 100 only at the Razorpay boundary.
- Timestamps: `getTimestamp()` (seconds).
- Images allowed by `next/image` must be listed in `next.config.ts` `remotePatterns` (S3 bucket, Firebase Storage, Instagram CDN).
- Prettier config in `.prettierrc`. `/designs/*` permanently redirects to `/products`.
- Analytics events go through `utils/analytics.ts` / `utils/metaPixel.ts`.

## Gotchas and known risks

Read these before touching payments, admin, or data.

1. **Keep dev off prod orders.** `Collections.orders` must stay `"orders-dev"` in dev; it has been temporarily flipped to `"orders"` before. Check `constants/collections.ts` before running checkout locally.
2. **Server actions have no auth.** Every action in `src/actions/` (updateOrder, deleteVariant, addCoupon, getOrders...) is a public POST endpoint. The admin login is only a client-side gate.
3. **Admin password check is weak**: a non-cryptographic 32-bit hash, shipped to the browser via a `NEXT_PUBLIC_` var.
4. **AWS keys are `NEXT_PUBLIC_`**, so they're in the client bundle. Same for the cash/free-shipping coupon code, which lets anyone create an order with `status: "paid"` and no payment.
5. **Order totals are trusted from the client.** `createOrder` charges whatever `total` the browser sends; nothing recomputes it server-side.
6. The webhook's Discord path overwrites `order.rzp = {}` before building the message, so the message has only `paymentMethod` from rzp data.
7. `/functions` is gitignored; edits there aren't versioned.
8. `.next/`, `tsconfig.tsbuildinfo`, `firestore-debug.log`, the xlsx and `shiprocket-serviceability-api-response.json` in the root are artifacts / scratch, not app code.
