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
import { useFavorites } from "@/components/stores/favorites";

import { Button } from "../../ui/button";
import { ArrowRightIcon, ShoppingCartIcon } from "../../../Icons/icons";
import { ShareIcon, Truck } from "lucide-react";
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
import {
  DESIGNS_OBJ,
  getColorVariantIds,
  MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING,
  PRODUCTS_OBJ,
  VariantProductSizes,
} from "@/data/products";
import { useVariants } from "@/hooks/useVariants";
import { ColorVariants } from "./SimilarVariants";
import { ProductSizingDialog } from "@/components/dialogs/ProductSizingDialog";
import { PaymentBadges } from "@/components/payments/PaymentBadges";
import { Card, CardContent } from "@/components/ui/card";

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
  const [size, setSize] = useState<VariantProductSizes>("one-size");
  const [isProductSizingDialogOpen, setIsProductSizingDialogOpen] = useState(false);
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

  // Initialize size based on available product sizes
  useEffect(() => {
    if (variant) {
      const variantProduct = PRODUCTS_OBJ[variant.productId];
      if (variantProduct?.sizes?.length > 0) {
        setSize(variantProduct.sizes[0] as VariantProductSizes);
      }
    }
  }, [variant]);

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
    addOrUpdateCartItem(variant.id, quantity, size);
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
        <div className="flex flex-col gap-6 max-w-[42rem] w-full mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{variantName}</h1>
          </div>

          <span className="flex flex-col gap-2 items-start">
            <p className="text-2xl/6 font-semibold text-foreground">{formatCurrency(variantPrice)}</p>
            <span className="flex flex-col gap-1 items-start">
              <p className="text-muted-foreground text-xs">Inclusive of all taxes.</p>
              {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING !== null && (
                <Card className="w-full border-primary/20 bg-primary/5">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Free Shipping above {formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </span>
          </span>

          {/* Size Selection */}
          {variantProduct.sizes.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-start gap-2">
                <h3 className="font-medium text-foreground">Size</h3>
                <div>
                  <Button variant="link" className="p-2" onClick={() => setIsProductSizingDialogOpen(true)}>
                    Size Guide
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {variantProduct.sizes.map(sizeOption => (
                  <label
                    key={sizeOption}
                    className={`
                      flex items-center justify-center px-4 py-2 border-2 rounded-lg cursor-pointer transition-all duration-200
                      ${
                        size === sizeOption
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/20 bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }
                    `}>
                    <input
                      type="radio"
                      name="size"
                      value={sizeOption}
                      checked={size === sizeOption}
                      onChange={e => setSize(e.target.value as VariantProductSizes)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{variantProduct.sizeLabels[sizeOption]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center items-center">
            <span className="text-sm text-muted-foreground">100% Secure Payments</span>
            <PaymentBadges />
          </div>

          <ColorVariants colorVariants={colorVariants} currentVariantId={variant.id} />

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <ProductDetailsAccordion variant={variant} selectedSize={size} />
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
      <ProductSizingDialog
        open={isProductSizingDialogOpen}
        onClose={() => setIsProductSizingDialogOpen(false)}
        product={{ id: variant.id, ...variantProduct }}
      />
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
