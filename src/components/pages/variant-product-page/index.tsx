"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellIcon, DropletsIcon, HeartIcon, MoveHorizontalIcon, Share2Icon, SunIcon, TruckIcon } from "lucide-react";

import { LoadingScreen } from "@/components/misc/Loading";
import { useCart } from "@/components/stores/cart";
import { useFavorites } from "@/components/stores/favorites";
import { ShopCard, Sticker, isNewDrop, useAddToCart } from "@/components/cards/ShopCard";
import { familyOf } from "@/components/layouts/ProductGridLayout";
import { FitTitle } from "@/components/typography/FitTitle";
import { Rail } from "@/components/pages/home/product-library/ProductLibrarySection";
import { WAYS } from "@/components/pages/home/how-to-wear/HowToWearSection";
import { SizingDialog } from "@/components/dialogs/SizingDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NotifyMeDialog } from "@/components/dialogs/NotifyMeDialog";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { StarRating } from "@/components/misc/StarRating";
import { Scorecard } from "@/components/misc/Scorecard";
import type { RatingSummary } from "@/lib/reviews";
import { ReviewWithoutEmail } from "@/types/review";
import { useVariants } from "@/hooks/useVariants";
import { ProductVariant } from "@/types/product";
import {
  DESIGN_CATEGORIES_OBJ,
  DESIGNS_OBJ,
  getColorVariantIds,
  MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING,
  PRODUCTS,
  PRODUCTS_OBJ,
} from "@/data/products";
import { formatCurrency } from "@/utils/price";
import { getFreeShippingAmount } from "@/utils/cart";
import { shareVariant, getProductVariantUrl } from "@/utils/share";
import { shuffleArray } from "@/utils/misc";
import { trackVariantView } from "@/utils/analytics";
import { getWhatsappNeedHelpLink } from "@/utils/whatsappMessageLinks";
import {
  getFirstInStockSize,
  getProductVariantName,
  getProductVariantPrice,
  getSizeStock,
  isSizeInStock,
  isVariantOutOfStock,
  LOW_STOCK_THRESHOLD,
  sortOutOfStockLast,
} from "@/utils/product";

type ProductPageContentsProps = {
  designId: string;
  productId: string;
  /** Store-wide rating; null if reviews couldn't be fetched */
  rating: RatingSummary | null;
  /** Reviews from orders containing this design (0 → `reviews` are the latest store reviews) */
  reviewCount: number;
  reviews: ReviewWithoutEmail[];
  /** Variant ids most often bought alongside this design, best first */
  boughtWith: string[];
};

const PERKS = [
  { icon: DropletsIcon, text: "Quick-Dri DryFit" },
  { icon: SunIcon, text: "UV & dust shield" },
  { icon: MoveHorizontalIcon, text: "4-way stretch" },
  {
    icon: TruckIcon,
    text: MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
      ? `Free ship over ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}`
      : "Ships across India",
  },
];

const SectionHead = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="mb-6">
    <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2">{kicker}</p>
    {/* kicker sits outside the row so the action centers on the title alone */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <h2 className="font-calera uppercase leading-[0.9] text-[clamp(2.5rem,5vw,4rem)]">{title}</h2>
      {children}
    </div>
  </div>
);

