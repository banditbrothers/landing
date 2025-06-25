import { ProductPageContents } from "@/components/pages/designs";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, getSKU } from "@/utils/product";
import { Metadata } from "next";
import React from "react";

type VariantPageProps = { params: Promise<{ productId: string; designId: string }> };

export async function generateMetadata({ params }: VariantPageProps): Promise<Metadata> {
  const { productId, designId } = await params;

  // todo: verify if this is the correct way to do this
  const variantRef = await firestore().collection(Collections.variants).doc(getSKU(productId, designId)).get();

  if (!variantRef.exists) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  if (variantRef.exists) {
    const variant = variantRef.data() as ProductVariant;
    return {
      title: getProductVariantName(variant) + " | " + "by Bandit Brothers",
      openGraph: { images: [variant.images.mockup[0]] },
      twitter: { images: [variant.images.mockup[0]] },
    };
  }
  return {};
}

export default function VariantPage({ params }: VariantPageProps) {
  const resolvedParams = React.use(params);

  return (
    <>
      <ProductPageContents designId={resolvedParams.designId} productId={resolvedParams.productId} />
    </>
  );
}
