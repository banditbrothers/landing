"use client";

import { Design, designs } from "@/data/designs";
import { shuffleArray } from "@/utils/misc";
import { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";

export const RecommendedProducts = ({ currentDesignId, count = 5 }: { currentDesignId: string; count?: number }) => {
  const [recommendedDesigns, setRecommendedDesigns] = useState<Design[]>([]);

  useEffect(() => {
    setRecommendedDesigns(shuffleArray(designs.filter(d => d.id !== currentDesignId)));
  }, [currentDesignId]);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendedDesigns.slice(0, count).map(relatedDesign => (
          <Link key={relatedDesign.id} href={`/design/${relatedDesign.id}`} className="group cursor-pointer">
            <div className="relative aspect-square mb-2">
              <Image
                src={relatedDesign.image}
                alt={relatedDesign.name}
                fill
                className="object-cover rounded-lg transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-medium text-foreground">{relatedDesign.name}</h3>
            <p className="text-muted-foreground">₹{relatedDesign.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
