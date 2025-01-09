"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Header from "@/components/header";
import Footer from "@/components/footer";

import { scrollTo } from "@/utils/helpers";

import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";
import { ProductLibrary } from "@/components/product";
import { getWhatsappShopNowLink } from "@/utils/whatsappMessageLinks";
import { AdditionalInformation } from "@/components/additional-info";

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
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="container mx-auto px-4 z-20 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Wear Your Mischief
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Experience the ultimate comfort and protection with Bandit Brothers
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 transition-colors duration-300"
              onClick={() => {
                scrollTo("features");
              }}
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      <ProductLibrary />

      <Features />

      {/* FAQ Section */}
      <AdditionalInformation />

      <Testimonials />

      {/* Call to Action Section */}
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
            onClick={() =>
              window.open(
                getWhatsappShopNowLink(),
                "_blank",
                "noreferrer noopener"
              )
            }
          >
            Shop Bandit Brothers Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
