"use client";

import { Design, DESIGNS } from "@/data/designs";
import { standardDescription } from "@/data/designs";
import { ProductDetailsAccordion } from "../../accordions/ProductDetailsAccordion";
import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import { RecommendedProducts } from "./RecommendedProducts";
import { FavoriteButton } from "../../misc/FavoriteButton";
import { CategoryBadge } from "../../badges/DesignBadges";
import { useFavorites } from "@/components/stores/favorites";

import { Button } from "../../ui/button";
import { ShoppingCartIcon } from "../../misc/icons";
import { ShareIcon } from "lucide-react";
import { shareDesign } from "@/utils/share";
import { ImageCarousel } from "../../carousels/ImageCarousel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { trackDesignShopNow, trackDesignView } from "@/utils/analytics";
import { useCart } from "@/components/stores/cart";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { QuantityStepper } from "@/components/misc/QuantityStepper";

export const ProductPageContents = ({ designId: paramDesignId }: { designId: string }) => {
  const { isFavorite, toggleFav } = useFavorites();
  const addOrUpdateCartItem = useCart(state => state.updateCartItem);

  const [quantity, setQuantity] = useState(1);

  const { setParam: openCartParam } = useParamBasedFeatures("cart");
  const router = useRouter();

  function openCart() {
    openCartParam("true");
  }

  const design = DESIGNS.find(d => d.id === paramDesignId);

  useEffect(() => {
    if (!design) {
      toast.error("Oops! Looks like the design you're looking for doesn't exist");
      router.replace("/designs");
    }
  }, [design, router]);

  useEffect(() => {
    if (design) trackDesignView(design.id);
  }, [design]);

  const handleShare = () => {
    if (!design) return;
    shareDesign(design);
  };

  const handleShopNowClicked = () => {
    if (!design) return;
    trackDesignShopNow(design.id);
    addOrUpdateCartItem(design.id, quantity);
    openCart();
  };

  if (!design) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-16 px-4 py-8">
      <div className="mb-4">
        <Breadcrumb design={design} />
      </div>
      {/* Product Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative aspect-square">
          <ImageCarousel images={[design.image, "/how-to-wear.webp"]} alt={design.name} />
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton selected={isFavorite(design.id)} toggle={() => toggleFav(design.id)} />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-6 max-w-xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{design.name}</h1>
            <span className="flex flex-row gap-2 items-center">
              <CategoryBadge category={design.category} />
            </span>
          </div>

          <span className="flex flex-row gap-2 items-end">
            <p className="text-2xl/6  font-semibold text-foreground">₹{design.price.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">(excl. shipping)</p>
          </span>

          <div className="prose max-w-none">
            <p className="text-muted-foreground">{design.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            <QuantityStepper
              quantity={quantity}
              increment={() => setQuantity(q => q + 1)}
              decrement={() => setQuantity(q => q - 1)}
            />
            <div className="flex flex-row gap-2">
              <Button className="w-full" onClick={handleShopNowClicked}>
                <ShoppingCartIcon /> Add to Cart
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <ShareIcon className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Details</h2>
            {Object.entries(standardDescription).map(([key, value]) => (
              <div key={key} className="flex py-2">
                <span className="font-medium text-foreground text-sm w-24">{key}:</span>
                <span className="text-muted-foreground text-sm">{value}</span>
              </div>
            ))}
          </div>

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Specifications</h2>
            <ProductDetailsAccordion />
          </div>
        </div>
      </div>

      <RecommendedProducts currentDesignId={design.id} />
    </div>
  );
};

function Breadcrumb({ design }: { design: Design }) {
  return (
    <BreadcrumbUI>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/designs">Designs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{design.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbUI>
  );
}
