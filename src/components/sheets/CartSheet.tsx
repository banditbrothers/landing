"use client";

import { Button } from "../ui/button";

import { useCart } from "@/components/stores/cart";

import { DESIGNS_OBJ } from "@/data/designs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { CheckoutProductCard } from "../cards/CheckoutProductCard";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FEATURED_COUPON, STANDARD_COUPON } from "@/components/typography/coupons";
import { formatCurrency } from "@/utils/price";

export const CartSheet = () => {
  const { cart: cartItems, isCartOpen, closeCart, updateCartItem, removeCartItem } = useCart();

  const subtotal = cartItems.reduce((acc, item) => {
    const design = DESIGNS_OBJ[item.designId];
    return acc + design.price * item.quantity;
  }, 0);

  const CartContent = () => {
    return (
      <div className="flex h-full flex-col gap-4 py-4">
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <span className="text-center leading-normal">
              <STANDARD_COUPON.CartMessage />
            </span>
          </span>
        </div>

        {cartItems.map(item => {
          const design = { ...DESIGNS_OBJ[item.designId], id: item.designId };
          return (
            <CheckoutProductCard
              key={design.id}
              design={design}
              quantity={item.quantity}
              updateCartItemBy={updateCartItem}
              removeCartItem={removeCartItem}
            />
          );
        })}

        {cartItems.length === 0 && (
          <div className="text-center text-muted h-full flex items-center justify-center">
            <p className="text-3xl font-semibold sm:text-5xl flex flex-col gap-3">
              {"“No Bandit Should Be Without A Loot”".split(" ").map((char, i) => (
                <span key={i} className="italic">
                  {char}
                </span>
              ))}
            </p>
          </div>
        )}
        {cartItems.length > 0 && (
          <span className="">
            <p className="text-muted-foreground text-xs text-center leading-normal">
              <FEATURED_COUPON.CartMessage />
            </p>
          </span>
        )}
      </div>
    );
  };

  const CartFooter = () => {
    const router = useRouter();

    const handleCheckout = () => {
      router.push("/order");
      closeCart();
    };

    return (
      <div className="flex flex-col gap-2 w-full items-center pt-4">
        <div className="w-full text-sm">
          <div className="flex justify-between mb-1">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, 2)}</span>
          </div>
          <p className="text-muted-foreground text-xs mb-2">Coupons can be applied on the next page</p>
        </div>
        <Button disabled={cartItems.length === 0} className="w-full" onClick={handleCheckout}>
          Checkout
        </Button>
        <Button variant="ghost" className="w-full" onClick={closeCart}>
          Continue Shopping
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent>
        <div className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Cart</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <CartContent />
          </div>
          <CartFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PromotionsAccordion = () => {
  return (
    <Accordion type="single" collapsible className="bg-muted/50 rounded-lg">
      <AccordionItem value="promotions" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <h3 className="font-medium text-sm">Active Promotions</h3>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid gap-3">
            {/* Site-wide Discount */}
            <div className="relative overflow-hidden rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">%</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">Site-wide Discount</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Enjoy 5% off on all products</p>
                </div>
              </div>
            </div>

            {/* Bulk Purchase Offer */}
            <div className="relative overflow-hidden rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">4x</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">Bulk Purchase Offer</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Buy 4 for ₹1000</p>
                </div>
              </div>
            </div>

            {/* Free Shipping */}
            <div className="relative overflow-hidden rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-lg">🚚</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">Free Shipping</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">On all orders above ₹750</p>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
