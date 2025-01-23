import { ProductDetailsAccordion } from "../../../accordions/ProductDetailsAccordion";

export const ProductSpecificationsSection = () => {
  return (
    <section id="faq" className="py-20 bg-background/90 text-foreground scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Product Specifications</h2>

        <ProductDetailsAccordion />
      </div>
    </section>
  );
};
