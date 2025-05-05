export const getSKU = (productId: string, designId: string) => {
  return `${productId.toUpperCase()}-${designId.toUpperCase().replaceAll("-", "_")}`;
};
