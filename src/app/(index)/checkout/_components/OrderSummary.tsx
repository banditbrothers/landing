"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDownIcon, LockIcon, XIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel, Row } from "@/components/misc/Panel";
import { Kicker } from "@/components/typography/Kicker";
import { CouponInput } from "@/components/inputs/Coupon";
import { QuantityStepper } from "@/components/misc/QuantityStepper";
import { DangerBanner } from "@/components/misc/Banners";
import { useCart } from "@/components/stores/cart";
import { useVariants } from "@/hooks/useVariants";
import { SHIPPING_COST } from "@/constants/shipping";
import { CartItem } from "@/types/order";
import { ProductVariant } from "@/types/product";
import {
  getCartItemCount,
  getCartSubtotal,
  getFreeShippingProgress,
  getOrderTotal,
  getShippingCost,
} from "@/utils/cart";
import { getDiscountAmount, validateCouponInCart } from "@/utils/coupon";
import { formatCurrency } from "@/utils/price";
import { getProductVariantName, getProductVariantPrice, getSizeLabel, getSizeStock } from "@/utils/product";
import { routes } from "@/utils/routes";

export const formatItemCount = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/** Items whose variant is no longer listed are hidden and priced at 0, so they're never counted or ordered */
export const getOrderableCart = (cart: CartItem[], variants: ProductVariant[]) =>
  cart.filter(item => variants.some(v => v.id === item.variantId));

/** The receipt column: items, coupon, totals and (on desktop) the pay button */
export const OrderSummary = ({
  isInternational,
  payButton,
}: {
  isInternational: boolean;
  /** Pay button plus the "why it's disabled" hint */
  payButton: React.ReactNode;
}) => {
  const { cart, coupon, setCoupon, clearCoupon, updateCartItem, removeCartItem } = useCart();
  const { data: variants } = useVariants();
  const [open, setOpen] = useState(true);

  const orderableCart = getOrderableCart(cart, variants);
  const itemsLabel = formatItemCount(getCartItemCount(orderableCart));
  const subtotal = getCartSubtotal(cart, variants);
  const discount = getDiscountAmount(cart, variants, coupon);
  const shipping = getShippingCost(cart, variants, coupon);
  const total = getOrderTotal(cart, variants, coupon);
  const isShippingFree = shipping === 0;
  const freeShipping = getFreeShippingProgress(cart, variants, coupon);
  const { message: couponError } = validateCouponInCart(coupon, cart, variants);

  const couponInput = (
    <CouponInput
      coupon={coupon}
      cart={cart}
      variants={variants}
      onCouponApplied={setCoupon}
      onCouponRemoved={clearCoupon}
      onCouponError={toast.error}
    />
  );

  return (
    <aside className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 self-start w-full space-y-4">
      <div className="hidden lg:block">
        <Kicker>Your mischief</Kicker>
      </div>
      <Panel className="overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="lg:hidden w-full flex items-center justify-between px-5 py-4 text-sm">
          <span className="flex items-center gap-1.5 text-bandit-orange">
            Your mischief · {itemsLabel}
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
          <span className="font-calera text-2xl leading-none">{formatCurrency(total)}</span>
        </button>

        <div className={`${open ? "block" : "hidden"} lg:block px-5 pb-5 lg:pt-5`}>
          {orderableCart.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Your bag is empty.{" "}
              <Link href="/shop" className="text-bandit-orange hover:underline">
                Go loot →
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-border">
              {orderableCart.map(item => (
                <ReceiptItem
                  key={`${item.variantId}-${item.size}`}
                  variant={variants.find(v => v.id === item.variantId)!}
                  item={item}
                  updateCartItem={updateCartItem}
                  removeCartItem={removeCartItem}
                />
              ))}
            </div>
          )}

          {!isInternational && freeShipping && orderableCart.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground mb-2">
                {isShippingFree ? (
                  <>
                    🎉 <span className="text-bandit-orange font-medium">Free shipping</span> unlocked
                  </>
                ) : (
                  <>
                    Add <span className="text-bandit-orange font-medium">{formatCurrency(freeShipping.left)}</span> more
                    for free shipping
                  </>
                )}
              </p>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-bandit-orange transition-all"
                  style={{ width: `${isShippingFree ? 100 : freeShipping.pct}%` }}
                />
              </div>
            </div>
          )}

          {orderableCart.length > 0 && (
            <div className="mt-4">
              {coupon ? (
                couponInput
              ) : (
                <details className="group">
                  <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 w-fit">
                    Have a coupon code?
                  </summary>
                  <div className="mt-3">{couponInput}</div>
                </details>
              )}
            </div>
          )}

          <div className="border-t border-dashed border-border mt-4 pt-3">
            <Row label={`Subtotal · ${itemsLabel}`}>{formatCurrency(subtotal)}</Row>
            {coupon && discount > 0 && (
              <Row label="Discount">
                <span className="text-bandit-orange">−{formatCurrency(discount)}</span>
              </Row>
            )}
            {isInternational ? (
              <Row label="Shipping + duties">
                <span className="text-muted-foreground">Quoted by email</span>
              </Row>
            ) : (
              <Row label="Shipping">
                {isShippingFree ? (
                  <>
                    <span className="text-muted-foreground line-through mr-1.5">{formatCurrency(SHIPPING_COST)}</span>
                    <span className="text-bandit-orange font-semibold">FREE</span>
                  </>
                ) : (
                  formatCurrency(shipping)
                )}
              </Row>
            )}
          </div>

          <div className="border-t border-dashed border-border mt-3 pt-4 flex justify-between items-baseline gap-4">
            <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
              {isInternational ? "Items total" : "Total"}
            </span>
            <span className="font-calera text-5xl leading-none">
              {formatCurrency(isInternational ? subtotal - discount : total)}
            </span>
          </div>
          {!isInternational && <p className="text-xs text-muted-foreground text-right mt-1">Incl. of all taxes</p>}

          {!!couponError && (
            <div className="mt-4">
              <DangerBanner message={couponError} />
            </div>
          )}

          <div className="hidden lg:block mt-5">{payButton}</div>

          {!isInternational && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
              <LockIcon className="w-3.5 h-3.5" /> Secured by Razorpay · UPI, cards, netbanking
            </p>
          )}
        </div>
      </Panel>

      <div className="hidden lg:grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="rounded-2xl border border-border p-3.5">
          <p className="text-sm text-foreground font-medium">Dispatch in 8–14 days</p>
          Tracking lands in your inbox.
        </div>
        <div className="rounded-2xl border border-border p-3.5">
          <p className="text-sm text-foreground font-medium">All sales final</p>
          Double-check sizes before paying.
        </div>
      </div>
    </aside>
  );
};

