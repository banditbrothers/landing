"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SkeletonImage } from "@/components/misc/SkeletonImage";

type SizingDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SizingDialog({ open, onClose }: SizingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Sizing Guide for Jersey</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative w-full h-full aspect-video max-h-[80vh]">
          <SkeletonImage
            skeletonClassName="rounded-lg"
            fill
            priority
            src="/sizing-guide/jersey.webp"
            alt="Sizing Guide for Jersey"
            className="rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
