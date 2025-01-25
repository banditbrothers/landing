"use client";

import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { Design, DESIGNS } from "@/data/designs";
import { ProductDialog } from "@/components/dialogs/ProductDialog";
import { Suspense } from "react";
import { LoadingIcon } from "@/components/misc/Loading";
import { Button } from "@/components/ui/button";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";

function DesignsPageContent() {
  const {
    value: selectedDesignId,
    removeParam: closeDesignDialog,
    setParam: openDesignDialog,
  } = useParamBasedFeatures<string>("design");

  const {
    value: isHowToWearDialogOpen,
    removeParam: closeHowToWearDialog,
    setParam: openHowToWearDialog,
  } = useParamBasedFeatures<string>("how-to-wear");

  const handleDesignOnClose = () => {
    closeDesignDialog();
  };

  const handleDesignClick = (design: Design) => {
    openDesignDialog(design.id);
  };

  return (
    <>
      <ProductDialog designId={selectedDesignId} onClose={handleDesignOnClose} />
      <HowToWearDialog open={!!isHowToWearDialogOpen} onClose={closeHowToWearDialog} />

      <div className="container mx-auto mt-16 min-h-screen">
        <div className="pt-16 mx-auto">
          <div className="flex flex-col gap-4">
            <div className="text-4xl max-w-screen-2xl mx-auto">
              <div className="flex flex-col gap-4">
                <span className="w-fit font-bold">Our Mischief</span>
                <Button variant="link" onClick={() => openHowToWearDialog("true")}>
                  <span>How to Wear</span>
                </Button>
              </div>
            </div>
            <div>
              <ProductGridLayout
                designs={DESIGNS}
                selectedDesignId={selectedDesignId}
                handleDesignClick={handleDesignClick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DesignsPage() {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <DesignsPageContent />
    </Suspense>
  );
}
