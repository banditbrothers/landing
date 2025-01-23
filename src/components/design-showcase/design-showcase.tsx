import { Design, designs as designsData } from "@/data/designs";

import { ProductDialog } from "./designDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LoadingIcon } from "../misc/loadingScreen";
import { DesignCarousel } from "./carousel";
import { DesignGrid } from "./grid";
import { GalleryHorizontal } from "lucide-react";
import { Grid2X2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { shuffleArray } from "@/utils/misc";
import useDeviceType from "@/hooks/useDeviceType";
import Link from "next/link";

export const DesignLibraryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDesignId = searchParams.get("modalDesign");

  const isMobile = useDeviceType();

  const [selectedShowcaseType, setSelectedShowcaseType] = useState<"carousel" | "grid">("carousel");
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    const shuffledDesigns = shuffleArray(designsData);
    setDesigns(shuffledDesigns);
  }, []);

  /**
   *
   * this method of push and replace is causing the browser stack to grow which is not ideal.
   * we need to `push` always because otherwise on mobile the back button would exit the browser onDialogClose.
   * need to think of a better solution.
   *
   * */
  const handleDesignClick = (design: Design) => {
    router.push(`?modalDesign=${design.id}`, { scroll: false });
  };

  const handleDesignOnClose = () => {
    router.replace(window.location.pathname, { scroll: false });
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
            <Button variant="link">
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
            <DesignCarousel
              designs={designs}
              selectedDesignId={selectedDesignId}
              handleDesignClick={handleDesignClick}
            />
          ) : (
            <DesignGrid designs={designs} selectedDesignId={selectedDesignId} handleDesignClick={handleDesignClick} />
          )}
        </div>
      </div>

      <ProductDialog designId={selectedDesignId} onClose={handleDesignOnClose} />
    </section>
  );
};

export const DesignLibrary = () => {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <DesignLibraryContent />
    </Suspense>
  );
};
