import { DESIGN_CATEGORIES, DESIGN_COLORS } from "@/data/products";

export type DesignCategory = (typeof DESIGN_CATEGORIES)[number]["id"];
export type DesignColor = (typeof DESIGN_COLORS)[number]["id"];

export type ImageSet = {
  thumbnail?: string;
  main?: string[];  // Multiple angles of the main product
  detail?: string[]; // Close-up details
  lifestyle?: string[]; // In-use images
  mockup: string[]; // Digital mockups
};

export type Design = {
  id: string;
  name: string;
  colors: DesignColor[];
  category: DesignCategory;
  tags: string[];
  // Design-only images (pattern/texture closeups)
  images?: ImageSet;
};

export type ProductVariant = {
  id: string;
  designId: Design["id"];
  productId: Product["id"];
  images: ImageSet;
  price?: number;
  name?: string;
  description?: string;
  stockLevel?: number;
  isAvailable?: boolean;
  sku?: string; // Stock keeping unit for inventory
  isBestSeller?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  sizes: string[];
  material: string;
  dimensions: string;
  // Generic product images (no specific design)
  baseImages?: ImageSet; 
};

export type OrderedVariant = {
  variantId: string;
  quantity: number;
};
