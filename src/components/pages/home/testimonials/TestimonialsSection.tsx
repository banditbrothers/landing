"use client";

import { SkeletonImage } from "@/components/misc/SkeletonImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewWithoutEmail } from "@/types/review";
import { StarRating } from "@/components/misc/StarRating";
import { ClickableProductBadge } from "@/components/badges/ClickableProductBadges";
import { useVariants } from "@/hooks/useVariants";
import { getProductVariantName } from "@/utils/product";
import { Reveal, SectionHead } from "@/components/misc/Reveal";

const FEATURED_REVIEWS: ReviewWithoutEmail[] = [
  {
    id: "h0m9VV8in6nnmQI5N1yc",
    rating: 5,
    orderId: "GqN6qRnjSAx2CARC1lJb",
    createdAt: 1739305409,
    source: "website",
    variantIds: ["BANDANA-TICK_TICK_BOOM"],
    images: [
      "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2Fh0m9VV8in6nnmQI5N1yc%2F0.jpg?alt=media&token=29b7ac29-88c0-4ae0-88f6-57a0a57a18f4",
    ],
    status: "approved",
    name: "Shamoil Arsiwala",
    title: "The material is unreal",
    comment:
      "You need to feel it to believe it. The material is much better than what is offered by competitors and the prints are soo vibrant!",
  },
  {
    id: "uRkhsQX2EmEElz2w1HeJ",
    name: "Tasneem Lokhandwala",
    title: "Cannot wait to shop more!",
    comment: "Such good quality, prompt delivery and fun designs. A brand that truly understands its customer’s needs.",
    rating: 5,
    source: "website",
    orderId: "9DW96RgvvNhRiUazRvPX",
    createdAt: 1741213282,
    variantIds: ["BANDANA-FIN_TASTIC"],
    images: [
      "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2FuRkhsQX2EmEElz2w1HeJ%2F0.jpeg?alt=media&token=edce2a58-4c63-4f8b-bf72-492a10922d3e",
    ],
    status: "approved",
  },
  {
    id: "YEWqracylGrNMFzjj7ja",
    name: "Hatim Shirazi",
    title: "Must buy!!!",
    comment:
      "Must buy for all the riders out there!\nThe material is breathable and is perfect for daily/long rides.\nLoved the design as well!\n10/10 would recommend!🙌🏽",
    rating: 5,
    source: "website",
    orderId: "5TqcbXUEXzIO2duKe5G9",
    createdAt: 1739720056,
    variantIds: ["BANDANA-AKATSUKI_ALLURE"],
    images: [
      "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2FYEWqracylGrNMFzjj7ja%2F0.jpeg?alt=media&token=fdf9c463-d04c-4d3f-ba47-9e12dbaf93ed",
    ],
    status: "approved",
  },
];

const titleCase = (name: string) =>
  name
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export const TestimonialsSection = () => {
  const { data: variants } = useVariants();

  return (
    <section id="reviews" className="scroll-mt-20 max-w-screen-2xl mx-auto px-4 md:px-8">
      <SectionHead
        kicker="Word on the street"
        title={
          <>
            Bandits <span className="text-bandit-orange">talk</span>
          </>
        }>
        <Link
          href="/reviews"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit">
          Read all reviews
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </SectionHead>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {FEATURED_REVIEWS.map((review, i) => (
          <Reveal key={review.id} delay={i * 0.1} className={i === 1 ? "md:mt-12" : ""}>
            <figure className="group h-full flex flex-col rounded-3xl bg-card border border-border overflow-hidden transition hover:-translate-y-1 hover:border-bandit-orange/60">
              {review.images[0] && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SkeletonImage
                    src={review.images[0]}
                    alt={review.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <StarRating value={review.rating} />
                <h3 className="font-calera uppercase text-2xl leading-tight">&ldquo;{review.title}&rdquo;</h3>
                <blockquote className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {review.comment}
                </blockquote>
                <figcaption className="mt-auto pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{titleCase(review.name)}</span>
                  {review.source === "website" &&
                    review.variantIds.map(id => {
                      const variant = variants.find(v => v.id === id);
                      return variant ? (
                        <ClickableProductBadge variant={variant} key={id}>
                          {getProductVariantName(variant)}
                        </ClickableProductBadge>
                      ) : null;
                    })}
                </figcaption>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
