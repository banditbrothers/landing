import { Design } from "@/data/designs";
import Image from "next/image";
import { standardDescription } from "@/data/designs";
import { ProductAccordion } from "../product-specs/product-accordion";
import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { RecommendedProducts } from "./recommended-products";

export const ProductPageContents = ({ design }: { design: Design }) => {
  return (
    <div className="container mx-auto mt-16 px-4 py-8">
      <div className="mb-4">
        <Breadcrumb design={design} />
      </div>
      {/* Product Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative aspect-square">
          <Image src={design.image} alt={design.name} fill className="object-cover rounded-lg" priority />
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-6 max-w-xl mx-auto">
          {/* Product Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{design.name}</h1>
            <span className="flex flex-row gap-2 items-end">
              <p className="text-2xl font-semibold text-foreground">₹{design.price.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs">(excl. shipping)</p>
            </span>
          </div>

          {/* Product Description */}
          <div className="prose max-w-none">
            <p className="text-muted-foreground">{design.description}</p>
          </div>

          <button className="bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Buy Now
          </button>

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Details</h2>
            {Object.entries(standardDescription).map(([key, value]) => (
              <div key={key} className="flex py-2">
                <span className="font-medium text-foreground text-sm w-24">{key}:</span>
                <span className="text-muted-foreground text-sm">{value}</span>
              </div>
            ))}
          </div>

          {/* Standard Product Details */}
          <div className=" pt-4 border-t border-muted">
            <h2 className="text-lg font-semibold text-foreground mb-3">Product Specifications</h2>
            <ProductAccordion />
          </div>
        </div>
      </div>

      <RecommendedProducts currentDesignId={design.id} />
    </div>
  );
};

function Breadcrumb({ design }: { design: Design }) {
  return (
    <BreadcrumbUI>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/designs">Designs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{design.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbUI>
  );
}
