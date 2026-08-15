"use client";

import { useEffect } from "react";

import { ProductLibrary } from "@/components/pages/home/product-library/ProductLibrarySection";
import { KnowYourProductSection } from "@/components/pages/home/know-your-product/KnowYourProductSection";
import { TestimonialsSection } from "@/components/pages/home/testimonials/TestimonialsSection";
import { InstagramFeedSection } from "@/components/pages/home/instagram/InstagramFeedSection";
import { HowToWearSection } from "@/components/pages/home/how-to-wear/HowToWearSection";

export function LandingPageSections() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    });

    document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ProductLibrary />
      <HowToWearSection />
      <TestimonialsSection />
      <KnowYourProductSection />
      <InstagramFeedSection />
    </>
  );
}
