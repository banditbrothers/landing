import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DocumentMagnifyingGlassIcon, HandHeartIcon, TruckIcon } from "../misc/icons";

export const ProductDetailsAccordion = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger>
            <AccordionTitle>
              <div className="flex flex-row items-center gap-2">
                <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                <span>Technical Details</span>
              </div>
            </AccordionTitle>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <div>
                <strong>Material</strong>
                <br />
                <span className="text-muted-foreground">Quick Dry Polyester-Spandex - 140 GSM</span>
              </div>
              <div>
                <strong>Weight</strong>
                <br />
                <span className="text-muted-foreground">50 grams</span>
              </div>
              <div>
                <strong>Country of Origin</strong>
                <br />
                <span className="text-muted-foreground">India</span>
              </div>
              <div>
                <strong>Sizing</strong>
                <br />
                <span className="text-muted-foreground">Free sizing</span>
              </div>
              <div>
                <strong>Closure Type</strong>
                <br />
                <span className="text-muted-foreground">Pull-On</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="wash-and-care">
          <AccordionTrigger>
            <AccordionTitle>
              <div className="flex flex-row items-center gap-2">
                <HandHeartIcon className="w-5 h-5" />
                <span>Wash and Care</span>
              </div>
            </AccordionTitle>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Wash gently in cold water and let it drip dry in a breezy, shaded spot—no sunbathing allowed.</li>
              <li>No wringing, no harsh chemicals, and definitely no dry cleaning or dryers—keep it au naturel.</li>
              <li>
                For tough stains, use a soft brush with mild pH-neutral soap, but go easy to avoid pilling (not covered
                under warranty).
              </li>
              <li>
                Air dry completely before storing it in a cool, shady spot—it&apos;s more of a cool, indoorsy type.
              </li>
              <li>No DIY surgery, unauthorized repairs or alterations—warranty&apos;s off if you play doctor!</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping-and-return-policy">
          <AccordionTrigger>
            <AccordionTitle>
              <div className="flex flex-row items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                <span>Shipping and Return Policy</span>
              </div>
            </AccordionTitle>
          </AccordionTrigger>
          <AccordionContent>
            We will ship your order within 8-10 business days.
            <br />
            <br />
            We offer a 30-day return policy for unused items in original packaging. If the product is damaged or there
            are printing errors, contact us through WhatsApp for return assistance. For any returns / replacement claim,
            we will require a video showcasing the product being unboxed and defect shown in the video. Since its
            inner-wear we can only provide returns on unused and undamaged products.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
