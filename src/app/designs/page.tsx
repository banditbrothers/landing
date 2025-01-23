"use client";

import { ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { Design, designs } from "@/data/designs";
import { ProductDialog } from "@/components/dialogs/ProductDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingIcon } from "@/components/misc/Loading";
import { Button } from "@/components/ui/button";

function DesignsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDesignId = searchParams.get("modalDesign");

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
      <ProductDialog designId={selectedDesignId} onClose={handleDesignOnClose} />
      <div className="container mx-auto mt-16 min-h-screen">
        <div className="pt-16 mx-auto">
          <div className="flex flex-col gap-4">
            <div className="text-4xl max-w-screen-2xl mx-auto">
              <div className="flex flex-col gap-4">
                <span className="w-fit font-bold">Our Mischief</span>
                <Button variant="link">
                  <span>How to Wear</span>
                </Button>
              </div>
            </div>
            <div>
              <ProductGridLayout
                designs={designs}
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
