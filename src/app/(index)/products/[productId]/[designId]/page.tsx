import { ProductPageContents } from "@/components/pages/variant-product-page";
import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
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
  const sku = getSKU(productId, designId);

  const product = PRODUCTS_OBJ[productId];
  const design = DESIGNS_OBJ[designId];

  if (!product || !design) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  try {
    const catalog = await getCatalog();
    if (!catalog) throw new Error("Catalog unavailable");
    const variant = catalog.find(v => v.id === sku);

    if (!variant) {
      return {
        title: "Product Not Found",
        description: "The product you are looking for does not exist.",
      };
    }

    const name = getProductVariantName(variant) + " " + product.name + " | " + "by Bandit Brothers";
    return {
      title: name,
      description: product.description.join(" "),
      openGraph: {
        images: [variant.images.mockup[0]],
        title: name,
        description: product.description.join(" "),
      },
      twitter: {
        images: [variant.images.mockup[0]],
        title: name,
        description: product.description.join(" "),
      },
    };
  } catch (error) {
    console.error("Error fetching variant metadata:", error);
    // Fallback to static data if Firestore fails
    return {
      title: design.name + " | " + "by Bandit Brothers",
      description: product.description.join(" "),
    };
  }
}

export default async function VariantPage({ params }: VariantPageProps) {
  const { productId, designId } = await params;

  // Real 404 for unknown variants. If the catalog fetch failed (null), render anyway and let the client decide.
  const catalog = await getCatalog();
  if (catalog && !catalog.some(v => v.id === getSKU(productId, designId))) notFound();

  return <ProductPageContents designId={designId} productId={productId} />;
}
