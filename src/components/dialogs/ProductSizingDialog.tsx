import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import Image from "next/image";

interface ProductSizingDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductSizingDialog({ product, open, onClose }: ProductSizingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Sizing Guide</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground"></DialogDescription>
        </DialogHeader>

        <Image src="/how-to-wear.webp" alt="Sizing Guide" width={1000} height={1000} />
      </DialogContent>
    </Dialog>
  );
}
