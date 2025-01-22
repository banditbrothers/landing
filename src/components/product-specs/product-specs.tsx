import { ProductAccordion } from "./product-accordion";

export const ProductSpecifications = () => {
  return (
    <section id="faq" className="py-20 bg-background/90 text-foreground scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Product Specifications</h2>

        <ProductAccordion />
      </div>
    </section>
  );
};
