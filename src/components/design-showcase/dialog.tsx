import { Design, designsObject } from "@/data/designs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ShoppingCartIcon } from "../misc/icons";
import { Button } from "../ui/button";
import Image from "next/image";
import { standardDescription } from "@/data/designs";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect } from "react";
import { ShareIcon } from "lucide-react";

type ProductDialogProps = {
  designId: Design["id"] | null;
  onClose: () => void;
};

export const ProductDialog = ({ designId, onClose }: ProductDialogProps) => {
  const design = designId ? designsObject[designId] : null;

  useEffect(() => {
    if (designId) posthog.capture("design_viewed", { designId });
  }, [designId]);

  const handleShare = async () => {
    if (design) {
      posthog.capture("design_share", { designId });

      await navigator.share({
        title: `${design.name} bandana by Bandit Brothers`,
        text: `${design.name} bandana by Bandit Brothers\n`,
        url: `${window.location.origin}/?design=${designId}`,
      });
    }
  };

  if (!design) return null;
  return (
    <Dialog
      open={!!designId}
      onOpenChange={open => {
        if (!open) onClose();
      }}>
      <DialogContent aria-describedby="product-dialog" className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{design.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
          <div className="relative aspect-square">
            <Image fill src={design.image} alt={design.name} className="object-cover rounded-md" />
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline flex-col">
                <span className="text-sm font-medium text-foreground">Bandit&apos;s Bounty</span>
                <span>
                  <span className="text-base font-semibold text-foreground">₹{design.price}</span>
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">(excl. shipping)</span>
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-foreground text-sm">{design.description}</p>
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
            <div className="flex flex-row gap-2 mt-4 w-full">
              <Link
                target="_blank"
                className="w-full flex-1"
                href={`/order?design=${designId}`}
                onClick={() => posthog.capture("design_shopnow", { designId })}>
                <Button className="w-full">
                  Shop Now <ShoppingCartIcon />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleShare}>
                <ShareIcon />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
