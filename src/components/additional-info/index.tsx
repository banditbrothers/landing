import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const AdditionalInformation = () => {
  return (
    <section
      id="faq"
      className="py-20 bg-background/90 text-foreground scroll-mt-16"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Product Specifications
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>
                <AccordionTitle>Description</AccordionTitle>
              </AccordionTrigger>
              <AccordionContent>
                We use premium, breathable fabrics that are specifically chosen
                for motorcycle wear. Our materials are tested for durability and
                comfort in various weather conditions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="wash-and-care">
              <AccordionTrigger>
                <AccordionTitle>Wash and Care</AccordionTitle>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Wash gently in cold water and let it drip dry in a breezy,
                    shaded spot—no sunbathing allowed.
                  </li>
                  <li>
                    No wringing, no harsh chemicals, and definitely no dry
                    cleaning or dryers—keep it au naturel.
                  </li>
                  <li>
                    For tough stains, use a soft brush with mild pH-neutral
                    soap, but go easy to avoid pilling (not covered under
                    warranty).
                  </li>
                  <li>
                    Air dry completely before storing it in a cool, shady
                    spot—it&apos;s more of a cool, indoorsy type.
                  </li>
                  <li>
                    No DIY surgery, unauthorized repairs or
                    alterations—warranty&apos;s off if you play doctor!
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="additional-information">
              <AccordionTrigger>
                <AccordionTitle>Additional Information</AccordionTitle>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div>
                    <strong>Material</strong>
                    <br />
                    Quick Dry Polyester-Spandex - 160 GSM
                  </div>
                  <div>
                    <strong>Weight</strong>
                    <br />
                    50 grams
                  </div>
                  <div>
                    <strong>Country of Origin</strong>
                    <br />
                    India
                  </div>
                  <div>
                    <strong>Sizing</strong>
                    <br />
                    Free sizing
                  </div>
                  <div>
                    <strong>Closure Type</strong>
                    <br />
                    Pull-On
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping-and-return-policy">
              <AccordionTrigger>
                <AccordionTitle>Shipping and Return Policy</AccordionTitle>
              </AccordionTrigger>
              <AccordionContent>
                We offer a 30-day return policy for unused items in original
                packaging. If the product is damaged or there are printing
                errors, contact us through WhatsApp for return assistance. For
                any returns / replacement claim, we will require a video
                showcasing the product being unboxed and defect shown in the
                video. Since its inner-wear we can only provide returns on
                unused and undamaged products.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};
