import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MessageCircle } from "lucide-react";
import { Sticker } from "@/components/misc/Stickers";
import { CONTACT } from "@/lib/site";
import { InfoPageLayout, IconBox, SectionTitle, card } from "@/components/layouts/InfoPageLayout";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Reach Bandit Brothers on WhatsApp, phone, email or Instagram for sizing help, order updates and bulk orders.",
  path: "/contact",
  image: null, // opengraph-image.tsx
});

const CHANNELS = [
  { label: "WhatsApp / Call", value: CONTACT.phone, href: CONTACT.whatsapp, icon: <MessageCircle />, hot: true },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: <Mail /> },
  { label: "Instagram DMs", value: CONTACT.instagramHandle, href: CONTACT.instagram, icon: <Instagram /> },
];

const orange = "text-bandit-orange hover:underline";
const TIPS = [
  {
    title: "Keep your order ID handy",
    body: <>It&apos;s in your confirmation email and on your order page. Saves a round of back-and-forth.</>,
  },
  {
    title: "Shipping from abroad?",
    body: <>International orders get a custom shipping quote and a payment link from us after you order.</>,
  },
  {
    title: "Read the policies",
    body: (
      <>
        Most &ldquo;where&apos;s my order&rdquo; answers live in{" "}
        <Link href="/shipping" className={orange}>
          Shipping
        </Link>
        . Returns are covered in{" "}
        <Link href="/refunds" className={orange}>
          Refunds
        </Link>
        .
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <InfoPageLayout
      crumb="Contact Us"
      title="Holler"
      accent="at us."
      lede="Sizing doubts, order updates, bulk orders or just want to say the bandana slaps. Real humans, no ticket numbers.">
      <section className="grid md:grid-cols-3 gap-4 pt-12 md:pt-14">
        {CHANNELS.map(c => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`${card} group flex flex-col justify-between gap-8 md:min-h-[220px] transition hover:-translate-y-0.5 ${
              c.hot ? "!bg-bandit-orange !border-bandit-orange text-black" : "hover:border-bandit-orange"
            }`}>
            {c.hot && (
              <span className="absolute -top-3 right-5">
                <Sticker tone="light">Fastest</Sticker>
              </span>
            )}
            <IconBox className={c.hot ? "!bg-black/10 !text-black" : ""}>{c.icon}</IconBox>
            <div>
              <small
                className={`text-[13px] tracking-[0.08em] uppercase ${c.hot ? "text-black/70" : "text-muted-foreground"}`}>
                {c.label}
              </small>
              <div className="text-lg font-bold tracking-tight mt-1.5 [overflow-wrap:anywhere]">{c.value}</div>
            </div>
            <ArrowUpRight
              className={`absolute right-6 top-7 w-5 h-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                c.hot ? "text-black/70" : "text-muted-foreground group-hover:text-bandit-orange"
              }`}
            />
          </a>
        ))}
      </section>

      <section className="pt-14">
        <SectionTitle>Get sorted faster</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          {TIPS.map((t, i) => (
            <div key={t.title} className={card}>
              <div className="font-calera text-5xl leading-[0.8] text-bandit-orange">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  );
}
