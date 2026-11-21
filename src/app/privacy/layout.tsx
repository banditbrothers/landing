import { pageMetadata } from "@/lib/site";

// The page is a client component, so its metadata lives here
export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Bandit Brothers collects, uses and protects your personal information when you browse or shop at banditbrothers.in.",
  path: "/privacy",
  image: null, // opengraph-image.tsx
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
