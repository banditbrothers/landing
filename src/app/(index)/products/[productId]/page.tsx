import { Metadata } from "next";
import { PRODUCTS_OBJ } from "@/data/products";
import { ProductPageContent } from "./content";
import { pageMetadata, truncate } from "@/lib/site";

// No generateStaticParams on purpose: the grid reads filters via useSearchParams, which a prerendered page
// can only render client-side (HTML would be a spinner). Rendered per request instead; catalog comes from the server cache.

type ProductPageProps = { params: Promise<{ productId: string }> };
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = PRODUCTS_OBJ[productId];
  if (!product) return { title: "Product Not Found" };

  return pageMetadata({
    title: `${product.name}s`,
    description: truncate(`Shop ${product.name.toLowerCase()}s by Bandit Brothers. ${product.description.join(" ")}`),
    path: `/products/${productId}`,
    image: null, // opengraph-image.tsx
  });
}

export default function ProductPage() {
  return (
    <div>
      <ProductPageContent />
    </div>
  );
}
