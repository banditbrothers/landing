import { Design, DESIGNS as designsData } from "@/data/designs";

import { Suspense, useEffect, useState } from "react";
import { GalleryHorizontal } from "lucide-react";
import { Grid2X2Icon } from "lucide-react";

import { shuffleArray } from "@/utils/misc";
import useIsMobile from "@/hooks/useIsMobile";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { ProductCarousel } from "@/components/carousels/ProductCarousel";
import { ProductDialog } from "@/components/dialogs/ProductDialog";
import { LoadingIcon } from "@/components/misc/Loading";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { useParamBasedDialog } from "@/hooks/useParamBasedDialog";

export const ProductLibraryContent = () => {
  const {
    value: selectedDesignId,
    closeDialog: closeDesignDialog,
    openDialog: openDesignDialog,
  } = useParamBasedDialog("design");

  const {
    value: isHowToWearDialogOpen,
    closeDialog: closeHowToWearDialog,
    openDialog: openHowToWearDialog,
  } = useParamBasedDialog("how-to-wear");

  const isMobile = useIsMobile();

  const [selectedShowcaseType, setSelectedShowcaseType] = useState<"carousel" | "grid">("carousel");
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    const shuffledDesigns = shuffleArray(designsData);
    setDesigns(shuffledDesigns);
  }, []);

  const handleDesignClick = (design: Design) => {
    openDesignDialog(design.id);
  };

  return (
    <section id="product-library" className="py-20 scroll-mt-16">
      <div className=" mx-auto">
        <div className={`mb-16 flex justify-between items-center gap-4 max-w-screen-2xl mx-auto px-6 flex-col`}>
          <h2 className="text-4xl font-bold text-center flex flex-row justify-center items-center gap-4 relative">
            <span>Our Products</span>
            {!isMobile && (
              <span className="absolute top-1 -right-[65%]">
                {selectedShowcaseType === "carousel" ? (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedShowcaseType("grid")}
                    className="flex flex-row gap-2 items-center min-w-32">
                    <Grid2X2Icon />
                    <span>Grid</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedShowcaseType("carousel")}
                    className="flex flex-row gap-2 items-center min-w-32">
                    <GalleryHorizontal />
                    <span>Carousel</span>
                  </Button>
                )}
              </span>
            )}
          </h2>
          <div className="flex flex-row gap-4">
            <Button variant="link" onClick={() => openHowToWearDialog("true")}>
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
          {selectedShowcaseType === "carousel" ? (
            <ProductCarousel
              designs={designs}
              selectedDesignId={selectedDesignId}
              handleDesignClick={handleDesignClick}
            />
          ) : (
            <ProductGridLayout
              designs={designs}
              selectedDesignId={selectedDesignId}
              handleDesignClick={handleDesignClick}
            />
          )}
        </div>
      </div>

      <ProductDialog designId={selectedDesignId} onClose={closeDesignDialog} />
      <HowToWearDialog open={!!isHowToWearDialogOpen} onClose={closeHowToWearDialog} />
    </section>
  );
};

export const ProductLibrary = () => {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <ProductLibraryContent />
    </Suspense>
  );
};
