"use client";

import { Design } from "@/data/designs";
import { getFavorites, toggleFavorite } from "@/utils/favorites";

import { createContext, useContext, useEffect, useState } from "react";

type FavoritesContextType = {
  favorites: Design["id"][];
  toggleFav: (designId: Design["id"]) => void;
  isFavorite: (designId: Design["id"]) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Design["id"][]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const toggleFav = (designId: Design["id"]) => {
    toggleFavorite(designId);
    setFavorites(prev => {
      if (prev.includes(designId)) {
        return prev.filter(id => id !== designId);
      }
      return [...prev, designId];
    });
  };

  const isFavorite = (designId: Design["id"]) => {
    return favorites.includes(designId);
  };

  return <FavoritesContext.Provider value={{ favorites, toggleFav, isFavorite }}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
};
