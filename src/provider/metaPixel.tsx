"use client";

import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel";
import { usePathname, useSearchParams } from "next/navigation";

const PIXEL_ID = "1407174127410687";

export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize pixel
    ReactPixel.init(PIXEL_ID, undefined, {
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

  return <>{children}</>;
}
