"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

type SizingDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SizingDialog({ open, onClose }: SizingDialogProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Sizing Guide for Jersey</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative w-full h-full aspect-video max-h-[80vh]">
          {!loaded && <Skeleton className="absolute inset-0 rounded-lg" />}
          <Image
            fill
            priority
            onLoad={() => setLoaded(true)}
            src="/sizing-guide/jersey.webp"
            alt="Sizing Guide for Jersey"
            className="rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
