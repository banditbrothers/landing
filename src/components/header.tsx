"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Bandit Brothers Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a
                href="#features"
                className={`hover:text-gray-300 transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className={`hover:text-gray-300 transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Testimonials
              </a>
            </li>
            <li>
              <a
                href="#cta"
                className={`hover:text-gray-300 transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Shop Now
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
