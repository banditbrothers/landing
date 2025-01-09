"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import { ProductLibrary } from "@/components/product-showcase/product-showcase";
import { getWhatsappShopNowLink } from "@/utils/whatsappMessageLinks";
import { ProductSpecifications } from "@/components/product-specs/product-specs";
import { Hero } from "@/components/hero/hero";
import { Features } from "@/components/features/features";
import { Testimonials } from "@/components/testimonials/testimonials";

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    });

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <Hero />

      <ProductLibrary />

      <ProductSpecifications />

      <Features />

      <Testimonials />

      <section
        id="cta"
        className="bg-background text-foreground py-20 scroll-mt-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Enhance Your Ride?
          </h2>
          <p className="text-xl mb-10">
            Join thousands of satisfied Bikers and experience the Bandit
            Brothers difference today.
          </p>
          <Button
            size="lg"
            variant="bandit-hover"
            onClick={() =>
              window.open(
                getWhatsappShopNowLink(),
                "_blank",
                "noreferrer noopener"
              )
            }
          >
            Shop Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
