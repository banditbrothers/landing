import { Design } from "@/data/designs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shared } from "use-broadcast-ts";

type FavoritesState = {
  favorites: Design["id"][];
  toggleFav: (designId: Design["id"]) => void;
  isFavorite: (designId: Design["id"]) => boolean;
};

export const useFavorites = create<FavoritesState>()(
  shared(
    persist(
      (set, get) => ({
        favorites: [],

        toggleFav: (designId: Design["id"]) => {
          set(state => {
            const isFavorite = state.favorites.includes(designId);
            if (isFavorite) {
              return { favorites: state.favorites.filter(id => id !== designId) };
            }
            return { favorites: [...state.favorites, designId] };
          });
        },

        isFavorite: (designId: Design["id"]) => {
          return get().favorites.includes(designId);
        },
      }),
      { name: "favorites", storage: createJSONStorage(() => localStorage) }
    ),
    { name: "favorites" }
  )
);
