import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { ReviewWithoutEmail } from "@/types/review";

const FEATURED_REVIEWS: ReviewWithoutEmail[] = [
  {
    id: "h0m9VV8in6nnmQI5N1yc",
    rating: 5,
    orderId: "GqN6qRnjSAx2CARC1lJb",
    createdAt: 1739305409,
    source: "website",
    productIds: ["tick-tick-boom"],
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
    productIds: ["fin-tastic"],
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
    productIds: ["akatsuki-allure"],
    images: [
      "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2FYEWqracylGrNMFzjj7ja%2F0.jpeg?alt=media&token=fdf9c463-d04c-4d3f-ba47-9e12dbaf93ed",
    ],
    status: "approved",
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="reviews" className="bg-background text-foreground scroll-mt-16">
      <div className="container mx-auto px-4 mb-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Looking for reviews?</h2>
          <p className="text-muted-foreground mb-6">Hear It From Our Fellow Bandits</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {FEATURED_REVIEWS.map(review => (
            <span className="flex-1" key={review.id}>
              <ReviewCard review={review} containerStyle={{ minHeight: 720 }} />
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mt-10">
          <Link href="/reviews">
            <Button variant="bandit-hover" className="group">
              View All Reviews
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
