import Link from "next/link";
import { CONTACT } from "@/lib/site";
import { Kicker } from "@/components/typography/Kicker";

export const card = "relative rounded-2xl border border-border bg-card p-6 md:p-7";
export const displayTitle = "font-calera uppercase leading-[0.9]";

export const SectionTitle = ({ children, aside }: { children: React.ReactNode; aside?: string }) => (
  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
    <h2 className={`${displayTitle} text-4xl md:text-5xl`}>{children}</h2>
    {aside && <span className="text-sm text-muted-foreground">{aside}</span>}
  </div>
);

export const IconBox = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`grid place-items-center w-11 h-11 rounded-xl bg-bandit-orange/10 text-bandit-orange [&_svg]:w-[22px] [&_svg]:h-[22px] ${className}`}>
    {children}
  </div>
);

export function InfoPageLayout({
  crumb,
  title,
  accent,
  lede,
  children,
}: {
  crumb: string;
  title: string;
  accent: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-16 min-h-screen">
      <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4 relative z-10" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">{crumb}</span>
      </nav>

      <header className="grid md:grid-cols-[1.4fr_1fr] gap-5 md:gap-12 items-end pt-8 md:pt-12 pb-10 md:pb-12 border-b border-border">
        <div>
          <h1 className={`${displayTitle} text-[19vw] md:text-[clamp(4.5rem,11vw,10.5rem)]`}>
            {title}
            <br />
            <span className="text-bandit-orange">{accent}</span>
          </h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">{lede}</p>
      </header>

      {children}

      <section className="mt-16 md:mt-20 rounded-3xl border border-border bg-card p-7 md:px-12 md:py-10 flex flex-wrap items-center justify-between gap-8">
        <div>
          <Kicker className="mb-0">Still stuck?</Kicker>
          <h2 className={`${displayTitle} text-5xl md:text-7xl mt-3`}>
            We&apos;ve got
            <br />
            <span className="text-bandit-orange">your back.</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110">
            WhatsApp us
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl border border-border font-semibold transition-colors hover:border-foreground break-all">
            {CONTACT.email}
          </a>
        </div>
      </section>
    </div>
  );
}
