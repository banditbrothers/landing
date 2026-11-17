import { notFound } from "next/navigation";
import { PRODUCTS_OBJ } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import { renderShareImage, shareImageContentType, shareImageSize } from "@/lib/shareImage";
import { getProductVariantName, getSKU } from "@/utils/product";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Bandit Brothers product";

// Same set as the page: built at deploy, refreshed with the catalog tag
export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog ?? []).map(v => ({ productId: v.productId, designId: v.designId }));
}

export default async function Image({ params }: { params: Promise<{ productId: string; designId: string }> }) {
  const { productId, designId } = await params;
  const product = PRODUCTS_OBJ[productId];
  const variant = (await getCatalog())?.find(v => v.id === getSKU(productId, designId));
  if (!product || !variant) notFound();

  return renderShareImage({
    imageUrl: variant.images.mockup[0],
    eyebrow: product.name,
    title: getProductVariantName(variant),
  });
}
