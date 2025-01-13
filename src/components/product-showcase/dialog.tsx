import { Design } from "@/data/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ShoppingCartIcon } from "../icons";
import { Button } from "../ui/button";
import Image from "next/image";
import { standardDescription } from "@/data/products";
import Link from "next/link";

type ProductDialogProps = {
  product: Design | null;
  onClose: () => void;
};

export const ProductDialog = ({ product, onClose }: ProductDialogProps) => {
  if (!product) return null;
  return (
    <Dialog
      open={!!product}
      onOpenChange={open => {
        if (!open) onClose();
      }}>
      <DialogContent aria-describedby="product-dialog" className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{product ? product.name : "Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-square">
            {product && <Image fill src={product.image} alt={product.name} className="object-cover rounded-md" />}
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline flex-col">
                <span className="text-sm font-medium text-foreground">Bandit&apos;s Bounty</span>
                <span>
                  <span className="text-base font-semibold text-foreground">₹{product?.price}</span>
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">(excl. shipping)</span>
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-foreground text-sm">{product?.description}</p>
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
            <Link target="_blank" className="w-full" href={`/order?design=${product.id}`}>
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
