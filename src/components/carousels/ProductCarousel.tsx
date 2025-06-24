import ClassNamesPlugin from "embla-carousel-class-names";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import AutoplayPlugin from "embla-carousel-autoplay";

import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { ProductVariantCard, VariantNameAndArrowBanner } from "../cards/VariantCard";
import { ProductVariant } from "@/types/product";

interface ProductCarouselProps {
  variants: ProductVariant[];
}

export const ProductCarousel = ({ variants }: ProductCarouselProps) => {
  return (
    <Carousel
      opts={{ align: "center", loop: true }}
      className="w-full"
      plugins={[
        WheelGesturesPlugin({ wheelDraggingClass: "" }),
        ClassNamesPlugin({ loop: "", draggable: "", dragging: "", inView: "" }),
        AutoplayPlugin({
          active: true,
          delay: 3000,
          playOnInit: true,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}>
      <CarouselContent>
        {variants.map(variant => (
          <CarouselItem key={variant.id} className="basis-3/5 md:basis-1/2 lg:basis-1/4">
            <div className="scale-[0.9] w-full h-full transition-transform duration-300">
              <ProductVariantCard productVariant={variant} showFavoriteButton={false}>
                <VariantNameAndArrowBanner productVariant={variant} />
              </ProductVariantCard>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
