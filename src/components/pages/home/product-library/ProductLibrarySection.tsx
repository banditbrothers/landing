import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/carousels/ProductCarousel";

import { ArrowRight } from "lucide-react";
import { useVariants } from "@/hooks/useVariants";

export const ProductLibraryContent = () => {
  const { data: variants } = useVariants();

  const bestSellerVariants = variants.filter(v => v.isBestSeller);

  return (
    <section id="library" className="scroll-mt-16">
      <div className=" mx-auto">
        <div className={`mb-16 flex justify-between items-center max-w-screen-2xl mx-auto px-6 flex-col`}>
          <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center relative">
            Our Products
          </h2>
        </div>
        <div className="mx-auto flex flex-col items-center gap-10">
          <ProductCarousel variants={bestSellerVariants} />
          <Link href="/products">
            <Button variant="bandit-hover" className="group">
              <span>View All Products</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export const ProductLibrary = () => {
  return <ProductLibraryContent />;
};
