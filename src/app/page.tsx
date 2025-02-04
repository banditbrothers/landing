"use client";

import { useEffect } from "react";

import { HeroSection } from "@/components/pages/home/hero/HeroSection";
import { ProductLibrary } from "@/components/pages/home/product-library/ProductLibrarySection";
import { FeaturesSection } from "@/components/pages/home/features/FeaturesSection";
import { KnowYourProductSection } from "@/components/pages/home/know-your-product/KnowYourProductSection";
import { ProductSpecificationsSection } from "@/components/pages/home/product-specs/ProductSpecsSection";
import { TestimonialsSection } from "@/components/pages/home/testimonials/TestimonialsSection";

export default function LandingPage() {
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
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <ProductLibrary />

      <FeaturesSection />

      <KnowYourProductSection />

      <ProductSpecificationsSection />

      <TestimonialsSection />
    </div>
  );
}
