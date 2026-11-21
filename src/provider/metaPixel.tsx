"use client";

import { Suspense, useEffect } from "react";
import ReactPixel from "react-facebook-pixel";
import { usePathname, useSearchParams } from "next/navigation";
import { META_PIXEL_ID } from "@/lib/site";


function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize pixel
    ReactPixel.init(META_PIXEL_ID, undefined, {
      autoConfig: true,
      debug: process.env.NODE_ENV === "development",
    });

    // Track initial page view
    ReactPixel.pageView();
  }, []);

  // Track route changes for SPAs
  useEffect(() => {
    ReactPixel.pageView();
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <MetaPixelTracker />
      </Suspense>
      {children}
    </>
  );
}
