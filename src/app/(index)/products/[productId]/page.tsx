"use client";

import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { Button } from "@/components/ui/button";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { useEffect, useState } from "react";
import { shuffleArray } from "@/utils/misc";
import { LoadingIcon } from "@/components/misc/Loading";
import { useVariants } from "@/hooks/useVariants";

function ProductPageContent() {
  const { data: variants, error } = useVariants();

  const [isHowToWearDialogOpen, setIsHowToWearDialogOpen] = useState(false);

  return (
    <>
      <HowToWearDialog open={isHowToWearDialogOpen} onClose={() => setIsHowToWearDialogOpen(false)} />

      <div className="container mx-auto mt-16 min-h-screen">
        <div className="pt-16 mx-auto">
          <div className="flex flex-col gap-4">
            <div className=" max-w-screen-2xl mx-auto">
              <div className="flex flex-col gap-4">
                <span className="text-4xl w-fit font-bold">Our Mischief</span>
                <Button variant="link" onClick={() => setIsHowToWearDialogOpen(true)}>
                  <span>How to Wear</span>
                </Button>
              </div>
            </div>
            <div>
              <ProductGridLayout productVariants={variants ?? []} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductPage() {
  return <ProductPageContent />;
}
