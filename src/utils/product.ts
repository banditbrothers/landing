import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { DESIGNS_OBJ } from "@/data/designs";
import { getTimestamp, SECONDS_PER_DAY } from "@/utils/timestamp";
import { ProductVariant } from "@/types/product";

export const getSKU = (productId: string, designId: string) => {
  return `${productId.toUpperCase().replaceAll("-", "_")}-${designId.toUpperCase().replaceAll("-", "_")}`;
};

export const getProductVariantName = (
  productVariant: ProductVariant,
  config: { includeProductName?: boolean } = { includeProductName: false }
) => {
  if (!productVariant) return "";
  if (productVariant.name) return productVariant.name;
  if (config.includeProductName)
    return `${PRODUCTS_OBJ[productVariant.productId].name}: ${DESIGNS_OBJ[productVariant.designId].name}`;
  return DESIGNS_OBJ[productVariant.designId].name;
};

export const getProductVariantPrice = (productVariant: ProductVariant) => {
  if (!productVariant) throw new Error("Product variant is required to calculate price");
  return productVariant.price ?? PRODUCTS_OBJ[productVariant.productId].basePrice;
};

// Short label from the catalog's sizeLabels ("Small - 52 to 59cm" -> "Small"); jersey sizes are already labels.
// Older orders have no size at all.
export const getSizeLabel = (size?: string): string => {
  if (!size) return "No size";
  const label = PRODUCTS.find(p => p.sizeLabels?.[size])?.sizeLabels?.[size];
  return label?.split(" - ")[0] ?? size;
};

export const LOW_STOCK_THRESHOLD = 3;

// undefined = stock not tracked for this size (treated as in stock)
export const getSizeStock = (variant: ProductVariant, size: string): number | undefined => {
  return variant.stock?.[size];
};

export const isSizeInStock = (variant: ProductVariant, size: string) => {
  const stock = getSizeStock(variant, size);
  return stock === undefined || stock > 0;
};

export const isVariantOutOfStock = (variant: ProductVariant) => {
  const sizes = PRODUCTS_OBJ[variant.productId]?.sizes ?? [];
  return sizes.length > 0 && sizes.every(size => !isSizeInStock(variant, size));
};

export const getFirstInStockSize = (variant: ProductVariant): string | undefined => {
  return PRODUCTS_OBJ[variant.productId]?.sizes.find(size => isSizeInStock(variant, size));
};

// Stable: keeps existing order, just pushes fully out-of-stock variants to the end
export const sortOutOfStockLast = (variants: ProductVariant[]) => {
  return [...variants.filter(v => !isVariantOutOfStock(v)), ...variants.filter(isVariantOutOfStock)];
};

export const exceedsStock = (variant: ProductVariant, size: string, quantity: number) => {
  const stock = getSizeStock(variant, size);
  return stock !== undefined && quantity > stock;
};

const NEW_DROP_SECONDS = 30 * SECONDS_PER_DAY;

// Units left across tracked sizes; undefined when nothing is tracked
export const getUnitsLeft = (variant: ProductVariant) => {
  const tracked = (PRODUCTS_OBJ[variant.productId]?.sizes ?? [])
    .map(s => getSizeStock(variant, s))
    .filter((n): n is number => n !== undefined);
  return tracked.length ? tracked.reduce((a, b) => a + b, 0) : undefined;
};

export const isNewDrop = (variant: ProductVariant) => getTimestamp() - variant.createdAt < NEW_DROP_SECONDS;

// Colour families share a "Name - Shade" naming; a folded card shows just the design name
export const getFamilyName = (variant: ProductVariant) => getProductVariantName(variant).split(" - ")[0];

// Colour variants of one design share a `family` key
export const familyOf = (designId: string) => DESIGNS_OBJ[designId]?.family ?? designId;

export const isListed = (v: ProductVariant) => v.isAvailable !== false && v.images.mockup.length > 0;

/** Colour-family key -> its variants, in input order */
export const groupByFamily = (variants: ProductVariant[]) => {
  const map = new Map<string, ProductVariant[]>();
  variants.forEach(v => map.set(familyOf(v.designId), [...(map.get(familyOf(v.designId)) ?? []), v]));
  return map;
};
