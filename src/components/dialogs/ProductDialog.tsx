import { Design, DESIGNS_OBJ } from "@/data/designs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import { standardDescription } from "@/data/designs";
import Link from "next/link";
import posthog from "posthog-js";
import { ShareIcon } from "lucide-react";
import { FavoriteButton } from "../misc/FavoriteButton";
import { useFavorites } from "@/contexts/FavoritesContext";
import { BadgeContainer, CategoryBadge } from "../badges/DesignBadges";
import VisuallyHidden from "../ui/visually-hidden";
import { shareDesign } from "@/utils/share";
import { useEffect } from "react";
import { ArrowTopRightOnSquareIcon, ShoppingCartIcon } from "../misc/icons";
import useIsMobile from "@/hooks/useIsMobile";

type ProductDialogProps = {
  designId: Design["id"] | null;
  onClose: () => void;
};

export const ProductDialog = ({ designId, onClose }: ProductDialogProps) => {
  const design = designId ? DESIGNS_OBJ[designId] : null;

  const isMobile = useIsMobile();
  const { isFavorite, toggleFav } = useFavorites();

  useEffect(() => {
    if (designId) posthog.capture("design_viewed", { designId });
  }, [designId]);

  const handleShopNow = async () => {
    posthog.capture("design_shopnow", { designId });
  };

  const handleShare = async () => {
    if (design) {
      posthog.capture("design_share", { designId });
      shareDesign({ ...design, id: designId! });
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
        <DialogHeader className="relative">
          <VisuallyHidden>
            <DialogTitle>{design.name}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="relative aspect-square">
            <Image fill priority src={design.image} alt={design.name} className="object-cover rounded-md" />
            <div className="absolute top-1 right-1">
              <FavoriteButton selected={isFavorite(designId!)} toggle={() => toggleFav(designId!)} />
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-start gap-2 items-start">
                  <span className="text-2xl font-semibold text-foreground">{design.name}</span>
                  <Link
                    href={`/designs/${designId}`}
                    className="flex flex-row justify-between gap-1 items-center"
                    target="_blank">
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </Link>
                </div>
                <BadgeContainer>
                  <CategoryBadge category={design.category} />
                </BadgeContainer>
              </div>
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
            {!isMobile && <ProductDialogFooter designId={designId!} onShopNow={handleShopNow} onShare={handleShare} />}
          </div>
        </div>
        {isMobile && <ProductDialogFooter designId={designId!} onShopNow={handleShopNow} onShare={handleShare} />}
      </DialogContent>
    </Dialog>
  );
};

type ProductDialogFooterProps = {
  designId: Design["id"];
  onShopNow: () => void;
  onShare: () => void;
};

const ProductDialogFooter = ({ designId, onShopNow, onShare }: ProductDialogFooterProps) => {
  return (
    <DialogFooter>
      <div className="flex flex-row gap-2 w-full">
        <Link target="_blank" className="w-full flex-1" href={`/order?design=${designId}`} onClick={onShopNow}>
          <Button className="w-full">
            <ShoppingCartIcon /> Shop Now
          </Button>
        </Link>
        <Button variant="outline" onClick={onShare}>
          <ShareIcon className="w-4 h-4" />
          Share
        </Button>
      </div>
    </DialogFooter>
  );
};
