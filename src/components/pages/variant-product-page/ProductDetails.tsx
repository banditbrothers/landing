import { DropletsIcon, MoveHorizontalIcon, SunIcon, TruckIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { Product, ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/price";

const PERKS = [
  { icon: DropletsIcon, text: "Quick-Dri DryFit" },
  { icon: SunIcon, text: "UV & dust shield" },
  { icon: MoveHorizontalIcon, text: "4-way stretch" },
  {
    icon: TruckIcon,
    text: MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
      ? `Free ship over ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}`
      : "Ships across India",
  },
];

/** Perk tiles plus the about / material / care / shipping accordion under the buy button */
export const ProductDetails = ({ variant, product }: { variant: ProductVariant; product: Omit<Product, "id"> }) => (
  <>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
      {PERKS.map(({ icon: Icon, text }) => (
        <div key={text} className="p-3.5 rounded-xl bg-card text-center text-xs text-muted-foreground leading-snug">
          <Icon className="w-[22px] h-[22px] mx-auto mb-2 text-bandit-orange" />
          {text}
        </div>
      ))}
    </div>

    {/* Single + collapsible: opening one section closes the other */}
    <Accordion type="single" collapsible defaultValue="About this design" className="border-b border-border">
      <Detail title="About this design">
        {[variant.description, ...product.description].filter(Boolean).map(d => (
          <p key={d}>{d}</p>
        ))}
      </Detail>
      <Detail title="Material & size">
        <dl className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-foreground">Material</dt>
          <dd>{product.material}</dd>
          <dt className="text-foreground">Origin</dt>
          <dd>Made in India</dd>
          {Object.entries(product.dimensions).map(([s, dim]) => (
            <div key={s} className="contents">
              <dt className="text-foreground">{(product.sizeLabels?.[s] ?? s).split(" - ")[0]}</dt>
              <dd>{dim}</dd>
            </div>
          ))}
        </dl>
      </Detail>
      <Detail title="Wash & care">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Wash gently in cold water and let it drip dry in a breezy, shaded spot.</li>
          <li>No wringing, harsh chemicals, dry cleaning or dryers.</li>
          <li>
            For tough stains, use a soft brush with mild pH-neutral soap, gently, to avoid pilling (not covered under
            warranty).
          </li>
          <li>Air dry completely before storing it somewhere cool and shady.</li>
          <li>Unauthorised repairs or alterations void the warranty.</li>
        </ul>
      </Detail>
      <Detail title="Shipping & returns">
        <p>
          We ship within 8–10 business days.
          {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING !== null &&
            ` Free shipping on orders above ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}.`}
        </p>
        <p>
          30-day returns on unused items in original packaging. Damaged or misprinted? Reach us on WhatsApp with an
          unboxing video showing the defect.
        </p>
      </Detail>
    </Accordion>
  </>
);

const Detail = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <AccordionItem value={title} className="border-b-0 border-t border-border">
    <AccordionTrigger className="text-base font-semibold hover:no-underline">{title}</AccordionTrigger>
    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed space-y-2">{children}</AccordionContent>
  </AccordionItem>
);
