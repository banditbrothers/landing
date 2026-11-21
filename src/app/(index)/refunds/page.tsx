import { Eye, MapPin, Ruler } from "lucide-react";
import { InfoPageLayout, IconBox, SectionTitle, card, displayTitle } from "@/components/layouts/InfoPageLayout";
import { pageMetadata } from "@/lib/site";
import { Kicker } from "@/components/typography/Kicker";

export const metadata = pageMetadata({
  title: "Refund Policy",
  description:
    "Bandit Brothers refund and cancellation policy: all sales are final. No cancellations, refunds or returns once an order is placed.",
  path: "/refunds",
  image: null, // opengraph-image.tsx
});

const VERDICTS = [
  { kicker: "Cancellations", word: "Cancel", body: "Orders can't be cancelled once payment is confirmed." },
  { kicker: "Refunds & returns", word: "Refund", body: "We don't offer refunds or returns on any order." },
];

const CHECKS = [
  {
    icon: <Ruler />,
    title: "Check your size",
    body: "Sizes are listed on every product page. Unsure? Message us before ordering.",
  },
  {
    icon: <Eye />,
    title: "Look twice at the design",
    body: "Swipe through every photo. Product, design and colour are exactly what ships.",
  },
  {
    icon: <MapPin />,
    title: "Confirm your address",
    body: "We deliver to the address you enter, so double-check the pincode and phone.",
  },
];

export default function RefundsPage() {
  return (
    <InfoPageLayout
      crumb="Refund Policy"
      title="All sales"
      accent="final."
      lede="We're a small crew making things in small batches, so we keep it simple: once an order is placed, it's yours.">
      <section className="grid md:grid-cols-2 gap-4 pt-12 md:pt-14">
        {VERDICTS.map(v => (
          <div key={v.word} className={`${card} md:p-8`}>
            <Kicker className="mb-0">{v.kicker}</Kicker>
            <div
              className={`${displayTitle} text-6xl md:text-7xl mt-4 line-through decoration-bandit-orange decoration-[6px]`}
              aria-label={`No ${v.word.toLowerCase()}`}>
              {v.word}
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">{v.body}</p>
          </div>
        ))}
      </section>

      <section className="pt-14">
        <SectionTitle aside="Two minutes now, no regrets later.">Before you check out</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          {CHECKS.map(c => (
            <div key={c.title} className={`${card} flex gap-4 items-start`}>
              <IconBox className="shrink-0">{c.icon}</IconBox>
              <div>
                <h3 className="font-semibold mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  );
}
