import type { Metadata } from "next";

import { HeroSection } from "@/components/pages/home/hero/HeroSection";
import { LandingPageSections } from "@/components/pages/home/LandingPageSections";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} - Wear your Mischief`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - Wear your Mischief`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: DEFAULT_OG_IMAGE,
  },
  twitter: {
    title: `${SITE_NAME} - Wear your Mischief`,
    description: SITE_DESCRIPTION,
    card: "summary_large_image",
    images: DEFAULT_OG_IMAGE,
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <LandingPageSections />
    </div>
  );
}
