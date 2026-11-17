"use client";

import { Button } from "../ui/button";

import { useCart } from "@/components/stores/cart";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { CheckoutProductCard } from "../cards/CheckoutProductCard";
import { useRouter } from "next/navigation";
import { RUNNING_COUPON } from "@/components/typography/coupons";
import { formatCurrency } from "@/utils/price";
import { useVariants } from "@/hooks/useVariants";
import { getCartSubtotal } from "@/utils/cart";
import { LoadingIcon } from "@/components/misc/Loading";
import { exceedsStock } from "@/utils/product";

export const CartSheet = () => {
  const { cart: cartItems, isCartOpen, closeCart, updateCartItem, removeCartItem } = useCart();
  const { data: variants, isReady } = useVariants();

  const subtotal = getCartSubtotal(cartItems, variants);
  const hasStockIssue = cartItems.some(item => {
    const variant = variants.find(v => v.id === item.variantId);
    return !!variant && exceedsStock(variant, item.size, item.quantity);
  });

  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
    closeCart();
  };

  const cartContent =
    cartItems.length > 0 && !isReady ? (
      <div className="flex h-full items-center justify-center py-4">
        <LoadingIcon />
      </div>
    ) : (
      <div className="flex h-full flex-col gap-4 py-4">
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
          <span className="font-calera text-2xl">{formatCurrency(subtotal, 2)}</span>
        </div>
        <p className="text-muted-foreground text-xs mb-2">Coupons can be applied on the next page</p>
      </div>
      <Button
        disabled={cartItems.length === 0 || !isReady || hasStockIssue}
        className="w-full"
        onClick={handleCheckout}>
        Checkout
      </Button>
      <Button variant="ghost" className="w-full" onClick={closeCart}>
        Continue Shopping
      </Button>
    </div>
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent>
        <div className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-calera text-4xl font-normal leading-none">CART</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{cartContent}</div>
          {cartFooter}
        </div>
      </SheetContent>
    </Sheet>
  );
};
