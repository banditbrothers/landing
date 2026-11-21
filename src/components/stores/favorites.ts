import { ProductVariant } from "@/types/product";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shared } from "use-broadcast-ts";
import { track } from "@/utils/analytics";

type FavoritesState = {
  favorites: ProductVariant["id"][];
  toggleFav: (variantId: ProductVariant["id"]) => void;
};

const useFavoritesStore = create<FavoritesState>()(
  shared(
    persist(
      set => ({
        favorites: [],

        toggleFav: (variantId: ProductVariant["id"]) => {
          set(state => {
            const isFavorite = state.favorites.includes(variantId);
            track(isFavorite ? "favorite_removed" : "favorite_added", { variant_id: variantId });
            if (isFavorite) {
              return { favorites: state.favorites.filter(id => id !== variantId) };
            }
            return { favorites: [...state.favorites, variantId] };
          });
        },
      }),
      { name: "favorites", storage: createJSONStorage(() => localStorage) }
    ),
    { name: "favorites" }
  )
);

export const useFavorites = () => {
  // Read through the hook, not get(): during hydration the hook returns the initial (empty) state like the server did,
  // while get() already has localStorage loaded and causes a hydration mismatch.
  const { favorites, toggleFav } = useFavoritesStore();
  return { favorites, toggleFav, isFavorite: (variantId: ProductVariant["id"]) => favorites.includes(variantId) };
};
