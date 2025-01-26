"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { scrollTo } from "@/utils/misc";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "./ui/button";
import { ShoppingBagIcon } from "./misc/icons";

export default function NavBar() {
  const { setParam } = useParamBasedFeatures("cart");
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePath = pathname === "/";

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !isHomePath ? "bg-background" : isScrolled ? "bg-background" : "bg-transparent"
      }`}
      initial={{ y: isHomePath ? -100 : 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}>
      <div className="container mx-auto p-4 gap-4 flex items-center justify-between">
        <div className="min-w-10" />
        <div className="flex items-center">
          <Link
            href="/"
            onClick={e => {
              if (isHomePath) {
                e.preventDefault();
                scrollTo("hero");
              }
            }}>
            <h1 className="text-2xl md:text-3xl text-bandit-orange font-calera ">BANDIT BROTHERS</h1>
          </Link>
        </div>
        <div className="min-w-10">
          <Button variant="outline" onClick={() => setParam("true")}>
            <ShoppingBagIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
