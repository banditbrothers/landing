import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Check } from "lucide-react";
import { ReviewWithoutEmail } from "@/types/review";
import { StarRating } from "../misc/StarRating";
import { useVariants } from "@/hooks/useVariants";
import { PRODUCTS_OBJ } from "@/data/products";
import { getProductVariantName } from "@/utils/product";
import { routes } from "@/utils/routes";
import { getTimestamp, SECONDS_PER_DAY } from "@/utils/timestamp";

const words = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// "Abbas Merchant" → "Abbas M.": keeps full customer names off a public page
export const shortName = (name: string) => {
  const w = words(name);
  return w.length > 1 ? `${w[0]} ${w[w.length - 1][0]}.` : w[0];
};

const initials = (name: string) => {
  const w = words(name);
  return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * SECONDS_PER_DAY],
  ["month", 30 * SECONDS_PER_DAY],
  ["week", 7 * SECONDS_PER_DAY],
  ["day", SECONDS_PER_DAY],
];
const timeAgo = (seconds: number) => {
  const diff = getTimestamp() - seconds;
  const [unit, size] = UNITS.find(([, s]) => diff >= s) ?? ["day", SECONDS_PER_DAY];
  return rtf.format(-Math.floor(diff / size), unit);
};

const GEAR_SHORT: Record<string, string> = { "square-bandana": "Square" };

interface ReviewCardProps {
  review: ReviewWithoutEmail;
  /** Orange pull-quote treatment for short, photo-less reviews */
  loud?: boolean;
  priority?: boolean;
  /** Highlights this variant in the "bought" chips */
  currentVariantId?: string;
}

export const ReviewCard = ({ review, loud = false, priority = false, currentVariantId }: ReviewCardProps) => {
  const { data: variants } = useVariants();
  const bought =
    review.source === "website" ? review.variantIds.map(id => variants.find(v => v.id === id)).filter(v => !!v) : [];
  const photo = review.images[0];

  return (
    <article
      id={`r-${review.id}`}
      className={`scroll-mt-28 rounded-2xl border overflow-hidden transition hover:-translate-y-0.5 ${
        loud ? "bg-bandit-orange border-bandit-orange text-bandit-ink" : "bg-card border-border hover:border-zinc-600"
      }`}>
      {photo && (
        <div className="relative aspect-[4/5] bg-secondary">
          <Skeleton className="absolute inset-0 rounded-none" />
          <Image
            fill
            src={photo}
            alt={`${shortName(review.name)}'s photo`}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      )}

      <div className={loud ? "px-6 pt-7 pb-5" : "p-5 md:p-6"}>
        {loud && <span className="block font-calera text-[90px] leading-[0.5] h-8">“</span>}
        <div className="flex items-center justify-between gap-3">
          <StarRating
            value={review.rating}
            className={`[&_svg]:w-[15px] [&_svg]:h-[15px] ${loud ? "[&_.fill-bandit-orange]:fill-bandit-ink [&_.fill-bandit-orange]:text-bandit-ink" : ""}`}
          />
          {/* Server-rendered pages can be up to a day old, so "6 days ago" may become "last week" on the client */}
          <small
            suppressHydrationWarning
            className={`text-xs ${loud ? "text-bandit-ink/70" : "text-muted-foreground"}`}>
            {timeAgo(review.createdAt)}
          </small>
        </div>
        <h3
          className={
            loud
              ? "font-calera uppercase text-[46px] leading-[0.92] mt-1"
              : "text-xl md:text-[21px] font-bold leading-tight tracking-tight mt-3"
          }>
          {review.title.trim()}
        </h3>
        <p className={`text-[15px] leading-relaxed mt-2.5 ${loud ? "text-bandit-ink/80" : "text-zinc-300"}`}>
          {review.comment}
        </p>

        {bought.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {bought.map(v => (
              <Link
                key={v.id}
                href={routes.variant(v)}
                aria-current={v.id === currentVariantId ? "page" : undefined}
                className={`inline-flex items-center gap-2 max-w-full min-h-9 py-[3px] pl-[3px] pr-3.5 rounded-[18px] text-[13px] transition-colors aria-[current]:ring-1 aria-[current]:ring-bandit-orange ${
                  loud
                    ? "bg-bandit-ink/[.12] hover:bg-bandit-ink hover:text-bandit-orange"
                    : "bg-secondary hover:bg-bandit-orange/10 hover:text-bandit-orange"
                }`}>
                {v.images.mockup[0] && (
                  <span className="relative w-[30px] h-[30px] shrink-0 rounded-full overflow-hidden">
                    <Skeleton className="absolute inset-0 rounded-none" />
                    <Image
                      src={v.images.mockup[0]}
                      alt=""
                      width={30}
                      height={30}
                      className="relative w-full h-full object-cover"
                    />
                  </span>
                )}
                {/* One text run so long names wrap as a sentence instead of splitting into two columns */}
                <span className="leading-snug">
                  {getProductVariantName(v)}{" "}
                  <span className="whitespace-nowrap opacity-55">
                    · {GEAR_SHORT[v.productId] ?? PRODUCTS_OBJ[v.productId]?.name}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}

        <div
          className={`flex items-center gap-2.5 mt-4 pt-4 border-t border-dashed text-sm ${loud ? "border-bandit-ink/25" : "border-border"}`}>
          <span
            className={`grid place-items-center w-[34px] h-[34px] rounded-full text-[13px] font-bold ${
              loud ? "bg-bandit-ink text-bandit-orange" : "bg-bandit-orange text-bandit-ink"
            }`}>
            {initials(review.name)}
          </span>
          {shortName(review.name)}
          {review.source === "website" && (
            <span
              className={`ml-auto inline-flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase ${
                loud ? "text-bandit-ink/70" : "text-muted-foreground"
              }`}>
              <Check className={`w-3.5 h-3.5 ${loud ? "" : "text-bandit-orange"}`} strokeWidth={2.4} />
              Verified buyer
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
