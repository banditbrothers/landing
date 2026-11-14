import type { Metadata } from "next";

export const SITE_URL = "https://www.banditbrothers.in";
export const SITE_NAME = "Bandit Brothers";
export const SITE_DESCRIPTION =
  "Bandit Brothers — premium bandanas and headwear. Wear your mischief. Shop bold designs, best sellers, and comfortable everyday style. Made in India.";

export const DEFAULT_OG_IMAGE = "/logo-full-socials.png";

/** Cuts at a word boundary so search snippets don't end mid-word. */
export const truncate = (text: string, max = 160) =>
  text.length <= max ? text : text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[\s,.;:—-]+$/, "") + "…";

/**
 * Full metadata for a page. Next.js replaces (not merges) openGraph/twitter objects from parent layouts,
 * so every page gets the complete set here: canonical, og:url/type/site_name, and the brand appended once.
 */
export const pageMetadata = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  /** null = the route has an opengraph-image.tsx; Next adds og:image itself and Twitter falls back to it */
  image?: string | null;
}): Metadata => {
  const fullTitle = `${title} | ${SITE_NAME}`; // og/twitter titles don't get the layout's title template
  return {
    title, // the root layout's template appends " | Bandit Brothers"
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, url: path, title: fullTitle, description, ...(image && { images: image }) },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...(image && { images: image }) },
  };
};
