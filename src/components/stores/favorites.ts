import { ProductVariant } from "@/types/product";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shared } from "use-broadcast-ts";

type FavoritesState = {
  favorites: ProductVariant["id"][];
  toggleFav: (variantId: ProductVariant["id"]) => void;
  isFavorite: (variantId: ProductVariant["id"]) => boolean;
};

export const useFavorites = create<FavoritesState>()(
  shared(
    persist(
      (set, get) => ({
        favorites: [],

        toggleFav: (variantId: ProductVariant["id"]) => {
          set(state => {
            const isFavorite = state.favorites.includes(variantId);
            if (isFavorite) {
              return { favorites: state.favorites.filter(id => id !== variantId) };
            }
            return { favorites: [...state.favorites, variantId] };
          });
        },

        isFavorite: (variantId: ProductVariant["id"]) => {
          return get().favorites.includes(variantId);
        },
      }),
      { name: "favorites", storage: createJSONStorage(() => localStorage) }
    ),
    { name: "favorites" }
  )
);
