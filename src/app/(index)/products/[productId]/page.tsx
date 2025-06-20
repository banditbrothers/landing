"use client";

import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { Button } from "@/components/ui/button";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { useVariants } from "@/hooks/useVariants";
import { useState } from "react";
import { useParams } from "next/navigation";

function ProductPageContent() {
  const { data: variants } = useVariants();

  const [isHowToWearDialogOpen, setIsHowToWearDialogOpen] = useState(false);

  const { productId } = useParams();

  const filteredVariants = variants?.filter(v => v.productId === productId).filter(v => v.isAvailable);

  return (
    <>
      {productId === "bandana" && (
        <HowToWearDialog open={isHowToWearDialogOpen} onClose={() => setIsHowToWearDialogOpen(false)} />
      )}

      <div className="container mx-auto mt-16 min-h-screen">
        <div className="pt-16 mx-auto">
          <div className="flex flex-col gap-4">
            <div className=" max-w-screen-2xl mx-auto">
              <div className="flex flex-col gap-4">
                <span className="text-4xl w-fit font-bold">Our Mischief</span>
                {productId === "bandana" && (
                  <Button variant="link" onClick={() => setIsHowToWearDialogOpen(true)}>
                    <span>How to Wear</span>
                  </Button>
                )}
              </div>
            </div>
            <div>
              <ProductGridLayout productVariants={filteredVariants ?? []} />
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
