"use client";

import { getReviews } from "@/actions/reviews";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { MasonryGridItem, MasonryGridLayout } from "@/components/layouts/MasonryGridLayout";
import { Review } from "@/types/review";
import { getTimestamp } from "@/utils/timestamp";
import { useEffect } from "react";
import { useState } from "react";

// const reviews: Review[] = [
//   {
//     id: "1",
//     orderId: "1",
//     name: "John Doe",
//     email: "john@example.com",
//     rating: 5,
//     title: "Great Product",
//     comment: "I love this product!",
//     images: ["https://picsum.photos/200/300"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["mooshi-mooshi", "psychedelic-chaos", "sketchy-business"],
//   },
//   {
//     id: "2",
//     orderId: "2",
//     name: "Alice Smith",
//     email: "alice@example.com",
//     rating: 4,
//     title: "Very Satisfied",
//     comment:
//       "The quality exceeded my expectations. Would definitely recommend to others looking for a reliable product.",
//     images: ["https://picsum.photos/200/301"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["psychedelic-chaos"],
//   },
//   {
//     id: "3",
//     orderId: "3",
//     name: "Bob Wilson",
//     email: "bob@example.com",
//     rating: 5,
//     title: "Amazing Purchase",
//     comment: "Simply perfect.",
//     images: ["https://picsum.photos/200/302"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["soda-lightful", "sketchy-business"],
//   },
//   {
//     id: "4",
//     orderId: "4",
//     name: "Emma Davis",
//     email: "emma@example.com",
//     rating: 5,
//     title: "Outstanding Experience",
//     comment:
//       "I've been using this product for a month now and I'm thoroughly impressed with its performance. The build quality is exceptional, and the customer service has been outstanding. This is exactly what I was looking for and more.",
//     images: ["https://picsum.photos/200/303"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["tick-tick-boom"],
//   },
//   {
//     id: "5",
//     orderId: "5",
//     name: "Sarah Chen",
//     email: "sarah@example.com",
//     rating: 5,
//     title: "Perfect for Adventures",
//     comment:
//       "Got the 'Gimme Some Space' design and I'm over the moon! The fabric quality is amazing and the print is so vibrant.",
//     images: ["https://picsum.photos/200/304"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["gimme-some-space"],
//   },
//   {
//     id: "6",
//     orderId: "6",
//     name: "Mike Johnson",
//     email: "mike@example.com",
//     rating: 4,
//     title: "Cool Design",
//     comment: "The Akatsuki Allure bandana is exactly what I was looking for. Great for cosplay and daily use!",
//     images: ["https://picsum.photos/200/305"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["akatsuki-allure", "sketchy-business"],
//   },
//   {
//     id: "7",
//     orderId: "7",
//     name: "Lisa Park",
//     email: "lisa@example.com",
//     rating: 5,
//     title: "Absolutely Amazing",
//     comment:
//       "Bought the Holy Funk design and wow! The colors are even more vibrant in person. The material feels premium and breathable.",
//     images: ["https://picsum.photos/200/306"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["holy-funk"],
//   },
//   {
//     id: "8",
//     orderId: "8",
//     name: "David Martinez",
//     email: "david@example.com",
//     rating: 5,
//     title: "Best Purchase Ever",
//     comment: "The Sketchy Business design is absolutely rad! Been wearing it everywhere.",
//     images: ["https://picsum.photos/200/307"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["sketchy-business", "psychedelic-chaos"],
//   },
//   {
//     id: "9",
//     orderId: "9",
//     name: "Rachel Kim",
//     email: "rachel@example.com",
//     rating: 4,
//     title: "Cute and Practical",
//     comment: "The Meow Meow design is just purr-fect! My friends keep asking where I got it from.",
//     images: ["https://picsum.photos/200/308"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["meow-meow"],
//   },
//   {
//     id: "10",
//     orderId: "10",
//     name: "Tom Anderson",
//     email: "tom@example.com",
//     rating: 5,
//     title: "Exceeded Expectations",
//     comment:
//       "The Comic Craze bandana is everything I wanted and more. The design is so detailed and the colors really pop!",
//     images: ["https://picsum.photos/200/309"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["comic-craze"],
//   },
//   {
//     id: "11",
//     orderId: "11",
//     name: "Emily Wright",
//     email: "emily@example.com",
//     rating: 5,
//     title: "Love the Design",
//     comment: "Chai Pila Do is such a conversation starter! The quality is top-notch and the design is unique.",
//     images: ["https://picsum.photos/200/310"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["chai-pila-do", "sketchy-business"],
//   },
//   {
//     id: "12",
//     orderId: "12",
//     name: "Kevin Lee",
//     email: "kevin@example.com",
//     rating: 4,
//     title: "Great Quality",
//     comment: "The Zero-G Style bandana is out of this world! Perfect fit and great material quality.",
//     images: ["https://picsum.photos/200/311"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["zero-g-style"],
//   },
//   {
//     id: "13",
//     orderId: "13",
//     name: "Anna Garcia",
//     email: "anna@example.com",
//     rating: 5,
//     title: "Absolutely Perfect",
//     comment: "Got the Frog-it about it design and I couldn't be happier! It's both cute and stylish.",
//     images: ["https://picsum.photos/200/312"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["frog-it-about-it"],
//   },
//   {
//     id: "14",
//     orderId: "14",
//     name: "James Wilson",
//     email: "james@example.com",
//     rating: 5,
//     title: "Amazing Product",
//     comment: "The Awestruck design really lives up to its name. The lightning bolt pattern looks incredible in person!",
//     images: ["https://picsum.photos/200/313"],
//     createdAt: getTimestamp(),
//     status: "approved",
//     productIds: ["awestruck", "sketchy-business"],
//   },
// ];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const reviews = await getReviews();
      setReviews(reviews);
    };
    fetchReviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto mt-32 min-h-screen">
      <div className="px-4">
        <div className="flex flex-row gap-4 items-center justify-center my-16">
          <span className="text-4xl w-fit font-bold text-center">Reviews</span>
        </div>
        <MasonryGridLayout>
          {reviews.map(review => (
            <MasonryGridItem key={review.id}>
              <ReviewCard review={review} />
            </MasonryGridItem>
          ))}
        </MasonryGridLayout>
      </div>
    </div>
  );
}
