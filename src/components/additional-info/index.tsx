import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const AdditionalInformation = () => {
  return (
    <section id="faq" className="py-20 bg-gray-50 scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Frequently Asked Questions
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
                Yes, we ship worldwide! Shipping times and costs vary depending
                on your location. You can view specific shipping details during
                checkout.
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
                packaging. Contact our customer service team through WhatsApp
                for return instructions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};
