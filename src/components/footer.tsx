import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import BackToTopButton from "@/components/BackToTopButton";
import { CONTACT } from "@/lib/site";
import { ACTIVE_PRODUCTS } from "@/data/products";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { formatCurrency } from "@/utils/price";
import { routes } from "@/utils/routes";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      ...ACTIVE_PRODUCTS.map(p => ({ label: p.name, href: routes.product(p.id) })),
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

function Tape({ text, className }: { text: string; className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute -inset-x-[5%] h-10 md:h-12 flex items-center gap-6 md:gap-7 whitespace-nowrap font-calera uppercase text-lg md:text-[22px] ${className}`}>
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} className="flex items-center gap-6 md:gap-7">
          {text}
          <span className="font-sans text-xs">✕</span>
        </span>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-14 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1 max-w-sm">
            <p className="font-calera uppercase leading-[0.9] text-4xl md:text-5xl">
              Wear your
              <br />
              <span className="text-bandit-orange">Mischief</span>
            </p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Bandanas and balaclavas for riders and everyone else.
              {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING && (
                <> Free shipping over {formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}.</>
              )}
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
      </div>

      <div className="relative mt-16 md:mt-24 h-28 md:h-32 grid place-items-center overflow-hidden">
        <Tape text="Hideout closed" className="bg-bandit-red text-white rotate-[1.8deg]" />
        <Tape text="Bandit's hideout ends here" className="bg-bandit-orange text-black -rotate-[2.2deg]" />
        <BackToTopButton />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pb-8">
        <div className="mt-10 flex flex-col md:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Bandit Brothers. All rights reserved.</span>
          <span>{CONTACT.instagramHandle}</span>
        </div>
      </div>
    </footer>
  );
}
