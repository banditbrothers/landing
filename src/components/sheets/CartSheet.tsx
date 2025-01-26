"use client";

import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "../ui/button";

import { useCart } from "@/lib/zustand";
import Image from "next/image";
import { Design, DESIGNS_OBJ } from "@/data/designs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export const CartSheet = () => {
  const { value, removeParam: closeCart } = useParamBasedFeatures("cart");
  const isOpen = !!value;

  const CartContent = () => {
    const cartItems = useCart(state => state.items);

    return (
      <div className="flex flex-col gap-4 py-4">
        {cartItems.map(item => {
          const design = { ...DESIGNS_OBJ[item.designId], id: item.designId };
          return <CartItem key={design.id} design={design} quantity={item.quantity} />;
        })}
        <p className="text-muted-foreground text-xs italic">Psst... use code BROCODE for 15% off! 🤫</p>
        {cartItems.length === 0 && <p className="text-center text-muted-foreground">Your cart is empty</p>}
      </div>
    );
  };

  const CartFooter = () => {
    const cartItems = useCart(state => state.items);
    const subtotal = cartItems.reduce((acc, item) => {
      const design = DESIGNS_OBJ[item.designId];
      return acc + design.price * item.quantity;
    }, 0);

    return (
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="w-full text-sm">
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground text-xs mb-2">Coupons can be applied on the next page</p>
        </div>
        <Button className="w-full">Checkout</Button>
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

const CartItem = ({ design, quantity }: { design: Design; quantity: number }) => {
  const { updateCartItem, removeCartItem } = useCart();
  return (
    <div key={design.id} className="flex gap-4 p-4 bg-card rounded-lg">
      <div className="w-20 h-20 relative">
        <Image src={design.image} alt={design.name} fill className="object-cover rounded-md w-full h-full" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{design.name}</h3>
        <p className="text-muted-foreground">${design.price}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" onClick={() => removeCartItem(design.id)}>
            -
          </Button>
          <span>{quantity}</span>
          <Button variant="outline" size="icon" onClick={() => updateCartItem(design.id, 1)}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
};
