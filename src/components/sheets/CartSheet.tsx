"use client";

import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "../ui/button";

import { useCart } from "@/components/stores/cart";

import { DESIGNS_OBJ } from "@/data/designs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { CheckoutProductCard } from "../cards/CheckoutProductCard";
import { useRouter } from "next/navigation";

export const CartSheet = () => {
  const { value, removeParam: closeCart } = useParamBasedFeatures("cart");
  const { updateCartItem, removeCartItem } = useCart();

  const isOpen = !!value;

  const CartContent = () => {
    const cartItems = useCart(state => state.items);

    return (
      <div className="flex flex-col gap-4 py-4">
        {cartItems.map(item => {
          const design = { ...DESIGNS_OBJ[item.designId], id: item.designId };
          return (
            <CheckoutProductCard
              key={design.id}
              design={design}
              quantity={item.quantity}
              updateCartItem={updateCartItem}
              removeCartItem={removeCartItem}
            />
          );
        })}
        <span className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs italic">Psst... use code BROCODE for 15% off!</p>
          <p className="text-xs text-muted-foreground">🧡🤫</p>
        </span>
        {cartItems.length === 0 && <p className="text-center text-muted-foreground">Your cart is empty</p>}
      </div>
    );
  };

  const CartFooter = () => {
    const router = useRouter();
    const cartItems = useCart(state => state.items);
    const subtotal = cartItems.reduce((acc, item) => {
      const design = DESIGNS_OBJ[item.designId];
      return acc + design.price * item.quantity;
    }, 0);

    return (
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="w-full text-sm">
          <div className="flex justify-between mb-1">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground text-xs mb-2">Coupons can be applied on the next page</p>
        </div>
        <Button className="w-full" onClick={() => router.push("/order")}>
          Checkout
        </Button>
        <Button variant="ghost" className="w-full" onClick={closeCart}>
          Continue Shopping
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
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
