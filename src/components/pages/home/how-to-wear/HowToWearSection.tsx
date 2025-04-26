import { ImageCarousel } from "@/components/carousels/ImageCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const images = [
  "/how-to-wear/mugshot-2.webp",
  "/how-to-wear/mugshot-1.webp",
  "/how-to-wear/mugshot-3.webp",
  "/how-to-wear/mugshot-4.webp",
  "/how-to-wear/mugshot-5.webp",
  "/how-to-wear.webp",
];

export const HowToWearSection = () => {
  return (
    <section id="how-to-wear" className="scroll-mt-16 py-20 bg-background">
      <div className="mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground">How to Wear A Bandana</h2>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-16">
          <div className="relative aspect-square w-full md:w-1/2 2xl:w-3/5 rounded-lg">
            <ImageCarousel
              alt="How to Wear"
              images={images}
              indicatorType="preview"
              indicatorConfig={{ position: "horizontal" }}
            />
          </div>

          <div className="w-full md:w-1/2 2xl:w-2/5 space-y-8">
            <h3 className="text-3xl font-semibold text-foreground">One Bandana, Endless Possibilities</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our premium bandanas are designed for maximum versatility and style. Wear them as bandanas, face
              coverings, neck warmers, headbands, or even as wristbands.
            </p>
            <div>
              <Link href="/designs">
                <Button variant="bandit-hover" className="group w-full md:w-fit">
                  Get Yours Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
