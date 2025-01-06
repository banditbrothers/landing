import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Button } from "../ui/button";
import Image from "next/image";
import { products } from "@/data/products";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ShoppingCartIcon } from "../icons";
import { getWhatsappShopNowLink } from "@/data/socials";

export const ProductLibrary = () => {
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[0] | null
  >(null);

  return (
    <section id="product-library" className="py-20 scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Our Products</h2>

        <div className="mx-auto">
          <Carousel
            opts={{ align: "center", loop: true }}
            className="w-full"
            plugins={[WheelGesturesPlugin()]}
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div>
                    <div className="flex flex-col items-center p-6">
                      <div className="relative w-full aspect-square">
                        <Image
                          fill
                          src={product.image}
                          alt={product.name}
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex flex-row justify-between w-full">
                        <h3 className="text-xl font-semibold mt-4 mb-2">
                          {product.name}
                        </h3>
                        <Button
                          variant="default"
                          onClick={() =>
                            window.open(
                              getWhatsappShopNowLink(product.name),
                              "_blank",
                              "noreferrer noopener"
                            )
                          }
                          className="mt-2"
                        >
                          <ShoppingCartIcon />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? selectedProduct.name : "Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative aspect-square">
              {selectedProduct && (
                <Image
                  fill
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="object-cover rounded-md"
                />
              )}
            </div>
            <div className="flex flex-col justify-between">
              <p className="text-gray-600">{selectedProduct?.description}</p>
              <Button
                variant="default"
                onClick={() =>
                  window.open(
                    getWhatsappShopNowLink(selectedProduct?.name),
                    "_blank",
                    "noreferrer noopener"
                  )
                }
                className="mt-4"
              >
                Shop Now <ShoppingCartIcon />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
