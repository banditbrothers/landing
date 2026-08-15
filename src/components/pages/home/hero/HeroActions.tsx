"use client";

import { m } from "motion/react";
import { scrollTo } from "@/utils/misc";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroActions() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}>
      <div className="flex flex-row justify-center items-center gap-4">
        <Link href="/products">
          <Button size="lg" variant="bandit-hover" className="group">
            Explore Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Button size="lg" variant="outline" onClick={() => scrollTo("library-bestsellers")}>
          Best Sellers
        </Button>
      </div>
    </m.div>
  );
}
