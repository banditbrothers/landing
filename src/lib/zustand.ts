import { create } from "zustand";

type CartState = {
  items: {
    id: string;
    quantity: number;
  }[];
  addItem: (id: string, quantity?: number) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(set => ({
  items: [],
  addItem: (id, quantity = 1) => set(state => ({ items: [...state.items, { id, quantity }] })),
  updateItem: (id, quantity) => set(state => ({ items: state.items.map(i => (i.id === id ? { ...i, quantity } : i)) })),
  removeItem: id => set(state => ({ items: state.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
}));
