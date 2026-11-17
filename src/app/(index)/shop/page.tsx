import { pageMetadata } from "@/lib/site";
import { CollectionContent } from "./content";

export const metadata = pageMetadata({
  title: "Shop All Products",
  description:
    "Shop tube bandanas, balaclavas, square bandanas and jerseys by Bandit Brothers. Breathable, UV-protective gear in bold designs, made in India.",
  path: "/shop",
  image: null, // opengraph-image.tsx
});

export default function ProductsPage() {
  return <CollectionContent />;
}