const ReceiptItem = ({
  variant,
  item,
  updateCartItem,
  removeCartItem,
}: {
  variant: ProductVariant;
  item: CartItem;
  updateCartItem: (variantId: string, quantity: number, size?: string) => void;
  removeCartItem: (variantId: string, size?: string) => void;
}) => {
  const name = getProductVariantName(variant, { includeProductName: true });
  const price = getProductVariantPrice(variant);
  const stock = getSizeStock(variant, item.size);

  return (
    <div className="flex gap-3 py-3 first:pt-0">
      <Link
        href={routes.variant(variant)}
        className="relative shrink-0 w-[68px] h-[68px] rounded-[14px] overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <Image
          width={68}
          height={68}
          src={variant.images.mockup[0]}
          alt={name}
          className="relative w-full h-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3">
          <p className="text-sm font-medium leading-snug">{name}</p>
          <span className="text-sm font-medium">{formatCurrency(price * item.quantity)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {getSizeLabel(item.size)} · {formatCurrency(price)}
        </p>
        {stock !== undefined && item.quantity > stock && (
          <p className="text-destructive text-xs font-medium mt-1">
            {stock === 0 ? "Out of stock, please remove it" : `Only ${stock} left, please reduce the quantity`}
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <QuantityStepper
            quantity={item.quantity}
            max={stock}
            increment={() => updateCartItem(variant.id, 1, item.size)}
            decrement={() => updateCartItem(variant.id, -1, item.size)}
          />
          <button
            type="button"
            onClick={() => removeCartItem(variant.id, item.size)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <XIcon className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};
