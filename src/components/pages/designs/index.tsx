"use client";

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
import { ArrowRightIcon, ShoppingCartIcon } from "../../../Icons/icons";
import { ShareIcon } from "lucide-react";
import { shareVariant } from "@/utils/share";
import { ImageCarousel } from "../../carousels/ImageCarousel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { trackVariantAddToCart, trackVariantView } from "@/utils/analytics";
import { useCart } from "@/components/stores/cart";
import { QuantityStepper } from "@/components/misc/QuantityStepper";
import { formatCurrency } from "@/utils/price";
import Link from "next/link";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, getProductVariantPrice } from "@/utils/product";
import { DESIGNS_OBJ, getColorVariantIds, PRODUCTS_OBJ } from "@/data/products";
import { useVariants } from "@/hooks/useVariants";
import { ColorVariants } from "./SimilarVariants";

type ProductPageContentsProps = {
  designId: string;
  productId: string;
};

export const ProductPageContents = ({ designId, productId }: ProductPageContentsProps) => {
  const { data: variants } = useVariants();

  const router = useRouter();
  const { isFavorite, toggleFav } = useFavorites();
  const { openCart, updateCartItem: addOrUpdateCartItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [colorVariants, setColorVariants] = useState<ProductVariant[]>([]);

  const variant = variants.find(v => v.designId === designId && v.productId === productId);

  useEffect(() => {
    if (!variant) {
      toast.error("Oops! Looks like the variant you're looking for doesn't exist");
      router.replace(`/products`);
    }
  }, [variant, router]);

  useEffect(() => {
    if (variant && variants) {
      const colorVariantIds = getColorVariantIds(variant.designId);
      const _colorVariants = variants.filter(v => colorVariantIds.includes(v.designId) && v.productId === productId);
      setColorVariants(_colorVariants ?? []);
    }
  }, [variant, variants, productId]);

  useEffect(() => {
    if (variant) trackVariantView({ productId: variant.productId, designId: variant.designId });
  }, [variant]);

  const handleShare = () => {
    if (!variant) return;
    shareVariant(variant);
  };

  const handleAddToCartClicked = () => {
    if (!variant) return;
    trackVariantAddToCart({ productId: variant.productId, designId: variant.designId });
    addOrUpdateCartItem(variant.id, quantity);
    openCart();
  };

  if (!variant) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  const variantName = getProductVariantName(variant);
  const variantPrice = getProductVariantPrice(variant);

  const variantDesign = DESIGNS_OBJ[variant.designId];
  const variantProduct = PRODUCTS_OBJ[variant.productId];

  const carouselImages = [...variant.images.mockup];
  if (variant.productId === "bandana") carouselImages.push("/how-to-wear.webp");

  return (
    <div className="container mx-auto mt-20 px-4 py-8">
      <div className="mb-4">
        <Breadcrumb variant={variant} />
      </div>
      {/* Product Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative aspect-square">
          <ImageCarousel images={carouselImages} alt={variantName} indicatorType="dot" />
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton selected={isFavorite(variant.id)} toggle={() => toggleFav(variant.id)} />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-6 max-w-xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{variantName}</h1>
            <span className="flex flex-row gap-2 items-center">
              <CategoryBadge category={variantDesign.category} />
            </span>
          </div>

          <span className="flex flex-row gap-2 items-end">
            <p className="text-2xl/6  font-semibold text-foreground">{formatCurrency(variantPrice)}</p>
            <p className="text-muted-foreground text-xs">(excl. shipping)</p>
          </span>

          <div className="prose max-w-none">
            <p className="text-muted-foreground flex flex-col gap-2">
              {variant.description ?? variantProduct.description.map(d => <span key={d}>{d}</span>)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <QuantityStepper
              quantity={quantity}
              increment={() => setQuantity(q => q + 1)}
              decrement={() => setQuantity(q => q - 1)}
            />
            <div className="flex flex-row gap-2">
              <Button className="w-full" onClick={handleAddToCartClicked}>
                <ShoppingCartIcon /> Add to Cart
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <ShareIcon className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          <ColorVariants colorVariants={colorVariants} currentVariantId={variant.id} />

          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Details</h2>
            <div className="flex py-2">
              <span className="font-medium text-foreground text-sm w-24">Material:</span>
              <span className="text-muted-foreground text-sm">{variantProduct.material}</span>
            </div>
            <div className="flex py-2">
              <span className="font-medium text-foreground text-sm w-24">Dimensions:</span>
              <span className="text-muted-foreground text-sm">{variantProduct.dimensions}</span>
            </div>
          </div>

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Specifications</h2>
            <ProductDetailsAccordion />
          </div>

          {/* Reviews Link */}
          <div className="space-y-4 pt-6 border-t border-muted">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Reviews</h2>
                <p className="text-sm text-muted-foreground">Hear from our fellow Bandits about their experience</p>
              </div>
              <Link href="/reviews" target="_blank">
                <Button variant="outline" className="text-sm">
                  View All Reviews
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <RecommendedProducts currentVariant={variant} />
    </div>
  );
};

function Breadcrumb({ variant }: { variant: ProductVariant }) {
  const product = PRODUCTS_OBJ[variant.productId];

  return (
    <BreadcrumbUI>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/products/${variant.productId}`}>{product.name}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{getProductVariantName(variant)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbUI>
  );
}
