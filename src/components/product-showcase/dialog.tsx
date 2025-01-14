import { Design, designsObject } from "@/data/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ShoppingCartIcon } from "../icons";
import { Button } from "../ui/button";
import Image from "next/image";
import { standardDescription } from "@/data/products";
import Link from "next/link";

type ProductDialogProps = {
  designId: Design["id"] | null;
  onClose: () => void;
};

export const ProductDialog = ({ designId, onClose }: ProductDialogProps) => {
  const design = designId ? designsObject[designId] : null;

  return (
    <Dialog
      open={!!designId}
      onOpenChange={open => {
        if (!open) onClose();
      }}>
      <DialogContent aria-describedby="product-dialog" className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{design?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="relative aspect-square">
            <Image fill src={design?.image ?? ""} alt={design?.name ?? ""} className="object-cover rounded-md" />
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline flex-col">
                <span className="text-sm font-medium text-foreground">Bandit&apos;s Bounty</span>
                <span>
                  <span className="text-base font-semibold text-foreground">₹{design?.price}</span>
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">(excl. shipping)</span>
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-foreground text-sm">{design?.description}</p>
              </div>

              <div className="space-y-2">
                {Object.entries(standardDescription).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="font-semibold text-sm min-w-24 text-foreground">{key}</span>
                    <span className="text-muted-foreground text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link target="_blank" className="w-full" href={`/order?design=${designId}`}>
              <Button className="mt-4 w-full">
                Shop Now <ShoppingCartIcon />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
