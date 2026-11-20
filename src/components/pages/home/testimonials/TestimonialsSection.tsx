"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewWithoutEmail } from "@/types/review";
import { ReviewCard } from "@/components/cards/ReviewCard";
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
  {
    id: "JSLHa02RDDUx2N0ZU9ma",
    name: "Asmaa Ahmed",
    title: "Superb bandanas with unique themes",
    comment: "Great experience, something different and price factor also pocket friendly. Overall good in quality",
    rating: 5,
    source: "website",
    orderId: "7SaCy63KNsQH1ktLRdMq",
    createdAt: 1756316480,
    variantIds: ["BANDANA-LOOKS_FISHY", "BANDANA-MEOW_MEOW"],
    images: [
      "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2FJSLHa02RDDUx2N0ZU9ma%2F0.jpg?alt=media&token=dc3a2ba1-7543-4e54-85f6-259cdcaa8462",
    ],
    status: "approved",
  },
];

export const TestimonialsSection = () => {
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

      {/* Swipe row below lg so the section stays one card tall on phones */}
      <div className="flex gap-4 -mx-4 px-4 md:-mx-8 md:px-8 scroll-px-4 md:scroll-px-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-5 lg:mx-0 lg:px-0 lg:overflow-visible">
        {FEATURED_REVIEWS.map((review, i) => (
          <Reveal key={review.id} delay={i * 0.1} className="w-[80%] sm:w-[45%] shrink-0 snap-start lg:w-auto">
            <ReviewCard review={review} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};
