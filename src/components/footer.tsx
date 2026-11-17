import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import BackToTopButton from "@/components/BackToTopButton";
import { CONTACT } from "@/components/layouts/InfoPageLayout";
import { ACTIVE_PRODUCTS, MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/data/products";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      ...ACTIVE_PRODUCTS.map(p => ({ label: p.name, href: `/shop/${p.id}` })),
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Refunds", href: "/refunds" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Reviews", href: "/reviews" },
      { label: "Instagram", href: CONTACT.instagram },
    ],
  },
];

const SOCIALS = [
  { label: "WhatsApp", href: CONTACT.whatsapp, icon: MessageCircle },
  { label: "Instagram", href: CONTACT.instagram, icon: Instagram },
  { label: "Email", href: `mailto:${CONTACT.email}`, icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1 max-w-sm">
            <p className="font-calera uppercase leading-[0.9] text-4xl md:text-5xl">
              Ride loud.
              <br />
              <span className="text-bandit-orange">Cover up.</span>
            </p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Bandanas and balaclavas for riders and everyone else.
              {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING && <> Free shipping over ₹{MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING}.</>}
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="grid place-items-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition hover:border-bandit-orange hover:text-bandit-orange">
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map(col => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] tracking-[0.08em] uppercase text-muted-foreground mb-4">{col.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="hover:text-bandit-orange transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 md:mt-24 flex items-center gap-4">
          <span className="h-px flex-1 border-t border-dashed border-border" />
          <p className="text-sm md:text-base italic tracking-wide text-muted-foreground whitespace-nowrap">
            Bandit&apos;s Hideout Ends Here
          </p>
          <BackToTopButton />
          <span className="h-px flex-1 border-t border-dashed border-border" />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Bandit Brothers. All rights reserved.</span>
          <span>{CONTACT.instagramHandle}</span>
        </div>
      </div>
    </footer>
  );
}
