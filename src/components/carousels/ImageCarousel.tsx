"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  indicatorType: "dot" | "preview" | null;
  indicatorConfig?: {
    position: "vertical" | "horizontal";
  };
}

export function ImageCarousel({
  images,
  alt,
  indicatorType = null,
  indicatorConfig = { position: "horizontal" },
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });

    return () => api.destroy();
  }, [api]);

  const handleIndicatorClick = (index: number) => {
    if (!api) return;
    api.scrollTo(index);
  };

  return (
    <span className={`relative flex ${indicatorConfig.position === "vertical" ? "flex-row" : "flex-col"}`}>
      <Carousel setApi={setApi} className="w-full mx-auto relative">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="aspect-square relative">
                <Image
                  fill
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  className="object-cover rounded-lg"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>

      {images.length > 1 && indicatorType === "dot" && (
        <div className="w-full h-fit py-4 flex flex-row justify-center">
          <div className="flex flex-row gap-2 items-center">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex ? "bg-bandit-orange w-8" : "bg-muted w-2"
                }`}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        </div>
      )}

      {images.length > 1 && indicatorType === "preview" && (
        <div
          className={`h-fit flex flex-row justify-start ${indicatorConfig.position === "vertical" ? "px-4" : "py-4"}`}>
          <div
            className={`flex gap-2 items-center ${indicatorConfig.position === "vertical" ? "flex-col" : "flex-row"}`}>
            {images.map((image, index) => {
              const isSelected = index === currentIndex;
              return (
                <button
                  key={index}
                  className={`relative aspect-square w-16 border ${
                    isSelected ? "border-bandit-orange" : "border-white"
                  }`}
                  onClick={() => handleIndicatorClick(index)}>
                  <Image fill src={image} alt={`${alt} - Image ${index + 1}`} className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}
