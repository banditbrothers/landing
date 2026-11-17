"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

// Fires ~600px before the reader reaches the bottom
export const LoadMoreTrigger = ({ onReach }: { onReach: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "0px 0px 600px 0px" });
  useEffect(() => {
    if (near) onReach();
  }, [near, onReach]);
  return <div ref={ref} aria-hidden />;
};
