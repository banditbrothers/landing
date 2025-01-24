import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";

type HowToWearDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function HowToWearDialog({ open, onClose }: HowToWearDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>How To Wear</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative aspect-square max-h-[80vh] h-fit w-full">
          <Image fill src="/how-to-wear.webp" alt="How To Wear Instructions" className="rounded-lg object-cover" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
