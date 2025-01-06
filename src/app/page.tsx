"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { whatsappShopNowLink } from "@/data/socials";
import { scrollTo } from "@/utils/helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";

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

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-information">
                <AccordionTrigger>
                  <AccordionTitle>Additional Information</AccordionTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong>Material</strong>
                      <br />
                      Quick Dry Polyester-Spandex - 160 GSM
                    </div>
                    <div>
                      <strong>Weight</strong>
                      <br />
                      50 grams
                    </div>
                    <div>
                      <strong>Country of Origin</strong>
                      <br />
                      India
                    </div>
                    <div>
                      <strong>Sizing</strong>
                      <br />
                      Free sizing
                    </div>
                    <div>
                      <strong>Closure Type</strong>
                      <br />
                      Pull-On
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="description">
                <AccordionTrigger>
                  <AccordionTitle>Description</AccordionTitle>
                </AccordionTrigger>
                <AccordionContent>
                  We use premium, breathable fabrics that are specifically
                  chosen for motorcycle wear. Our materials are tested for
                  durability and comfort in various weather conditions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wash-and-care">
                <AccordionTrigger>
                  <AccordionTitle>Wash and Care</AccordionTitle>
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we ship worldwide! Shipping times and costs vary
                  depending on your location. You can view specific shipping
                  details during checkout.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-and-return-policy">
                <AccordionTrigger>
                  <AccordionTitle>Shipping and Return Policy</AccordionTitle>
                </AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return policy for unused items in original
                  packaging. Contact our customer service team through WhatsApp
                  for return instructions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <Features />

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
              window.open(whatsappShopNowLink, "_blank", "noreferrer noopener")
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