export const ProductPageContents = ({
  designId,
  productId,
  rating,
  reviewCount,
  reviews,
  boughtWith,
}: ProductPageContentsProps) => {
  const { data: variants, isReady } = useVariants();
  const router = useRouter();
  const { isFavorite, toggleFav } = useFavorites();
  const { cart, coupon } = useCart();
  const addToCart = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("one-size");
  const [imageIndex, setImageIndex] = useState(0);
  const [isSizingDialogOpen, setIsSizingDialogOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [moreLikeThis, setMoreLikeThis] = useState<ProductVariant[]>([]);
  const slider = useRef<HTMLDivElement>(null);

  const variant = variants.find(v => v.designId === designId && v.productId === productId);

  useEffect(() => {
    if (!isReady || variant) return;
    toast.error("That product isn't around anymore", { description: "Here's everything that is." });
    router.replace(`/shop`);
  }, [isReady, variant, router]);

  // Initialize size: first in-stock size, else the first size.
  // Keyed on the variant id so a background refetch doesn't reset the customer's choice.
  useEffect(() => {
    if (!variant) return;
    const sizes = PRODUCTS_OBJ[variant.productId]?.sizes ?? [];
    if (sizes.length > 0) setSize(getFirstInStockSize(variant) ?? sizes[0]);
    setImageIndex(0);
    slider.current?.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id]);

  useEffect(() => {
    if (!variant) return;
    trackVariantView({
      productId: variant.productId,
      designId: variant.designId,
      variantId: variant.id,
      variantName: getProductVariantName(variant),
      price: getProductVariantPrice(variant),
    });
    // Keyed on the id: a catalog refetch makes a new object for the same variant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id]);

  // Shuffled after mount so server and client render the same markup
  useEffect(() => {
    if (!variant) return;
    setMoreLikeThis(
      sortOutOfStockLast(
        shuffleArray(variants.filter(v => v.id !== variant.id && v.productId === variant.productId && v.isAvailable))
      ).slice(0, 10)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id, variants]);

  // Units of the selected size the customer can still add (undefined = stock not tracked)
  const sizeStock = variant ? getSizeStock(variant, size) : undefined;
  const quantityInCart = cart.find(item => item.variantId === variant?.id && item.size === size)?.quantity ?? 0;
  const maxAddable = sizeStock === undefined ? undefined : Math.max(0, sizeStock - quantityInCart);

  // Keep the selected quantity within what's left when size/stock changes
  useEffect(() => {
    if (maxAddable !== undefined && maxAddable > 0) setQuantity(q => Math.min(q, maxAddable));
  }, [maxAddable]);

  if (!variant) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  const name = getProductVariantName(variant);
  const price = getProductVariantPrice(variant);
  const design = DESIGNS_OBJ[variant.designId];
  const product = PRODUCTS_OBJ[variant.productId];
  const soldOut = sizeStock === 0;
  const canAdd = !soldOut && maxAddable !== 0;

  const images = variant.images.mockup;

  const colourIds = getColorVariantIds(variant.designId);
  const colourways = variants
    .filter(v => v.productId === productId && colourIds.includes(v.designId))
    .sort((a, b) => DESIGNS_OBJ[a.designId].name.localeCompare(DESIGNS_OBJ[b.designId].name));
  const shade = name.includes(" - ") ? name.split(" - ").slice(1).join(" - ") : name;

  // Same design (or same colour family) in the other gear types
  const kit = PRODUCTS.filter(p => p.id !== productId)
    .map(
      p =>
        variants.find(v => v.productId === p.id && v.designId === variant.designId) ??
        variants.find(v => v.productId === p.id && familyOf(v.designId) === familyOf(variant.designId))
    )
    .filter((v): v is ProductVariant => !!v && v.images.mockup.length > 0);

  const kitIds = new Set(kit.map(v => v.id));
  const alsoBought = sortOutOfStockLast(
    boughtWith.map(id => variants.find(v => v.id === id)).filter((v): v is ProductVariant => !!v && !kitIds.has(v.id))
  ).slice(0, 10);

  const cartTotal = getFreeShippingAmount(cart, variants, coupon);
  const freeShipLeft =
    MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null ? null : MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING - cartTotal;

  const goToImage = (i: number) => {
    const el = slider.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const colourPicker = (
    <>
      <div className="flex justify-between items-baseline text-sm mb-3">
        <span>
          Colourway: <b className="font-semibold">{shade}</b>
        </span>
        <span className="text-[13px] text-muted-foreground">{colourways.length} options</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colourways.map(c => (
          <Link
            key={c.id}
            href={getProductVariantUrl(c)}
            replace
            scroll={false}
            title={`${getProductVariantName(c)}${isVariantOutOfStock(c) ? " (sold out)" : ""}`}
            aria-current={c.id === variant.id ? "true" : undefined}
            className={`relative w-[62px] aspect-square rounded-lg overflow-hidden border-2 transition hover:-translate-y-0.5 ${
              c.id === variant.id ? "border-bandit-orange" : "border-transparent"
            } ${isVariantOutOfStock(c) ? "opacity-40" : ""}`}>
            <Skeleton className="absolute inset-0 rounded-none" />
            <Image fill src={c.images.mockup[0]} alt={getProductVariantName(c)} sizes="62px" className="object-cover" />
          </Link>
        ))}
      </div>
    </>
  );

  const handleAddToCart = () => {
    if (!canAdd || (maxAddable !== undefined && quantity > maxAddable)) return;
    addToCart(variant, size, quantity, { openCart: true });
  };

  const primaryAction = soldOut ? () => setIsNotifyDialogOpen(true) : handleAddToCart;
  const isJerseyBatch = productId === "jersey" && ["ddlj-2-white", "ddlj-2-black"].includes(designId);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-24 md:pb-0">
      <nav
        className="text-[13px] text-muted-foreground flex flex-wrap gap-2 pt-4 relative z-10"
        aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span className="opacity-50">/</span>
        <Link href={`/shop/${productId}`} className="hover:text-foreground">
          {product.name}s
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-7 lg:gap-14 pt-5 pb-10 items-start">
        {/* Gallery: swipeable on touch, thumbnails beside it on desktop */}
        <div className="grid md:grid-cols-[84px_1fr] gap-3.5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 min-w-0">
          <div className="hidden md:flex flex-col gap-2.5 order-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => goToImage(i)}
                className={`relative shrink-0 w-16 md:w-full aspect-square rounded-lg overflow-hidden border-2 transition ${
                  i === imageIndex
                    ? "border-bandit-orange opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}>
                <Skeleton className="absolute inset-0 rounded-none" />
                <Image fill src={src} alt="" sizes="84px" className="object-cover" />
              </button>
            ))}
          </div>

          <div className="relative aspect-square rounded-3xl overflow-hidden bg-card order-1 md:order-2">
            <div
              ref={slider}
              onScroll={e => setImageIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
              className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((src, i) => (
                <div key={src} className="relative w-full h-full shrink-0 snap-center">
                  <Skeleton className="absolute inset-0 rounded-none" />
                  <Image
                    fill
                    src={src}
                    alt={i === 0 ? getProductVariantName(variant, { includeProductName: true }) : ""}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {soldOut && <CrimeTape />}
            <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
              {variant.isBestSeller && <Sticker>Most wanted</Sticker>}
              {isNewDrop(variant) && <Sticker tone="light">New drop</Sticker>}
            </div>
            {images.length > 1 && (
              <div className="md:hidden absolute bottom-4 inset-x-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => goToImage(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${i === imageIndex ? "bg-bandit-orange w-5" : "bg-white/60 w-2"}`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <span className="hidden md:inline absolute bottom-4 right-4 text-xs px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white">
                {imageIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </div>

        {/* Mobile: colourways right under the image; desktop shows them in the buy box */}
        {colourways.length > 1 && <div className="md:hidden -mt-3">{colourPicker}</div>}

        {/* Buy box */}
        <div className="min-w-0">
          <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
            {product.name} · {DESIGN_CATEGORIES_OBJ[design.category]?.name}
          </span>
          <FitTitle
            as="h1"
            text={name}
            max="clamp(3rem, 12vw, 5.75rem)"
            className="font-calera uppercase leading-[0.9] mt-3 mb-3">
            {name}
            {/* The eyebrow above shows the product type; search engines read it as part of the title */}
            <span className="sr-only"> {product.name}</span>
          </FitTitle>
          <div className="flex flex-col items-start gap-1.5 md:flex-row md:flex-wrap md:items-center md:gap-x-4 text-sm text-muted-foreground">
            {rating && rating.count > 0 && (
              <span className="flex items-center gap-2">
                <StarRating value={Math.round(rating.average)} className="[&_svg]:w-3.5 [&_svg]:h-3.5" />
                {rating.average.toFixed(1)} store rating
              </span>
            )}
            <a
              href={reviews.length ? "#reviews" : "/reviews"}
              className="underline underline-offset-4 hover:text-foreground">
              {reviewCount
                ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} from orders with this design`
                : "See what bandits are saying"}
            </a>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <b className="text-4xl font-semibold">{formatCurrency(price)}</b>
            <span className="text-sm text-muted-foreground">incl. of all taxes</span>
          </div>

          {freeShipLeft !== null && (
            <div className="mt-4 mb-7 p-4 rounded-xl bg-card border border-border text-sm">
              {freeShipLeft > 0 ? (
                <>
                  Add <b className="text-bandit-orange">{formatCurrency(freeShipLeft)}</b> more for <b>free shipping</b>
                </>
              ) : (
                <>
                  <b className="text-bandit-orange">Free shipping unlocked</b> with this in your cart
                </>
              )}
              <div className="h-1.5 rounded-full bg-border mt-2.5 overflow-hidden">
                <i
                  className="block h-full bg-gradient-to-r from-[#ff9a3d] to-bandit-orange transition-[width] duration-500"
                  style={{ width: `${Math.min(100, (cartTotal / (MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING ?? 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {isJerseyBatch && (
            <div className="mb-7 p-4 rounded-xl border border-bandit-orange/40 bg-bandit-orange/10 text-sm flex items-center justify-between gap-3">
              <span>
                Orders for this product are processed in batches on the <b>1st of every month</b>.
              </span>
              <a href={getWhatsappNeedHelpLink()} target="_blank" className="shrink-0 underline underline-offset-4">
                Need help?
              </a>
            </div>
          )}

          {colourways.length > 1 && <div className="hidden md:block mb-7">{colourPicker}</div>}

          {product.sizes.length > 1 && (
            <>
              <div className="flex justify-between items-baseline text-sm mb-3">
                <span>
                  Size: <b className="font-semibold">{(product.sizeLabels?.[size] ?? size).split(" - ")[0]}</b>
                </span>
                {productId === "jersey" ? (
                  <button
                    type="button"
                    onClick={() => setIsSizingDialogOpen(true)}
                    className="text-[13px] text-muted-foreground underline underline-offset-4">
                    Size guide
                  </button>
                ) : (
                  <span className="text-[13px] text-muted-foreground">Helmet XS–M? Go small.</span>
                )}
              </div>
              <div className={`grid gap-2.5 mb-7 ${product.sizes.length > 2 ? "grid-cols-4" : "grid-cols-2"}`}>
                {product.sizes.map(s => {
                  const out = !isSizeInStock(variant, s);
                  const [label, detail] = (product.sizeLabels?.[s] ?? s).split(" - ");
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={size === s}
                      onClick={() => setSize(s)}
                      className={`text-left px-4 py-3 rounded-xl border-[1.5px] transition ${
                        size === s
                          ? "border-bandit-orange bg-bandit-orange/10"
                          : "border-border hover:border-muted-foreground/60"
                      } ${out ? "opacity-45" : ""}`}>
                      <b className={`block ${out ? "line-through" : ""}`}>{label}</b>
                      <small className="text-[13px] text-muted-foreground">
                        {out
                          ? "Sold out"
                          : [detail && `${detail} head`, product.dimensions[s]].filter(Boolean).join(" · ")}
                      </small>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {soldOut && (
            <div className="mb-3.5 text-sm" role="status">
              <div className="flex items-center gap-2">
                <i className="w-2 h-2 rounded-full bg-[#E53935] shadow-[0_0_0_4px_rgba(229,57,53,.18)] animate-pulse motion-reduce:animate-none" />
                <span>
                  <b className="font-semibold text-[#ff8a80]">Looted.</b>{" "}
                  {product.sizes.length > 1 ? "This size is cleaned out." : "This one's cleaned out."}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1.5 ml-4">
                Request a restock and we&apos;ll tip you off when it&apos;s back.
              </p>
            </div>
          )}
          {!soldOut && maxAddable === 0 && (
            <div className="text-sm mb-3.5 text-muted-foreground">You already have all available units in your cart.</div>
          )}
          {!soldOut && maxAddable !== 0 && sizeStock !== undefined && sizeStock <= LOW_STOCK_THRESHOLD && (
            <div className="flex items-center gap-2 text-sm mb-3.5 text-amber-400" role="status">
              <i className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,.18)] animate-pulse motion-reduce:animate-none" />
              <span>
                <b className="font-semibold">Running low.</b> Only {sizeStock} left in this size
              </span>
            </div>
          )}

          <div className="flex gap-2.5">
            {canAdd && (
              <div className="flex items-center h-[54px] rounded-xl border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => q - 1)}
                  className="w-11 h-full text-xl text-muted-foreground disabled:opacity-40">
                  −
                </button>
                <span className="w-7 text-center font-semibold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={maxAddable !== undefined && quantity >= maxAddable}
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-full text-xl text-muted-foreground disabled:opacity-40">
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={primaryAction}
              disabled={!soldOut && !canAdd}
              className="flex-1 h-[54px] px-4 rounded-xl bg-bandit-orange text-black font-semibold inline-flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-50 whitespace-nowrap">
              {soldOut ? (
                <>
                  <BellIcon className="w-4 h-4" /> Request restock
                </>
              ) : (
                <>
                  Add to cart<span className="hidden sm:inline"> · {formatCurrency(price * quantity)}</span>
                </>
              )}
            </button>
            <button
              type="button"
              aria-label={isFavorite(variant.id) ? "Remove from favourites" : "Add to favourites"}
              onClick={() => toggleFav(variant.id)}
              className="grid place-items-center w-[54px] h-[54px] rounded-xl border border-border shrink-0">
              <HeartIcon
                className="w-5 h-5"
                suppressHydrationWarning
                fill={isFavorite(variant.id) ? "#fd6e00" : "none"}
                stroke={isFavorite(variant.id) ? "#fd6e00" : "currentColor"}
              />
            </button>
            <button
              type="button"
              aria-label="Share"
              onClick={() => shareVariant(variant)}
              className="hidden sm:grid place-items-center w-[54px] h-[54px] rounded-xl border border-border shrink-0">
              <Share2Icon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="p-3.5 rounded-xl bg-card text-center text-xs text-muted-foreground leading-snug">
                <Icon className="w-[22px] h-[22px] mx-auto mb-2 text-bandit-orange" />
                {text}
              </div>
            ))}
          </div>

          {/* Single + collapsible: opening one section closes the other */}
          <Accordion type="single" collapsible defaultValue="About this design" className="border-b border-border">
            <Detail title="About this design">
              {[variant.description, ...product.description].filter(Boolean).map(d => (
                <p key={d}>{d}</p>
              ))}
            </Detail>
            <Detail title="Material & size">
              <dl className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-foreground">Material</dt>
                <dd>{product.material}</dd>
                <dt className="text-foreground">Origin</dt>
                <dd>Made in India</dd>
                {Object.entries(product.dimensions).map(([s, dim]) => (
                  <div key={s} className="contents">
                    <dt className="text-foreground">{(product.sizeLabels?.[s] ?? s).split(" - ")[0]}</dt>
                    <dd>{dim}</dd>
                  </div>
                ))}
              </dl>
            </Detail>
            <Detail title="Wash & care">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Wash gently in cold water and let it drip dry in a breezy, shaded spot.</li>
                <li>No wringing, harsh chemicals, dry cleaning or dryers.</li>
                <li>
                  For tough stains, use a soft brush with mild pH-neutral soap, gently, to avoid pilling (not covered
                  under warranty).
                </li>
                <li>Air dry completely before storing it somewhere cool and shady.</li>
                <li>Unauthorised repairs or alterations void the warranty.</li>
              </ul>
            </Detail>
            <Detail title="Shipping & returns">
              <p>
                We ship within 8–10 business days.
                {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING !== null &&
                  ` Free shipping on orders above ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}.`}
              </p>
              <p>
                30-day returns on unused items in original packaging. Damaged or misprinted? Reach us on WhatsApp with
                an unboxing video showing the defect.
              </p>
            </Detail>
          </Accordion>
        </div>
      </div>

      {productId === "bandana" && (
        <section className="py-12 md:py-16">
          <SectionHead kicker="One tube, many looks" title="Wear it your way" />
          <div className="grid md:grid-cols-[1fr_2.4fr] gap-3.5">
            <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden bg-black">
              <Image
                fill
                src="/how-to-wear.webp"
                alt="How to wear your bandana"
                sizes="(min-width: 768px) 30vw, 100vw"
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {WAYS.slice(0, 6).map((way, i) => (
                <div
                  key={way}
                  className="min-h-[120px] md:min-h-[150px] p-4 md:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between transition hover:border-bandit-orange hover:-translate-y-0.5">
                  <span
                    className="font-calera text-5xl leading-none text-transparent"
                    style={{ WebkitTextStroke: "1px #fd6e00" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b>{way}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {kit.length > 0 && (
        <section className="py-12 md:py-16">
          <SectionHead kicker="Same print, other gear" title="Complete the kit" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-7 md:gap-5">
            {kit.map(v => (
              <ShopCard key={v.id} variant={v} showGearName />
            ))}
          </div>
        </section>
      )}

      {alsoBought.length > 0 && (
        <section className="py-12 md:py-16 -mx-4 md:-mx-8">
          <div className="px-4 md:px-8">
            <SectionHead kicker="Bought with this design" title="Bandits also grabbed" />
          </div>
          <Rail variants={alsoBought} />
        </section>
      )}

      {reviews.length > 0 && (
        <section id="reviews" className="py-12 md:py-16 scroll-mt-20">
          <SectionHead
            kicker={reviewCount ? "From orders with this design" : "From the whole crew"}
            title="Bandits say">
            <Link
              href="/reviews"
              className="text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit">
              All reviews →
            </Link>
          </SectionHead>
          <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-10 items-start">
            {rating && rating.count > 0 && <Scorecard rating={rating} />}
            {/* Masonry like /reviews: cards differ a lot in height (photo vs none) */}
            <div className="columns-1 sm:columns-2 xl:columns-3 gap-5">
              {reviews.map(r => (
                <div key={r.id} className="break-inside-avoid mb-5">
                  <ReviewCard review={r} currentVariantId={variant.id} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {moreLikeThis.length > 0 && (
        <section className="py-12 md:py-16 -mx-4 md:-mx-8">
          <div className="px-4 md:px-8">
            <SectionHead kicker={`More ${product.name.toLowerCase()}s`} title="More mischief">
              <Link
                href={`/shop/${productId}`}
                className="text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit md:mr-28">
                Shop all {product.name.toLowerCase()}s →
              </Link>
            </SectionHead>
          </div>
          <Rail variants={moreLikeThis} />
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur border-t border-border">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
          <Skeleton className="absolute inset-0 rounded-none" />
          <Image fill src={images[0]} alt="" sizes="44px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{name}</div>
          <div className="text-[13px] text-muted-foreground">{formatCurrency(price)}</div>
        </div>
        <button
          type="button"
          onClick={primaryAction}
          disabled={!soldOut && !canAdd}
          className="h-12 px-6 rounded-xl bg-bandit-orange text-black font-semibold disabled:opacity-50">
          {soldOut ? "Request restock" : "Add to cart"}
        </button>
      </div>

      {productId === "jersey" && (
        <SizingDialog open={isSizingDialogOpen} onClose={() => setIsSizingDialogOpen(false)} />
      )}
      <NotifyMeDialog
        open={isNotifyDialogOpen}
        onOpenChange={setIsNotifyDialogOpen}
        variantId={variant.id}
        variantName={getProductVariantName(variant, { includeProductName: true })}
        size={size}
      />
    </div>
  );
};

// Crime-scene tape slanted across the top of the image, scrolling "OUT OF STOCK"
const CrimeTape = () => (
  <div
    aria-label="Out of stock"
    role="img"
    className="absolute -inset-x-16 top-[9%] z-[1] -rotate-[7deg] pointer-events-none bg-bandit-red text-white border-y-[3px] border-black shadow-[0_8px_24px_rgba(0,0,0,.45)] overflow-hidden whitespace-nowrap">
    <div className="inline-flex animate-[marquee_18s_linear_infinite] motion-reduce:animate-none" aria-hidden>
      {[0, 1].map(k => (
        <span key={k} className="flex">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="font-calera text-xl md:text-2xl pt-1.5 pb-0.5 px-4 flex items-center gap-4">
              OUT OF STOCK <span className="text-base">✕</span>
            </span>
          ))}
        </span>
      ))}
    </div>
  </div>
);

const Detail = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <AccordionItem value={title} className="border-b-0 border-t border-border">
    <AccordionTrigger className="text-base font-semibold hover:no-underline">{title}</AccordionTrigger>
    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed space-y-2">{children}</AccordionContent>
  </AccordionItem>
);
