import { ImageCarousel } from "@/components/carousels/ImageCarousel";

export const HowToWearSection = () => {
  return (
    <section id="how-to-wear" className="scroll-mt-16">
      <div className="mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">How to Wear</h2>

        <div className="flex flex-col-reverse md:flex-row items-start justify-around gap-4">
          <div className="relative aspect-square w-full md:w-1/2 2xl:w-1/3">
            <ImageCarousel
              images={["/how-to-wear.webp", "/designs/gimme-some-space.webp", "/designs/mooshi-mooshi.webp"]}
              indicatorConfig={{ position: "vertical" }}
              indicatorType="preview"
              alt="How to Wear"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
