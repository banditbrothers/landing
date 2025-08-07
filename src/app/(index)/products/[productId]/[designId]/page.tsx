import { ProductPageContents } from "@/components/pages/variant-product-page";
import { Collections } from "@/constants/collections";
import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { firestore } from "@/lib/firebase-admin";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, getSKU } from "@/utils/product";
import { Metadata } from "next";
import React from "react";
import { unstable_cache } from "next/cache";

type VariantPageProps = { params: Promise<{ productId: string; designId: string }> };

// Cache the Firestore call for 24 hours (86400 seconds)
const getCachedVariant = unstable_cache(
  async (sku: string) => {
    const variantRef = await firestore().collection(Collections.variants).doc(sku).get();
    return {
      exists: variantRef.exists,
      data: variantRef.exists ? (variantRef.data() as ProductVariant) : null,
    };
  },
  ["variant-metadata"],
  {
    revalidate: 86400, // 24 hours
    tags: ["variant-metadata"],
  }
);

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
    const variantResult = await getCachedVariant(sku);

    if (!variantResult.exists || !variantResult.data) {
      return {
        title: "Product Not Found",
        description: "The product you are looking for does not exist.",
      };
    }

    const variant = variantResult.data;
    return {
      title: getProductVariantName(variant) + " | " + "by Bandit Brothers",
      description: product.description.join(" "),
      openGraph: {
        images: [variant.images.mockup[0]],
        title: getProductVariantName(variant),
        description: product.description.join(" "),
      },
      twitter: {
        images: [variant.images.mockup[0]],
        title: getProductVariantName(variant),
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

export default function VariantPage({ params }: VariantPageProps) {
  const resolvedParams = React.use(params);

  return (
    <>
      <ProductPageContents designId={resolvedParams.designId} productId={resolvedParams.productId} />
    </>
  );
}
