"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Header from "@/components/header";
import FeatureCard from "@/components/featureCard";
import TestimonialCard from "@/components/testimonialCard";
import Footer from "@/components/footer";

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
          src="/placeholder.svg?height=1080&width=1920"
          alt="Biker wearing Bandit Brothers"
          layout="fill"
          objectFit="cover"
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
            Ride in Style, Stay Cool
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
            >
              Discover Bandit Brothers
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Bikers Love Bandit Brothers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Moisture-Wicking",
                description: "Keeps you dry during intense rides",
                icon: "💧",
              },
              {
                title: "UV Protection",
                description: "Shields your neck and face from harmful sun rays",
                icon: "☀️",
              },
              {
                title: "Breathable Fabric",
                description: "Allows air flow to keep you cool",
                icon: "🌬️",
              },
              {
                title: "Versatile Design",
                description: "Wear it as a headband, neck gaiter, or face mask",
                icon: "🔄",
              },
              {
                title: "Reflective Elements",
                description: "Enhances visibility during low-light conditions",
                icon: "✨",
              },
              {
                title: "Easy Care",
                description: "Machine washable and quick-drying",
                icon: "🧼",
              },
            ].map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our Riders Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex R.",
                quote:
                  "Bandit Brothers is a game-changer for my daily commutes. It's comfortable and keeps me protected from the elements.",
                image: "/placeholder.svg?height=100&width=100",
              },
              {
                name: "Sarah L.",
                quote:
                  "I love how versatile Bandit Brothers is. It's perfect for both casual rides and intense training sessions.",
                image: "/placeholder.svg?height=100&width=100",
              },
              {
                name: "Mike T.",
                quote:
                  "The UV protection is fantastic. I no longer worry about sunburn on long summer rides.",
                image: "/placeholder.svg?height=100&width=100",
              },
            ].map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="bg-gray-900 text-white py-20">
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
          >
            Shop Bandit Brothers Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
