"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { scrollTo } from "@/utils/misc";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { Button } from "./ui/button";
import { ShoppingBagIcon, SearchIcon } from "./misc/icons";
import { useCart } from "@/components/stores/cart";
import useIsMobile from "@/hooks/useIsMobile";

export default function NavBar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePath = pathname === "/";
  const showNavLinks = !["/order", "/admin", "/terms", "/privacy"].includes(pathname);

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !isHomePath ? "bg-background" : isScrolled ? "bg-background" : "bg-transparent"
      }`}
      initial={{ y: isHomePath ? -100 : 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}>
      <div
        className={`container mx-auto p-4 gap-2 flex items-center ${
          showNavLinks ? "justify-between" : "justify-center"
        }`}>
        {showNavLinks && !isMobile && <div className="min-w-40" />}
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
        {showNavLinks && (
          <div className="min-w-40 flex justify-end gap-2">
            <SearchButton />
            <CartButton />
          </div>
        )}
      </div>
    </motion.header>
  );
}

const CartButton = () => {
  const { setParam } = useParamBasedFeatures("cart", { replaceRoute: true });
  const cartItems = useCart(state => state.cart);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <Button variant="outline" onClick={() => setParam("true")}>
      <ShoppingBagIcon className="w-4 h-4" />
      {totalCartItems > 0 && <span className="text-sm">{totalCartItems}</span>}
    </Button>
  );
};

const SearchButton = () => {
  const { setParam } = useParamBasedFeatures("q", { replaceRoute: true });

  return (
    <Button variant="outline" onClick={() => setParam("")}>
      <SearchIcon className="w-4 h-4" />
    </Button>
  );
};
