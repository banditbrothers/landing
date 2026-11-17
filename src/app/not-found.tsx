import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ShopCard } from "@/components/cards/ShopCard";
import { SectionHead } from "@/components/misc/Reveal";
import { CONTACT, card, displayTitle } from "@/components/layouts/InfoPageLayout";
import { getCatalog } from "@/lib/catalog";
import { sortOutOfStockLast } from "@/utils/product";
import IndexLayout from "./(index)/layout";

export const metadata: Metadata = { title: "Page Not Found" };

const LEADS = [
  { label: "The whole stash", hint: "Every bandana and balaclava", href: "/shop" },
  { label: "Word on the street", hint: "Reviews from the gang", href: "/reviews" },
  { label: "Snitch to us", hint: "Tell us what broke", href: CONTACT.whatsapp, external: true },
];

// Root not-found renders outside the (index) layout, so wrap it to keep the cart and search working.
export default async function NotFound() {
  const catalog = (await getCatalog()) ?? [];
  const bestSellers = catalog.filter(v => v.isBestSeller && v.images.mockup.length > 0);
  const suspects = sortOutOfStockLast(bestSellers).slice(0, 4);

  return (
    <IndexLayout>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-16">
        <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-foreground">404</span>
        </nav>

        <header className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-12 items-end pt-8 md:pt-12 pb-10 md:pb-12 border-b border-border">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Error 404 · Case open</p>
            <h1 className={`${displayTitle} text-[19vw] md:text-[clamp(4.5rem,11vw,10.5rem)]`}>
              This page
              <br />
              <span className="text-bandit-orange">went rogue.</span>
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              Whatever was here slipped out the back. It may have moved, sold out for good, or never existed. The rest
              of the gang is still around.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 h-12 md:h-14 px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110">
                Shop all gear
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl border border-border font-semibold transition-colors hover:border-foreground">
                Back to home
              </Link>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-4 pt-12 md:pt-14">
          {LEADS.map(l => (
            <Link
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className={`${card} group flex items-end justify-between gap-6 transition hover:-translate-y-0.5 hover:border-bandit-orange`}>
              <div>
                <p className="text-sm text-muted-foreground">{l.hint}</p>
                <p className={`${displayTitle} text-3xl md:text-4xl mt-2`}>{l.label}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:text-bandit-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </section>

        {suspects.length > 0 && (
          <section className="pt-16 md:pt-24">
            <SectionHead
              kicker="While you're here"
              title={
                <>
                  The usual <span className="text-bandit-orange">suspects</span>
                </>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
              {suspects.map(variant => (
                <ShopCard key={variant.id} variant={variant} />
              ))}
            </div>
          </section>
        )}
      </div>
    </IndexLayout>
  );
}
