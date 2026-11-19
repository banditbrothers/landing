import { DESIGN_CATEGORIES, DESIGN_COLORS } from "@/data/designs";

export type DesignCategory = (typeof DESIGN_CATEGORIES)[number]["id"];
export type DesignColor = (typeof DESIGN_COLORS)[number]["id"];

export type ImageSet = {
  thumbnail?: string;
  main?: string[]; // Multiple angles of the main product
  detail?: string[]; // Close-up details
  lifestyle?: string[]; // In-use images
  mockup: string[]; // Digital mockups
};

export type Design = {
  id: string;
  name: string;
  category: DesignCategory;
  tags: string[];
  // Designs sharing this value are colourways of one artwork (e.g. "shinobi")
  family?: string;
  // Palette colours of this design. Drives the colour filter; on cards of multi-colourway
  // families the first two render as the colourway chip (two = two-tone)
  swatch: DesignColor[];
  // Design-only images (pattern/texture closeups)
  images?: ImageSet;
};

export type ProductVariant = {
  id: string;
  designId: Design["id"];
  productId: Product["id"];
  createdAt: number;
  images: ImageSet;
  price?: number;
  name?: string;
  description?: string;
  // size -> units in stock. Missing map or missing size = not tracked (treated as in stock)
  stock?: Record<string, number>;
  isAvailable?: boolean;
  sku?: string; // Stock keeping unit for inventory
  isBestSeller?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string[];
  // Category page (/shop/<id>): search-facing <title> and the "About" copy under the grid
  seoTitle?: string;
  about?: string[];
  basePrice: number;
  sizes: string[];
  // Display label per size on the product page; falls back to the size key
  sizeLabels?: Record<string, string>;
  material: string;
  dimensions: Record<string, string>;
  // Generic product images (no specific design)
  baseImages?: ImageSet;
  // false = hidden from the storefront (catalog, nav, sitemap) and not orderable. Old orders, reviews and admin still see it
  isActive?: boolean;
};

export type OrderedVariant = {
  variantId: string;
  size: string;
  quantity: number;
  price?: number; // unit price paid, in rupees (missing on orders before Nov 2026)
};
