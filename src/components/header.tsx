"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { scrollTo } from "@/utils/helpers";
import { getWhatsappShopNowLink } from "@/utils/whatsappMessageLinks";

import { FullLogo } from "./fullLogo";

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
          <FullLogo size={120} />
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("features");
                }}
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
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("testimonials");
                }}
                className={`hover:text-gray-300 transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Testimonials
              </a>
            </li>
            <li>
              <a
                href={getWhatsappShopNowLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:text-gray-300 transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Shop
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
