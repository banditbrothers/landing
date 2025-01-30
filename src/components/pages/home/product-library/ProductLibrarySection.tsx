import { Design, DESIGNS as designsData } from "@/data/designs";

import { useEffect, useState } from "react";

import { shuffleArray } from "@/utils/misc";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/carousels/ProductCarousel";

import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";

export const ProductLibraryContent = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isHowToWearDialogOpen, setIsHowToWearDialogOpen] = useState(false);

  useEffect(() => {
    const shuffledDesigns = shuffleArray(designsData);
    setDesigns(shuffledDesigns);
  }, []);

  return (
    <section id="library" className="py-20 scroll-mt-16">
      <div className=" mx-auto">
        <div className={`mb-16 flex justify-between items-center gap-4 max-w-screen-2xl mx-auto px-6 flex-col`}>
          <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center gap-4 relative">
            <span>Our Products</span>
          </h2>
          <div className="flex flex-row gap-4">
            <Button variant="link" onClick={() => setIsHowToWearDialogOpen(true)}>
              <span>How to Wear</span>
            </Button>
            <Link href="/designs">
              <Button variant="link">
                <span>View All</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto">
          <ProductCarousel designs={designs} />
        </div>
      </div>

      <HowToWearDialog open={isHowToWearDialogOpen} onClose={() => setIsHowToWearDialogOpen(false)} />
    </section>
  );
};

export const ProductLibrary = () => {
  return <ProductLibraryContent />;
};
