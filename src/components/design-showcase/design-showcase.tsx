import { Design, designs as designsData } from "@/data/designs";

import { ProductDialog } from "./dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LoadingIcon } from "../misc/loadingScreen";
import { DesignCarousel } from "./carousel";
import { DesignGrid } from "./grid";
import { GalleryHorizontal } from "lucide-react";
import { Grid2X2Icon } from "lucide-react";
import { Button } from "../ui/button";

export const DesignLibraryContent = () => {
  const [selectedShowcaseType, setSelectedShowcaseType] = useState<"carousel" | "grid">("carousel");
  const [designs, setDesigns] = useState<Design[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDesignId = searchParams.get("design");

  useEffect(() => {
    const shuffledDesigns = [...designsData].sort(() => Math.random() - 0.5);
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
    router.push(`?design=${design.id}`, { scroll: false });
  };

  const handleDesignOnClose = () => {
    router.replace("/", { scroll: false });
  };

  return (
    <section id="product-library" className="py-20 scroll-mt-16">
      <div className=" mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 flex flex-row justify-center items-center gap-4">
          <span>Our Products</span>
          {selectedShowcaseType === "carousel" ? (
            <Button variant="outline" onClick={() => setSelectedShowcaseType("grid")}>
              <Grid2X2Icon />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setSelectedShowcaseType("carousel")}>
              <GalleryHorizontal />
            </Button>
          )}
        </h2>

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
