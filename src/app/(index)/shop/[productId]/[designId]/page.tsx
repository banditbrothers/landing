import { ProductPageContents } from "@/components/pages/variant-product-page";
import { breadcrumbLd, LdScript } from "@/components/seo/JsonLd";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { DESIGNS_OBJ } from "@/data/designs";
import { SHIPPING_COST } from "@/constants/shipping";
import { getCatalog } from "@/lib/catalog";
import { getApprovedReviews, getBoughtTogether, getRatingSummary } from "@/lib/reviews";
import { pageMetadata, SITE_NAME, SITE_URL, truncate } from "@/lib/site";
import { getProductVariantName, getProductVariantPrice, getSKU, isVariantOutOfStock } from "@/utils/product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDate } from "@/utils/timestamp";
import { routes } from "@/utils/routes";
import { CURRENCY } from "@/utils/price";

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
    description: truncate(`${name} by Bandit Brothers. ${variant?.description ?? product.description.join(" ")}`),
    path: routes.variant({ productId, designId }),
    image: null, // opengraph-image.tsx
  });
}

export default async function VariantPage({ params }: VariantPageProps) {
  const { productId, designId } = await params;

  // Real 404 for unknown variants. If the catalog fetch failed (null), render anyway and let the client decide.
  const catalog = await getCatalog();
  if (catalog && !catalog.some(v => v.id === getSKU(productId, designId))) notFound();

  const sku = getSKU(productId, designId);
  const variant = catalog?.find(v => v.id === sku);
  // Reviews and upsells are nice-to-haves; never break the page over them
  const [reviews, boughtTogether] = await Promise.all([
    getApprovedReviews().catch(error => (console.error("Error fetching reviews:", error), [])),
    getBoughtTogether().catch(
      error => (console.error("Error fetching bought-together:", error), {} as Record<string, string[]>)
    ),
  ]);

  // Reviews are per order: one matches if this variant (or the same design on other gear) was in that order
  const designSkus = PRODUCTS.map(p => getSKU(p.id, designId));
  const ordered = (ids: string[]) =>
    reviews.filter(r => r.source === "website" && r.variantIds.some(id => ids.includes(id)));
  const designReviews = [...new Set([...ordered([sku]), ...ordered(designSkus)])];
  // Stable sort: keeps newest-first within photo / no-photo
  const withPhotosFirst = (list: typeof reviews) =>
    list.toSorted((a, b) => +(b.images.length > 0) - +(a.images.length > 0));

  // Co-purchases for this variant first, then for the same design on other gear
  const boughtWith = [...new Set([sku, ...designSkus].flatMap(id => boughtTogether[id] ?? []))].filter(
    id => !designSkus.includes(id)
  );

  const product = PRODUCTS_OBJ[productId];
  const path = routes.variant({ productId, designId });
  const name = variant && `${getProductVariantName(variant)} ${product.name}`;
  const productLd = variant && {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku,
    image: variant.images.mockup,
    description: variant.description ?? product.description.join(" "),
    material: product.material,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${path}`,
      price: getProductVariantPrice(variant),
      priceCurrency: CURRENCY,
      itemCondition: "https://schema.org/NewCondition",
      availability: `https://schema.org/${isVariantOutOfStock(variant) ? "OutOfStock" : "InStock"}`,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        // Single-item rate; free shipping over MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING is a cart rule
        shippingRate: { "@type": "MonetaryAmount", value: SHIPPING_COST, currency: CURRENCY },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    },
    // Only reviews from orders with this design; store-wide reviews would misrepresent this product
    ...(designReviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: getRatingSummary(designReviews).average.toFixed(1),
        reviewCount: designReviews.length,
      },
      review: designReviews.slice(0, 5).map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        datePublished: getDate(r.createdAt).toISOString().slice(0, 10),
        reviewRating: { "@type": "Rating", ratingValue: r.rating },
        ...(r.comment && { reviewBody: r.comment }),
      })),
    }),
  };

  return (
    <>
      {productLd && (
        <LdScript
          data={[
            productLd,
            breadcrumbLd([
              ["Home", "/"],
              ["Shop", "/shop"],
              [`${product.name}s`, routes.product(productId)],
              [name!, path],
            ]),
          ]}
        />
      )}
      <ProductPageContents
        designId={designId}
        productId={productId}
        rating={reviews.length ? getRatingSummary(reviews) : null}
        reviewCount={designReviews.length}
        // This design's reviews first, topped up to 6 with the latest store reviews; photo reviews lead each group
        reviews={[
          ...withPhotosFirst(designReviews),
          ...withPhotosFirst(reviews.filter(r => !designReviews.includes(r))),
        ].slice(0, 6)}
        boughtWith={boughtWith.slice(0, 12)}
      />
    </>
  );
}
