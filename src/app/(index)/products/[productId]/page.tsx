import { Metadata } from "next";
import { PRODUCTS_OBJ } from "@/data/products";
import { ProductPageContent } from "./content";

type ProductPageProps = { params: Promise<{ productId: string }> };
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;

  const product = PRODUCTS_OBJ[productId];

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  try {
    return {
      title: product.name + " | " + "by Bandit Brothers",
      description: product.description.join(" ").slice(0, 155) + "...",
      openGraph: {
        images: [product.baseImages?.mockup[0]!],
        title: product.name + " | " + "by Bandit Brothers",
        description: product.description.join(" ").slice(0, 155) + "...",
      },
      twitter: {
        images: [product.baseImages?.mockup[0]!],
        title: product.name + " | " + "by Bandit Brothers",
        description: product.description.join(" ").slice(0, 155) + "...",
      },
    };
  } catch (error) {
    console.error("Error fetching product metadata:", error);
    // Fallback to static data if Firestore fails
    return {
      title: product.name + " | " + "by Bandit Brothers",
      description: product.description.join(" ").slice(0, 155) + "...",
    };
  }
}

export default function ProductPage() {
  return (
    <div>
      <ProductPageContent />
    </div>
  );
}
