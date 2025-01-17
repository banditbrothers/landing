import ClassNamesPlugin from "embla-carousel-class-names";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import AutoplayPlugin from "embla-carousel-autoplay";

import { ArrowRightCircleIcon } from "../misc/icons";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Design } from "@/data/designs";
import { DesignCard } from "./card";

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
                <div className="flex flex-row w-full mt-4 px-1 justify-between">
                  <h3 className="text-xl font-semibold self-center">{design.name}</h3>
                  <ArrowRightCircleIcon className="w-8 h-8 text-bandit-orange" />
                </div>
              </DesignCard>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
