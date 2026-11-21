"use client";

import { Button } from "../ui/button";

import { closeCart, closeCartForNavigation, useCart, useIsCartOpen } from "@/components/stores/cart";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { CheckoutProductCard } from "../cards/CheckoutProductCard";
import { useRouter } from "next/navigation";
import { RUNNING_COUPON } from "@/components/typography/coupons";
import { formatCurrency } from "@/utils/price";
import { useVariants } from "@/hooks/useVariants";
import { cartHasStockIssue, getCartSubtotal, getFreeShippingProgress } from "@/utils/cart";
import { LoadingIcon } from "@/components/misc/Loading";
import { ArrowRight, Truck } from "lucide-react";

export const CartSheet = () => {
  const { cart: cartItems, coupon, updateCartItem, removeCartItem } = useCart();
  const isCartOpen = useIsCartOpen();
  const { data: variants, isReady } = useVariants();

  const subtotal = getCartSubtotal(cartItems, variants);
  const hasStockIssue = cartHasStockIssue(cartItems, variants);
  const freeShipping = getFreeShippingProgress(cartItems, variants, coupon);

  const router = useRouter();

  // Replace the cart's history entry, so back from checkout returns to this page
  const handleCheckout = () => {
    closeCartForNavigation();
    router.replace("/checkout");
  };

  const cartContent =
    cartItems.length > 0 && !isReady ? (
      <div className="flex h-full items-center justify-center py-4">
        <LoadingIcon />
      </div>
    ) : (
      <div className="flex h-full flex-col py-4">
        {cartItems.length > 0 && freeShipping && (
          <div className="text-xs mb-3">
            <p className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-bandit-orange" />
              {freeShipping.unlocked ? (
                "Free shipping unlocked"
              ) : (
                <span>
                  <span className="text-bandit-orange">{formatCurrency(freeShipping.left)}</span> away from free
                  shipping
                </span>
              )}
            </p>
            <div className="h-1 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-bandit-orange transition-[width] duration-500"
                style={{ width: `${freeShipping.pct}%` }}
              />
            </div>
          </div>
        )}
        <RUNNING_COUPON.CartMessageElement />

        {cartItems.map(item => {
          const variant = variants.find(v => v.id === item.variantId);
          if (!variant) return null;

          return (
            <CheckoutProductCard
              key={`${variant.id}-${item.size}`}
              variant={variant}
              quantity={item.quantity}
              size={item.size}
              updateCartItemBy={updateCartItem}
              removeCartItem={removeCartItem}
            />
          );
        })}

        {cartItems.length === 0 && (
          <div className="text-center text-muted h-full flex items-center justify-center">
            {/* Literal caps: Calera's lowercase set has filled counters */}
            <p className="font-calera text-4xl leading-[0.95] sm:text-6xl flex flex-col gap-1">
              {"“NO BANDIT SHOULD BE WITHOUT ANY LOOT”".split(" ").map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
        )}
        {/* {cartItems.length > 0 && (
          <span className="">
            <p className="text-muted-foreground text-xs text-center leading-normal">
              <BULK_BUY_COUPON.CartMessage />
            </p>
          </span>
        )} */}
      </div>
    );

  const cartFooter = (
    <div className="flex flex-col gap-2 w-full items-center pt-4">
      <div className="w-full text-sm">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-muted-foreground text-xs uppercase tracking-[0.12em]">Subtotal</span>
          <span className="font-calera text-2xl">{formatCurrency(subtotal)}</span>
        </div>
        <p className="text-muted-foreground text-xs mb-2">Shipping and coupons at checkout</p>
      </div>
      <Button
        disabled={cartItems.length === 0 || !isReady || hasStockIssue}
        className="w-full h-12 rounded-xl bg-bandit-orange text-black text-base hover:bg-bandit-orange hover:brightness-110"
        onClick={handleCheckout}>
        Checkout <ArrowRight className="w-4 h-4" />
      </Button>
      <Button variant="ghost" className="w-full text-muted-foreground" onClick={closeCart}>
        Continue shopping
      </Button>
    </div>
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-[420px] p-4 sm:p-6">
        <div className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-calera text-3xl sm:text-4xl font-normal leading-none text-left">
              YOUR LOOT
              {cartItems.length > 0 && (
                <span className="text-bandit-orange text-lg align-middle ml-2">
                  ({cartItems.reduce((n, i) => n + i.quantity, 0)})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{cartContent}</div>
          {cartFooter}
        </div>
      </SheetContent>
    </Sheet>
  );
};
