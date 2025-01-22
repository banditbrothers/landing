import ClassNamesPlugin from "embla-carousel-class-names";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import AutoplayPlugin from "embla-carousel-autoplay";

import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Design } from "@/data/designs";
import { DesignCard, DesignNameAndArrowBanner } from "./card";

interface DesignCarouselProps {
  designs: Design[];
  selectedDesignId: string | null;
  handleDesignClick: (design: Design) => void;
}

export const DesignCarousel = ({ designs, selectedDesignId, handleDesignClick }: DesignCarouselProps) => {
  return (
    <Carousel
      opts={{ align: "center", loop: true }}
      className="w-full"
      plugins={[
        WheelGesturesPlugin({ wheelDraggingClass: "" }),
        ClassNamesPlugin({ loop: "", draggable: "", dragging: "", inView: "" }),
        AutoplayPlugin({
          active: !selectedDesignId,
          delay: 3000,
          playOnInit: true,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}>
      <CarouselContent>
        {designs.map(design => (
          <CarouselItem key={design.id} className="basis-3/5 md:basis-1/2 lg:basis-1/4">
            <div className="scale-[0.9] w-full h-full transition-transform duration-300">
              <DesignCard
                design={design}
                onClick={() => handleDesignClick(design)}
                selected={selectedDesignId === design.id}>
                <DesignNameAndArrowBanner design={design} />
              </DesignCard>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
