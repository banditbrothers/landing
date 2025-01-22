export const getFavorites = (): string[] => {
  const favorites = localStorage.getItem("favorites");
  return favorites ? JSON.parse(favorites) : [];
};

export const addFavorite = (designId: string): string[] => {
  const favorites = getFavorites();
  favorites.push(designId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  return favorites;
};

export const removeFavorite = (designId: string): string[] => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter((id: string) => id !== designId);
  localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  return updatedFavorites;
};

export const isFavorite = (designId: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(designId);
};

export const toggleFavorite = (designId: string): string[] => {
  if (isFavorite(designId)) removeFavorite(designId);
  else addFavorite(designId);

  return getFavorites();
};
