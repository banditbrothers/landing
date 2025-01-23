"use client";

import { Design, designs } from "@/data/designs";
import { shuffleArray } from "@/utils/misc";
import { useState } from "react";
import { useEffect } from "react";
import { DesignCard, DesignNameAndPriceBanner } from "../../cards/DesignCard";
import { ProductDialog } from "../../dialogs/ProductDialog";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export const RecommendedProducts = ({ currentDesignId, count = 4 }: { currentDesignId: string; count?: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDesignId = searchParams.get("modalDesign");

  const [recommendedDesigns, setRecommendedDesigns] = useState<Design[]>([]);

  useEffect(() => {
    setRecommendedDesigns(shuffleArray(designs.filter(d => d.id !== currentDesignId)));
  }, [currentDesignId]);

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
    <>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedDesigns.slice(0, count).map(relatedDesign => (
            <DesignCard
              key={relatedDesign.id}
              showRingAroundSelectedCard
              design={relatedDesign}
              onClick={() => handleDesignClick(relatedDesign)}
              selected={selectedDesignId === relatedDesign.id}>
              <DesignNameAndPriceBanner design={relatedDesign} />
            </DesignCard>
          ))}
        </div>
      </div>
      <ProductDialog designId={selectedDesignId} onClose={handleDesignOnClose} />
    </>
  );
};
