"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import useDeviceType from "@/hooks/useDeviceType";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useDeviceType();

  const pathname = usePathname();

  const isHomePath = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let logoPosition;
  if (isMobile) logoPosition = "justify-center";
  else {
    if (isHomePath) logoPosition = "justify-between";
    else logoPosition = "justify-center";
  }

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${
        !isHomePath
          ? "bg-background"
          : isScrolled
          ? "bg-background"
          : "bg-transparent"
      }`}
      initial={{ y: isHomePath ? -100 : 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`container mx-auto px-4 py-4 flex items-center ${logoPosition}`}
      >
        <div className="flex items-center space-x-2">
          <Link href="/">
            <h1 className="text-3xl text-bandit-orange font-calera">
              BANDIT BROTHERS
            </h1>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
