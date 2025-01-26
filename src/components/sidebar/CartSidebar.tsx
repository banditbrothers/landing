"use client";

import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { XMarkIcon } from "../misc/icons";
import { useCart } from "@/lib/zustand";
import Image from "next/image";
import { Design, DESIGNS_OBJ } from "@/data/designs";

export const CartSidebar = () => {
  const { value, removeParam } = useParamBasedFeatures("cart");
  const isOpen = !!value;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (isOpen) {
      document.body.addEventListener("touchmove", preventTouchMove, { passive: false });
    } else {
      document.body.removeEventListener("touchmove", preventTouchMove);
    }

    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);

  const CartHeader = () => {
    return (
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cart</h2>
        <Button onClick={() => removeParam()} variant="ghost">
          <XMarkIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  };

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
        <Button variant="ghost" className="w-full" onClick={removeParam}>
          Continue Shopping
        </Button>
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => removeParam()} />}
      <div
        className={`fixed inset-y-0 right-0 w-4/5 sm:w-2/5 2xl:w-1/4 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}>
        <div className="h-full bg-card p-4 rounded-l-lg flex flex-col">
          <CartHeader />
          <div className="flex-1 overflow-y-auto">
            <CartContent />
          </div>
          <CartFooter />
        </div>
      </div>
    </>
  );
};

const CartItem = ({ design, quantity }: { design: Design; quantity: number }) => {
  const { updateCartItem, removeCartItem } = useCart();
  return (
    <div key={design.id} className="flex gap-4 p-4 bg-muted rounded-lg">
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
