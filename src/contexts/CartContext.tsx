"use client";

import { createContext, useContext, useState } from "react";
import { Design, designs } from "@/data/designs";

type CartContextType = {
  cart: { id: Design["id"]; quantity: number }[];
  isCartOpen: boolean;
  toggleCartIsOpen: () => void;
  clearCart: () => void;
  addToCart: (designId: Design["id"]) => void;
  removeFromCart: (designId: Design["id"]) => void;
  updateCart: (designId: Design["id"], quantity: number) => void;
  getCartTotalQuantity: () => number;
  getCartTotalAmount: () => number;
};

export const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<{ id: Design["id"]; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCartIsOpen = () => setIsCartOpen(s => !s);

  const addToCart = (designId: Design["id"], quantity: number = 1) => {
    setCart(prevCart => [...prevCart, { id: designId, quantity }]);
  };

  const removeFromCart = (designId: Design["id"]) => {
    setCart(prevCart => prevCart.filter(item => item.id !== designId));
  };

  const updateCart = (designId: Design["id"], quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item => (item.id === designId ? { ...item, quantity: item.quantity + quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotalQuantity = () => cart.reduce((acc, item) => acc + item.quantity, 0);

  const getCartTotalAmount = () =>
    cart.reduce((acc, item) => {
      const design = designs.find(design => design.id === item.id);

      if (!design) return acc;
      return acc + item.quantity * design.price;
    }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        toggleCartIsOpen,
        clearCart,
        addToCart,
        removeFromCart,
        updateCart,
        getCartTotalQuantity,
        getCartTotalAmount,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
