"use client";

import { Design } from "@/data/designs";
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
import { PatternBadge } from "../../badges/DesignBadges";
import { useFavorites } from "@/contexts/FavoritesContext";
import Link from "next/link";
import { Button } from "../../ui/button";
import { ShoppingCartIcon } from "../../misc/Icons";
import posthog from "posthog-js";
import { ShareIcon } from "lucide-react";
import { shareDesign } from "@/utils/share";
import { ImageCarousel } from "../../carousels/ImageCarousel";

export const ProductPageContents = ({ design }: { design: Design }) => {
  const { isFavorite, toggleFav } = useFavorites();

  const handleShare = () => {
    posthog.capture("design_share", { designId: design.id });
    shareDesign(design);
  };

  return (
    <div className="container mx-auto mt-16 px-4 py-8">
      <div className="mb-4">
        <Breadcrumb design={design} />
      </div>
      {/* Product Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative aspect-square">
          <ImageCarousel images={[design.image]} alt={design.name} />
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton selected={isFavorite(design.id)} toggle={() => toggleFav(design.id)} />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-6 max-w-xl mx-auto">
          {/* Product Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{design.name}</h1>
            <span className="flex flex-row gap-2 items-center">
              <PatternBadge pattern={design.pattern} />
            </span>
          </div>

          <span className="flex flex-row gap-2 items-end">
            <p className="text-2xl font-semibold text-foreground">₹{design.price.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">(excl. shipping)</p>
          </span>

          {/* Product Description */}
          <div className="prose max-w-none">
            <p className="text-muted-foreground">{design.description}</p>
          </div>

          <div className="flex flex-row gap-2">
            <Link
              target="_blank"
              className="w-full"
              href={`/order?design=${design.id}`}
              onClick={() => posthog.capture("design_shopnow", { designId: design.id })}>
              <Button className="w-full">
                <ShoppingCartIcon /> Shop Now
              </Button>
            </Link>
            <Button variant="outline" onClick={handleShare}>
              <ShareIcon className="w-4 h-4" />
              Share
            </Button>
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
