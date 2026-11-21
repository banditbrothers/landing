"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellIcon, ShareIcon } from "lucide-react";

import { SkeletonImage } from "@/components/misc/SkeletonImage";
import { Breadcrumb } from "@/components/misc/Breadcrumb";
import { FavoriteButton } from "@/components/misc/FavoriteButton";
import { LoadingScreen } from "@/components/misc/Loading";
import { StarRating } from "@/components/misc/StarRating";
import { FitTitle } from "@/components/typography/FitTitle";
import { SizingDialog } from "@/components/dialogs/SizingDialog";
import { NotifyMeDialog } from "@/components/dialogs/NotifyMeDialog";
import { useCart } from "@/components/stores/cart";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useVariants } from "@/hooks/useVariants";
import type { RatingSummary } from "@/lib/reviews";
import { ReviewWithoutEmail } from "@/types/review";
import { DEFAULT_SIZE, PRODUCTS_OBJ } from "@/data/products";
import { formatCurrency } from "@/utils/price";
import { getFreeShippingProgress } from "@/utils/cart";
import { shareVariant } from "@/utils/share";
import { trackVariantView } from "@/utils/analytics";
import { getWhatsappNeedHelpLink } from "@/utils/whatsappMessageLinks";
import {
  getFirstInStockSize,
  getProductVariantName,
  getProductVariantPrice,
  getSizeStock,
  isSizeInStock,
  LOW_STOCK_THRESHOLD,
} from "@/utils/product";
import { Gallery } from "./Gallery";
import { ColourPicker } from "./ColourPicker";
import { ProductDetails } from "./ProductDetails";
import { RelatedSections } from "./RelatedSections";
import { routes } from "@/utils/routes";

type ProductPageContentsProps = {
  designId: string;
  productId: string;
  /** Store-wide rating; null if reviews couldn't be fetched */
  rating: RatingSummary | null;
  /** Reviews from orders containing this design; `reviews` lists those first, then latest store reviews up to 6 */
  reviewCount: number;
  reviews: ReviewWithoutEmail[];
  /** Variant ids most often bought alongside this design, best first */
  boughtWith: string[];
};

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
  const { cart, coupon } = useCart();
  const addToCart = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [isSizingDialogOpen, setIsSizingDialogOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);

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
  const product = PRODUCTS_OBJ[variant.productId];
  const soldOut = sizeStock === 0;
  const canAdd = !soldOut && maxAddable !== 0;
  const freeShipping = getFreeShippingProgress(cart, variants, coupon);

  const handleAddToCart = () => {
    if (!canAdd || (maxAddable !== undefined && quantity > maxAddable)) return;
    addToCart(variant, size, quantity, { openCart: true });
  };

  const primaryAction = soldOut ? () => setIsNotifyDialogOpen(true) : handleAddToCart;
  const isJerseyBatch = productId === "jersey" && ["ddlj-2-white", "ddlj-2-black"].includes(designId);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-24 md:pb-0">
      <Breadcrumb
        className="relative z-10"
        items={[
          { label: "Shop", href: "/shop" },
          { label: `${product.name}s`, href: routes.product(productId) },
          { label: name },
        ]}
      />

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-7 lg:gap-14 pt-5 pb-10 items-start">
        <Gallery variant={variant} soldOut={soldOut} />

        {/* Mobile: colourways right under the image; desktop shows them in the buy box */}
        <ColourPicker variant={variant} className="md:hidden -mt-3" />

        {/* Buy box */}
        <div className="min-w-0">
          <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">{product.name}</span>
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

          {freeShipping && (
            <div className="mt-4 mb-7 p-4 rounded-xl bg-card border border-border text-sm">
              {!freeShipping.unlocked ? (
                <>
                  Add <b className="text-bandit-orange">{formatCurrency(freeShipping.left)}</b> more for{" "}
                  <b>free shipping</b>
                </>
              ) : (
                <>
                  <b className="text-bandit-orange">Free shipping unlocked</b> with this in your cart
                </>
              )}
              <div className="h-1.5 rounded-full bg-border mt-2.5 overflow-hidden">
                <i
                  className="block h-full bg-gradient-to-r from-[#ff9a3d] to-bandit-orange transition-[width] duration-500"
                  style={{ width: `${freeShipping.pct}%` }}
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

          <ColourPicker variant={variant} className="hidden md:block mb-7" />

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
            <div className="text-sm mb-3.5 text-muted-foreground">
              That&apos;s all the loot there is, and it&apos;s already in your cart.
            </div>
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
            <FavoriteButton
              variantId={variant.id}
              className="grid place-items-center w-[54px] h-[54px] rounded-xl border border-border shrink-0"
              iconClassName="w-5 h-5"
            />
            <button
              type="button"
              aria-label="Share"
              onClick={() => shareVariant(variant)}
              className="hidden sm:grid place-items-center w-[54px] h-[54px] rounded-xl border border-border shrink-0">
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>

          <ProductDetails variant={variant} product={product} />
        </div>
      </div>

      <RelatedSections
        variant={variant}
        product={product}
        rating={rating}
        reviewCount={reviewCount}
        reviews={reviews}
        boughtWith={boughtWith}
      />

      {/* Mobile sticky buy bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur border-t border-border">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
          <SkeletonImage fill src={variant.images.mockup[0]} alt="" sizes="44px" className="object-cover" />
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
