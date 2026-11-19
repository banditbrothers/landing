"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * next/image with a placeholder skeleton that is removed once the image loads.
 * Leaving the pulsing skeleton under the image isn't enough: iOS Safari composites the animation
 * on its own layer and can paint it above the image. Without a `src` only the skeleton shows.
 */
export function SkeletonImage({
  src,
  alt,
  skeletonClassName,
  onLoad,
  ...props
}: Omit<ImageProps, "src"> & { src?: ImageProps["src"]; skeletonClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <Skeleton className={cn("absolute inset-0 rounded-none", skeletonClassName)} />}
      {src && (
        <Image
          {...props}
          src={src}
          alt={alt}
          onLoad={e => {
            setLoaded(true);
            onLoad?.(e);
          }}
        />
      )}
    </>
  );
}
