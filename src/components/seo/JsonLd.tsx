import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-full-socials.png`,
    sameAs: [CONTACT.instagram],
    email: CONTACT.email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneIntl,
      contactType: "customer service",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };

  return <LdScript data={[organization, website]} />;
}

// One script per object: some Safari extensions read r["@context"] on the parsed JSON and throw on an array.
// Escapes "<" so text from reviews/Firestore can't close the script tag.
export const LdScript = ({ data }: { data: object[] }) =>
  data.map((item, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
    />
  ));

export const breadcrumbLd = (crumbs: [name: string, path: string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: `${SITE_URL}${path}`,
  })),
});
