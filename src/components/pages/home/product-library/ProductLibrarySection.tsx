import { Design, DESIGNS as designsData } from "@/data/designs";

import { useEffect, useState } from "react";

import { shuffleArray } from "@/utils/misc";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/carousels/ProductCarousel";

import { ArrowRight } from "lucide-react";

export const ProductLibraryContent = () => {
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    const shuffledDesigns = shuffleArray(designsData);
    setDesigns(shuffledDesigns);
  }, []);

  return (
    <section id="library" className="scroll-mt-16">
      <div className=" mx-auto">
        <div className={`mb-16 flex justify-between items-center gap-4 max-w-screen-2xl mx-auto px-6 flex-col`}>
          <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center gap-4 relative">
            Our Products
          </h2>
        </div>
        <div className="mx-auto flex flex-col items-center gap-4">
          <ProductCarousel designs={designs} />
          <Link href="/designs">
            <Button variant="outline" className="group">
              <span>View All</span>
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
