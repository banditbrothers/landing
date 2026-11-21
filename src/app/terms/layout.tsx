import { pageMetadata } from "@/lib/site";

// The page is a client component, so its metadata lives here
export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms and conditions for using banditbrothers.in and buying Bandit Brothers bandanas, balaclavas and headwear.",
  path: "/terms",
  image: null, // opengraph-image.tsx
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
