"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <div className="min-h-screen bg-white text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/hero-bg.webp?height=1080&width=1920"
          alt="Biker wearing Bandit Brothers"
          fill
          priority
          style={{ objectFit: "cover" }}
          quality={100}
          className="absolute z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="container mx-auto px-4 z-20 text-center text-white">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Stay Cool, Stay Comfy
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8"
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
              className="bg-white text-gray-800 hover:bg-gray-200 transition-colors duration-300"
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
      <section id="cta" className="bg-gray-900 text-white py-20 scroll-mt-16">
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
            className="bg-white text-gray-800 hover:bg-gray-200 transition-colors duration-300"
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
