import { ProductPageContents } from "@/components/pages/variant-product-page";
import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, truncate } from "@/lib/site";
import { getProductVariantName, getSKU } from "@/utils/product";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type VariantPageProps = { params: Promise<{ productId: string; designId: string }> };

// Prerender every available variant at build; new ones render on first request and are cached (dynamicParams defaults to true)
export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog ?? []).map(v => ({ productId: v.productId, designId: v.designId }));
}

// Set static revalidation for the entire page
export const revalidate = 86400; // 24 hours

export async function generateMetadata({ params }: VariantPageProps): Promise<Metadata> {
  const { productId, designId } = await params;
  const product = PRODUCTS_OBJ[productId];
  const design = DESIGNS_OBJ[designId];
  if (!product || !design) return { title: "Product Not Found" };

  // Catalog failure: still describe the page from static data, just without the variant's image/name override
  const catalog = await getCatalog();
  const variant = catalog?.find(v => v.id === getSKU(productId, designId));
  if (catalog && !variant) return { title: "Product Not Found" };

  const name = `${variant ? getProductVariantName(variant) : design.name} ${product.name}`;
  return pageMetadata({
    title: name,
    description: truncate(`${name} by Bandit Brothers. ${product.description.join(" ")}`),
    path: `/products/${productId}/${designId}`,
    image: null, // opengraph-image.tsx
  });
}

export default async function VariantPage({ params }: VariantPageProps) {
  const { productId, designId } = await params;

  // Real 404 for unknown variants. If the catalog fetch failed (null), render anyway and let the client decide.
  const catalog = await getCatalog();
  if (catalog && !catalog.some(v => v.id === getSKU(productId, designId))) notFound();

  return <ProductPageContents designId={designId} productId={productId} />;
}
