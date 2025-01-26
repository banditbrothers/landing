"use client";

import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { XMarkIcon } from "../misc/icons";

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
    return <div>CartContent</div>;
  };

  const CartFooter = () => {
    return (
      <div className="flex flex-col gap-2 w-full items-center">
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
