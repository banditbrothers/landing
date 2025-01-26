"use client";

import { Design, DESIGNS } from "@/data/designs";
import { shuffleArray } from "@/utils/misc";
import { useState, useEffect } from "react";
import { DesignCard, DesignNameAndPriceBanner } from "../../cards/DesignCard";

export const RecommendedProducts = ({ currentDesignId, count = 4 }: { currentDesignId: string; count?: number }) => {
  const [recommendedDesigns, setRecommendedDesigns] = useState<Design[]>([]);

  useEffect(() => {
    setRecommendedDesigns(shuffleArray(DESIGNS.filter(d => d.id !== currentDesignId)));
  }, [currentDesignId]);

  return (
    <>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedDesigns.slice(0, count).map(relatedDesign => (
            <DesignCard key={relatedDesign.id} openInNewTab design={relatedDesign}>
              <DesignNameAndPriceBanner design={relatedDesign} />
            </DesignCard>
          ))}
        </div>
      </div>
    </>
  );
};
