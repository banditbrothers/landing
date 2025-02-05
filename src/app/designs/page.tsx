"use client";

import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { DESIGNS } from "@/data/designs";
import { Button } from "@/components/ui/button";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { useState } from "react";

function DesignsPageContent() {
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
              <ProductGridLayout designs={DESIGNS} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DesignsPage() {
  return <DesignsPageContent />;
}
