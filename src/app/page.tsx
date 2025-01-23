"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

      <section id="cta" className="bg-background text-foreground py-20 scroll-mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Enhance Your Ride?</h2>
          <p className="text-xl mb-10">
            Join thousands of satisfied Bikers and experience the Bandit Brothers difference today.
          </p>
          <Link className="w-full" href="/order" target="_blank">
            <Button size="lg" variant="bandit-hover">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
