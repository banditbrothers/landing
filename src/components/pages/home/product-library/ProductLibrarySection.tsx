import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/carousels/ProductCarousel";

import { ArrowRight } from "lucide-react";
import { useVariants } from "@/hooks/useVariants";
import { getTimestamp } from "@/utils/timestamp";

export const ProductLibraryContent = () => {
  const { data: variants } = useVariants();

  const bestSellerVariants = variants.filter(v => v.isBestSeller);

  const newArrivalsVariants = variants.filter(v => getTimestamp() - v.createdAt < 30 * 24 * 60 * 60); // 30 days
  const last10NewArrivalsVariants = variants.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  const unionVariants = [...newArrivalsVariants, ...last10NewArrivalsVariants].filter(
    (variant, index, array) => array.findIndex(v => v.id === variant.id) === index
  );

  return (
    <>
      <section id="library-bestsellers" className="scroll-mt-16">
        <div className=" mx-auto">
          <div className={`mb-16 flex justify-between items-center max-w-screen-2xl mx-auto px-6 flex-col`}>
            <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center relative">
              Our Best Sellers
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
      {unionVariants.length > 0 && (
        <section id="library-new" className="scroll-mt-16">
          <div className=" mx-auto">
            <div className={`mb-16 flex justify-between items-center max-w-screen-2xl mx-auto px-6 flex-col`}>
              <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center relative">
                New Arrivals
              </h2>
            </div>
            <div className="mx-auto flex flex-col items-center gap-10">
              <ProductCarousel variants={unionVariants} />
              <Link href="/products">
                <Button variant="bandit-hover" className="group">
                  <span>View All Products</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export const ProductLibrary = () => {
  return <ProductLibraryContent />;
};
