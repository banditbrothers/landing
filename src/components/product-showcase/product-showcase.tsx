import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

import Image from "next/image";
import { Design, designs } from "@/data/products";

import ClassNamesPlugin from "embla-carousel-class-names";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import AutoplayPlugin from "embla-carousel-autoplay";
import { ProductDialog } from "./dialog";
import { ArrowRightCircleIcon } from "../icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingIcon } from "../loadingScreen";

export const ProductLibraryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDesignId = searchParams.get("design");

  const handleProductClick = (design: Design) => {
    router.push(`?design=${design.id}`, { scroll: false });
  };

  return (
    <section id="product-library" className="py-20 scroll-mt-16">
      <div className=" mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Our Products</h2>

        <div className="mx-auto">
          <Carousel
            opts={{ align: "center", loop: true }}
            className="w-full"
            plugins={[
              WheelGesturesPlugin({ wheelDraggingClass: "" }),
              ClassNamesPlugin({
                loop: "",
                draggable: "",
                dragging: "",
                inView: "",
              }),
              AutoplayPlugin({
                active: !selectedDesignId,
                delay: 3000,
                playOnInit: true,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}>
            <CarouselContent>
              {designs.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {selectedDesignId && <ProductDialog designId={selectedDesignId} onClose={() => router.back()} />}
    </section>
  );
};

export const ProductCard = ({ product, onClick }: { product: Design; onClick: () => void }) => {
  return (
    <CarouselItem className="basis-3/5 md:basis-1/2 lg:basis-1/4">
      <div className="w-full h-full scale-[0.9] transition-transform duration-300">
        <div className="p-4 bg-card rounded-xl">
          <button onClick={onClick} className="w-full h-full">
            <div>
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square">
                  <Image fill src={product.image} alt={product.name} className="object-cover rounded-xl" />
                </div>
                <div className="flex flex-row w-full mt-4 mb-2 px-1 justify-between">
                  <h3 className="text-xl font-semibold self-center">{product.name}</h3>
                  <ArrowRightCircleIcon className="w-8 h-8 text-bandit-orange" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </CarouselItem>
  );
};

export const ProductLibrary = () => {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <ProductLibraryContent />
    </Suspense>
  );
};
