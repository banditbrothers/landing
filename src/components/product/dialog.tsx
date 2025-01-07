import { Product } from "@/data/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ShoppingCartIcon } from "../icons";
import { getWhatsappShopNowLink } from "@/utils/whatsappMessageLinks";
import { Button } from "../ui/button";
import Image from "next/image";
import { standardDescription } from "@/data/products";

type ProductDialogProps = {
  product: Product | null;
  onClose: () => void;
};

export const ProductDialog = ({ product, onClose }: ProductDialogProps) => {
  if (!product) return null;
  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{product ? product.name : "Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-square">
            {product && (
              <Image
                fill
                src={product.image}
                alt={product.name}
                className="object-cover rounded-md"
              />
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">Bandits Bounty:</span>
                <span className="text-base font-semibold">
                  ₹{product?.price}
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-gray-700 text-sm">{product?.description}</p>
              </div>

              <div className="space-y-2">
                {Object.entries(standardDescription).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="font-semibold text-sm min-w-24">
                      {key}:
                    </span>
                    <span className="text-gray-700 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() =>
                window.open(
                  getWhatsappShopNowLink(product.name),
                  "_blank",
                  "noreferrer noopener"
                )
              }
              className="mt-4"
            >
              Shop Now <ShoppingCartIcon />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
