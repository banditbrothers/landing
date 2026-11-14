import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { renderShareImage, shareImageContentType, shareImageSize } from "@/lib/shareImage";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Bandit Brothers products";

export const generateStaticParams = () => PRODUCTS.map(product => ({ productId: product.id }));

export default async function Image({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = PRODUCTS_OBJ[productId];
  if (!product) notFound();

  return renderShareImage({
    imageUrl: product.baseImages?.mockup?.[0],
    eyebrow: "Shop the collection",
    title: `${product.name}s`,
  });
}
