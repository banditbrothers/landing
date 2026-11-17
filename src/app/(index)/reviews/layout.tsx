import { pageMetadata } from "@/lib/site";

// The reviews page is a client component, so its metadata lives here
export const metadata = pageMetadata({
  title: "Customer Reviews",
  description:
    "Real reviews and photos from Bandit Brothers customers. See what riders, runners and everyday bandits say about our bandanas and balaclavas.",
  path: "/reviews",
  image: null, // opengraph-image.tsx
});

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
