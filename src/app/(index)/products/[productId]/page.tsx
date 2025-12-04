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
    const mockupImage = product.baseImages?.mockup?.[0];

    if (!mockupImage) {
      throw new Error("No mockup image found for product: " + productId);
    }

    return {
      title: product.name + " | " + "by Bandit Brothers",
      description: product.description.join(" ").slice(0, 155) + "...",
      openGraph: {
        images: [mockupImage],
        title: product.name + " | " + "by Bandit Brothers",
        description: product.description.join(" ").slice(0, 155) + "...",
      },
      twitter: {
        images: [mockupImage],
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
