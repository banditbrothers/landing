import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isProductActive, PRODUCTS_OBJ } from "@/data/products";
import { ProductPageContent } from "./content";
import { pageMetadata, truncate } from "@/lib/site";
import { breadcrumbLd, LdScript } from "@/components/seo/JsonLd";
import { routes } from "@/utils/routes";

// No generateStaticParams on purpose: the grid reads filters via useSearchParams, which a prerendered page
// can only render client-side (HTML would be a spinner). Rendered per request instead; catalog comes from the server cache.

type ProductPageProps = { params: Promise<{ productId: string }> };
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = PRODUCTS_OBJ[productId];
  if (!product || !isProductActive(productId)) return { title: "Product Not Found" };

  return pageMetadata({
    title: product.seoTitle ?? `${product.name}s`,
    description: truncate(`Shop ${product.name.toLowerCase()}s by Bandit Brothers. ${product.description.join(" ")}`),
    path: routes.product(productId),
    image: null, // opengraph-image.tsx
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  if (!isProductActive(productId)) notFound();
  return (
    <div>
      <LdScript
        data={[
          breadcrumbLd([
            ["Home", "/"],
            ["Shop", "/shop"],
            [`${PRODUCTS_OBJ[productId].name}s`, routes.product(productId)],
          ]),
        ]}
      />
      <ProductPageContent />
    </div>
  );
}
