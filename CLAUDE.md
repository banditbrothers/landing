# Bandit Brothers — Agent Guide

E-commerce site for Bandit Brothers (bandanas, balaclavas, jerseys; India-first, INR). Live at https://www.banditbrothers.in.
One Next.js app holds the **storefront**, the **admin panel** (`/admin`), and the **backend** (server actions + the Razorpay webhook route). A small Firebase Cloud Functions project lives in `functions/`.

## Stack

- Next.js 16 App Router, React 19, TypeScript, `yarn` (v1). `yarn dev` (turbopack), `yarn build`, `yarn lint` (ESLint 9 flat config from `eslint-config-next`, `eslint.config.mjs`). No test suite.
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
      shop/                    /shop, /shop/[productId], /shop/[productId]/[designId] (variant page); old /products/* 308s here
      checkout/page.tsx        checkout (/order 308s here) (the biggest file, ~840 lines)
      order/[orderId]/         order status page; /review = customer review form
      reviews/page.tsx         public reviews: all approved reviews rendered from the server cache (lib/reviews.ts), revealed 12 at a time
      admin/                   admin panel (see below)
      contact|refunds|shipping/  info pages; inside (index) so the navbar cart and search work
    api/rzpWebhook/route.ts    Razorpay webhook (marks orders paid/failed)
    privacy|terms/             legal pages (navbar shows the wordmark only)
    sitemap.ts                 built from the live catalog (available variants only)
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
  - `isActive: false` (jersey today) hides a whole product type: `getCatalog()` drops its variants, `/shop/<id>` 404s, orders are rejected. Storefront lists use `ACTIVE_PRODUCTS`; keep `PRODUCTS`/`PRODUCTS_OBJ` for lookups (old orders, reviews, admin). Order and review pages load their variants with `getVariantsByIds`, not the catalog.
- `Design` (artwork, e.g. `tri-harder`): name, colors, category, tags. **Static** in `src/data/products.ts`.
- `ProductVariant` = Product x Design, **in Firestore** `variants`. Doc id = SKU from `getSKU(productId, designId)` → e.g. `BANDANA-TRI_HARDER` (uppercase, `-` → `_`). Holds images, optional `price` override, `name` override, `stock` (size → units; missing = not tracked), `isAvailable`, `isBestSeller`, `createdAt`.
  - Price = `variant.price ?? PRODUCTS_OBJ[productId].basePrice` (`utils/product.ts`).
  - Name = `variant.name ?? DESIGNS_OBJ[designId].name`.
  - `isAvailable === false` → hidden everywhere (the catalog query filters it out), and orders containing it are rejected.
  - Size labels come from `PRODUCTS[].sizeLabels` via `getSizeLabel()`.
- **To add a new design:** add it to `DESIGNS` in `data/products.ts` (deploy), then create the variant in admin → Products. A variant whose designId isn't in `DESIGNS` will crash `DESIGNS_OBJ[...]` lookups.

Firestore collections (`constants/collections.ts`):

| Collection | Doc | Notes |
|---|---|---|
| `orders` (prod) / `orders-dev` (dev) | `Order` | `status`: initiated → paid / payment-failed / cancelled / admin-cancelled. `paymentMode` discriminates `rzp` / `cash` / `manual`. Amounts in **rupees**, except `rzp.amount` and `cash.amount` in **paise**. `variants[].price` = unit price paid (orders before Nov 2026 lack it, and many early ones lack `size` and `referralSource`; display code must tolerate that). |
| `coupons` / `coupons-dev` | `Coupon` | `code` stored uppercase, looked up by `where("code","==")`. `discountType` fixed\|percentage, `applicableVariants` ([] = all). |
| `reviews` | `Review` | `source`: website (has orderId, variantIds) or google. `status` pending/approved/rejected; only approved are public. |
| `variants` | `ProductVariant` | see above |

All timestamps are **unix seconds** (`utils/timestamp.ts` `getTimestamp()`), not ms, not Firestore Timestamps.
"Dev" = `NODE_ENV !== "production"` (`utils/misc.ts` `isProduction`), i.e. `yarn dev` hits the **real Firestore project** with suffixed collection names. `reviews` and `variants` are shared between dev and prod.

## Storefront flows

**Browsing.** The `(index)` layout renders the catalog server-side (`lib/catalog.ts`, `unstable_cache`, busted by `revalidateCatalog()` on variant/stock writes) into `useVariants()` (TanStack, key `["variants"]`, 15 min stale, refetches via the `fetchCatalog` action). Product grid (`components/layouts/ProductGridLayout.tsx`) filters client-side by colour/best-seller/favourites/in-stock and sorts, all read straight from URL search params (`useSearchParams`). Variant page (`/shop/[productId]/[designId]`) builds SEO metadata server-side from Firestore (cached 24h via `unstable_cache`) and renders client-side; it redirects to `/shop` if the variant isn't found.

**Cart.** `components/stores/cart.ts`: items are `{variantId, size, quantity}` + an applied `coupon`. Bumping `LATEST_CART_VERSION` in `app/(index)/IndexClientLayout.tsx` wipes every visitor's cart on next load; do it when the cart shape changes.

**Checkout** (`app/(index)/checkout/page.tsx`):
1. react-hook-form + zod form (name, email, phone, address, referral source). Indian pincodes are checked against the selected state via api.postalpincode.in (`lib/pincode.ts`); if that API is down the check is skipped.
2. Totals are computed **in the browser**: subtotal (`utils/cart.ts`) − coupon discount (`utils/coupon.ts`) + shipping (₹100, free when total ≥ `MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING` = ₹700).
3. Payment mode: international (country ≠ IN) → `manual`; coupon with `cashAndFreeShipping` (set server-side by `getCoupon` when the code == `CASH_AND_FREE_SHIPPING_COUPON_CODE`) → `cash` (also free shipping); else `rzp`. `createOrder` decides this again on the server.
4. `createOrder` server action writes the order. For `rzp` it also creates a Razorpay order with `notes.dbId = <firestore id>`. For `cash`/`manual` it posts to Discord immediately.
5. `rzp`: Razorpay Checkout modal (`components/payments/RazorpayGateway.tsx`). Dismiss → order set `cancelled`. Success → cart cleared, redirect home. The **webhook**, not the client, marks the order `paid`.
6. `manual` (international): customer sees a dialog; admin later sets real shipping and sends a Razorpay payment link (see admin).

**Razorpay webhook** (`app/api/rzpWebhook/route.ts`): verifies `X-Razorpay-Signature` with `RZP_WEBHOOK_SECRET`, reads `notes.dbId`.
- `payment.captured` → updates `rzp.*`, `status: "paid"`, posts a Discord order message (or "payment link paid" for international).
- `payment.failed` → `status: "payment-failed"` unless already paid.

**Reviews.** Customer opens `/order/[orderId]/review` (link usually sent from admin via WhatsApp). Signs in to Firebase anonymously, uploads one photo to **Firebase Storage** at `reviews/{reviewId}/0.<ext>`. `createReview` takes only the customer's text, rating and photo URL; it reads email/variants from the order, always writes `pending`, refuses a second review per order, sets `order.reviewId` and posts to the Discord reviews channel. Admin approves → appears on `/reviews` and variant pages (`lib/reviews.ts`, which strips `email`).

**Home page** sections (`components/pages/home/*`): hero, product library, how-to-wear, testimonials (3 hand-picked reviews hard-coded in `TestimonialsSection.tsx`), know-your-product (`data/know-your-product.ts`), Instagram feed (`lib/instagram.ts` server action, cached 1h).

## Admin panel (`/admin`)

`app/(index)/admin/page.tsx`, client component, desktop only. Login: `adminLogin` (`actions/admin.ts`) checks `ADMIN_PASSWORD` on the server and sets a signed httpOnly `admin_session` cookie (30 days, `lib/admin-auth.ts`). Every admin-only action starts with `await requireAdmin()`. Four tabs, each fetching through server actions with local `useState` (no TanStack):

- **Orders** (`OrderManagement.tsx`): latest 50 non-cancelled orders, filter by name/phone/date client-side, 10 per page. Order details dialog, WhatsApp review-request link, and for international orders `InternationalOrderPaymentDialog`: edit subtotal/shipping/discount → `createPaymentLinkForInternationalOrder` (one server call: saves the amounts, cancels the previous link stored in `order.paymentLink`, creates a new Razorpay link for the new total, copied to clipboard). The webhook marks it paid when the customer pays.
- **Coupons** (`CouponManagement.tsx`): create (code uppercased, expiry = end of day IST, optional variant restriction), toggle `isActive`.
- **Reviews** (`ReviewManagement.tsx`): latest 10 reviews, approve/reject.
- **Products** (`ProductsManagement.tsx` + `components/dialogs/AddVariantDialog.tsx`, `EditVariantDialog.tsx`): create/edit/delete variants. Image upload: browser converts to WebP + compresses (`utils/image.ts`), uploads through the admin-only `uploadToS3` server action (`utils/s3Upload.ts`, key `{productId}/{designId}/mockup-{ms}.webp`), new URL is appended to `images.mockup`. Both dialogs reorder/remove images via `MockupImageGrid.tsx` (first = cover); nothing is written until Save.

## Backend (server actions)

All in `src/actions/`, marked `"use server"`, using the admin SDK (bypasses Firestore rules):

- `orders.ts`: getOrders, getOrder, createOrder, cancelOrder; `admin.ts`: adminLogin, checkAdminSession
- `coupons.ts`: validateCoupon, getCoupon, getCoupons, addCoupon, updateCoupon
- `reviews.ts`: createReview, getReviewsAdmin, updateReview (public approved reviews come from `lib/reviews.ts`)
- `products.ts`: getVariantsAdmin, createVariant, updateVariant, deleteVariant
- `payments/rzp.ts`: createPaymentLinkForInternationalOrder (admin). Razorpay order creation lives in `lib/razorpay.ts` (server-only)
- `discord.ts`: sendDiscordOrderMessage / sendDiscordReviewMessage (bot token, hardcoded channel IDs; dev uses a separate orders channel). Message bodies built in `utils/discordMessages.ts`.

## Cloud Functions (`functions/`)

Separate package (Node 22, `firebase-functions` v2), deployed with `firebase deploy --only functions`. Emulators: `cd functions && npm run emulate` (imports `localfirestoreinit/`). Env: `functions/.env` with `SERVICE_ACCOUNT_ADMIN`.
- `onReviewDeleted`: on `reviews/{id}` delete → remove `reviewId` from the order, delete `reviews/{id}/*` in Firebase Storage.
- `syncGoogleReviews`: scheduled every 2 days, **currently an empty stub**.

Note: root `.gitignore` contains `/functions`, so this code is **not in git**.

## Environment variables (`.env`, never commit)

`FIREBASE_SERVICE_ACCOUNT_ADMIN` (JSON string), `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_PROJECT_ID`, `NEXT_PUBLIC_RZP_KEY_ID`, `RZP_KEY_SECRET`, `RZP_WEBHOOK_SECRET`, `DISCORD_TOKEN`, `DISCORD_ORDER_CHANNEL_ID`, `DISCORD_REVIEW_CHANNEL_ID`, `DISCORD_STOCK_NOTIFICATIONS_CHANNEL_ID` (prod only; dev uses a hardcoded test channel), `NEXT_PUBLIC_POSTHOG_KEY/HOST`, `ADMIN_PASSWORD`, `INSTAGRAM_USER_ID` + `INSTAGRAM_ACCESS_TOKEN` (Meta System User token, never expires; Facebook Graph API), `S3_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY/S3_BUCKET` (not `AWS_*`: Vercel reserves those), `CASH_AND_FREE_SHIPPING_COUPON_CODE` (server only; `getCoupon` sets `coupon.cashAndFreeShipping`), `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` (WhatsApp Cloud API; `actions/whatsapp.ts` sends the approved `order_confirmation` and `review_request` templates), `CRON_SECRET` (Vercel Cron sends it as a Bearer token to `/api/cron/review-requests`, scheduled in `vercel.json`; unset = every run 401s). `.env.development` overrides Razorpay to test keys for `yarn dev`.

## Conventions

- New Firestore reads/writes go in `src/actions/*` as server actions; reference collections via `Collections.*`, never string literals.
- Money in rupees in app code; multiply by 100 only at the Razorpay boundary.
- Timestamps: `getTimestamp()` (seconds).
- Images allowed by `next/image` must be listed in `next.config.ts` `remotePatterns` (S3 bucket, Firebase Storage, Instagram CDN).
- Prettier config in `.prettierrc`. `/designs/*` and `/products/*` permanently redirect to `/shop`.
- Analytics events go through `utils/analytics.ts` / `utils/metaPixel.ts`.

## Gotchas and known risks

Read these before touching payments, admin, or data.

1. **Keep dev off prod orders.** `Collections.orders` must stay `"orders-dev"` in dev; it has been temporarily flipped to `"orders"` before. Check `constants/collections.ts` before running checkout locally.
2. **Server actions are public POST endpoints.** Admin-only ones must call `await requireAdmin()` first; public ones (createOrder, cancelOrder, getOrder, validateCoupon, createReview, createStockNotification...) must validate input and trust nothing from the client. Server-internal helpers go in `server-only` modules (`lib/razorpay.ts`, `actions/stock.ts`...), not `"use server"` files.
3. **Order totals are computed on the server.** `createOrder` takes only customer details, cart lines and a coupon code; prices, discount, shipping, total, payment mode and status come from `utils/cart.ts` + Firestore. The webhook refuses to mark an order paid if the payment is below `order.total`.
4. **Never prefix a secret with `NEXT_PUBLIC_`**: it ships in the client bundle.
5. Admin login has no rate limit, so `ADMIN_PASSWORD` must be long and random.
6. The webhook only posts to Discord the first time an order turns `paid` (Razorpay retries webhooks). `actions/discord.ts` and `actions/stock.ts` are `server-only`, not `"use server"`, so they aren't public endpoints; keep it that way.
7. `/functions` is gitignored; edits there aren't versioned.
8. `.next/`, `tsconfig.tsbuildinfo`, `firestore-debug.log`, the xlsx and `shiprocket-serviceability-api-response.json` in the root are artifacts / scratch, not app code.
