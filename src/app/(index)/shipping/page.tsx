import { Globe, Truck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sticker } from "@/components/cards/ShopCard";
import { InfoPageLayout, IconBox, SectionTitle, card, displayTitle } from "@/components/layouts/InfoPageLayout";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING as FREE_OVER, SHIPPING_COST } from "@/data/products";
import { pageMetadata } from "@/lib/site";
import { formatCurrency } from "@/utils/price";

export const metadata = pageMetadata({
  title: "Shipping Policy",
  description: `Bandit Brothers ships across India and worldwide. Orders dispatch within 8–14 days, ${formatCurrency(SHIPPING_COST)} flat shipping in India.`,
  path: "/shipping",
  image: null, // opengraph-image.tsx
});

const STATS = [
  ["8–14", "Days to dispatch after order & payment"],
  [formatCurrency(SHIPPING_COST), "Flat shipping across India"],
  ...(FREE_OVER !== null ? [[`${formatCurrency(FREE_OVER)}+`, "Orders above this ship free"]] : []),
  ["Global", "We ship worldwide by courier or speed post"],
];

const STEPS = [
  ["You order", "Payment confirmed. You get a confirmation on the email you gave at checkout."],
  ["We pack", "Your gear is checked and packed."],
  ["Handed to courier", "Within 8–14 days, or the date agreed when your order was confirmed."],
  ["At your door", "Delivered to the address you provided, per courier / postal timelines."],
];

const ZONES = [
  {
    name: "India",
    icon: <Truck />,
    sticker: FREE_OVER !== null ? `Free over ${formatCurrency(FREE_OVER)}` : undefined,
    points: [
      "Registered domestic couriers and/or India Speed Post",
      FREE_OVER !== null
        ? `${formatCurrency(SHIPPING_COST)} flat, free on orders of ${formatCurrency(FREE_OVER)} and above`
        : `${formatCurrency(SHIPPING_COST)} flat on every order`,
      "Pay online at checkout",
    ],
  },
  {
    name: "International",
    icon: <Globe />,
    points: [
      "Registered international couriers and/or International Speed Post",
      "Shipping quoted per order, based on destination",
      "We send you a payment link once your quote is ready",
    ],
  },
];

export default function ShippingPage() {
  return (
    <InfoPageLayout
      crumb="Shipping Policy"
      title="On the"
      accent="move."
      lede="Every order is packed by hand and handed to a registered courier or speed post. Here's what to expect between checkout and your doorstep.">
      <section className="pt-12 md:pt-14">
        <div
          className={`grid grid-cols-2 ${STATS.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-px bg-border border border-border rounded-2xl overflow-hidden`}>
          {STATS.map(([n, label], i) => (
            <div key={label} className={`p-5 md:p-7 ${i === 0 ? "bg-bandit-orange text-black" : "bg-card"}`}>
              <b className={`${displayTitle} block font-normal text-4xl md:text-6xl`}>{n}</b>
              <small
                className={`block text-[13px] leading-snug mt-2.5 ${i === 0 ? "text-black/75" : "text-muted-foreground"}`}>
                {label}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-14">
        <SectionTitle>How it goes</SectionTitle>
        <ol className="relative grid md:grid-cols-4 gap-6 md:gap-0 before:absolute before:border-dashed before:border-border before:left-[21px] before:top-[22px] before:bottom-[22px] before:border-l-2 md:before:border-l-0 md:before:border-t-2 md:before:bottom-auto md:before:right-[22px]">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="relative grid grid-cols-[44px_1fr] gap-x-4 md:block md:pr-5">
              <span
                className={`row-span-2 grid place-items-center w-11 h-11 rounded-full border font-bold ${
                  i < 2 ? "bg-bandit-orange border-bandit-orange text-black" : "bg-secondary border-border"
                }`}>
                {i + 1}
              </span>
              <h3 className="font-semibold mt-2.5 md:mt-4 mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-14">
        <SectionTitle>Where we ship</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          {ZONES.map(z => (
            <div key={z.name} className={card}>
              {z.sticker && (
                <span className="absolute -top-3 right-5">
                  <Sticker>{z.sticker}</Sticker>
                </span>
              )}
              <IconBox>{z.icon}</IconBox>
              <h3 className={`${displayTitle} text-4xl mt-5 mb-4`}>{z.name}</h3>
              <ul className="grid gap-2.5">
                {z.points.map(p => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-normal text-foreground/80">
                    <span className="text-bandit-orange shrink-0">✦</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="fine-print" className="rounded-2xl border border-border bg-card">
            <AccordionTrigger className="px-6 md:px-7 py-5 text-base font-semibold [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-bandit-orange">
              The fine print
            </AccordionTrigger>
            <AccordionContent className="px-6 md:px-7 pb-6 text-muted-foreground leading-7">
              Orders are shipped within <b className="text-foreground font-semibold">8–14 days</b> from the date of
              order and payment, or as per the delivery date agreed at the time of order confirmation, with delivery
              subject to courier company / post office norms. Bandit Brothers is not liable for any delay in delivery by
              the courier company or postal authorities, and only guarantees to hand over the consignment to them within
              that window. All orders are delivered to the address provided by the buyer. Delivery confirmation is sent
              to the email ID provided at checkout.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </InfoPageLayout>
  );
}
