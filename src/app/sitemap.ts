import { MetadataRoute } from "next";
import { ACTIVE_PRODUCTS } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { routes } from "@/utils/routes";

export const revalidate = 86400;

const route = (path: string, priority: number, changeFrequency: "weekly" | "yearly" = "weekly") => ({
  url: `${SITE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency,
  priority,
});

// Only variants that exist: every other product x design pair is a 404
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = (await getCatalog()) ?? [];

  return [
    route("", 1),
    route("/shop", 0.9),
    route("/reviews", 0.7),
    ...["/contact", "/shipping", "/refunds", "/privacy", "/terms"].map(path => route(path, 0.3, "yearly")),
    ...ACTIVE_PRODUCTS.map(product => route(routes.product(product.id), 0.8)),
    ...catalog.map(v => route(routes.variant(v), 0.7)),
  ];
}
