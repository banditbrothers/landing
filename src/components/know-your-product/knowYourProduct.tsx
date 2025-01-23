import { knowYourProduct } from "@/data/know-your-product";
import Image from "next/image";
import { useState } from "react";

export default function KnowYourProduct() {
  const [expandedItem, setExpandedItem] = useState<string[]>([]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Know Your Product</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {knowYourProduct.map(item => {
            const isExpanded = expandedItem.includes(item.id);

            const toggleExpanded = () => {
              if (isExpanded) setExpandedItem(prev => prev.filter(id => id !== item.id));
              else setExpandedItem(prev => [...prev, item.id]);
            };

            return (
              <div key={item.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">{item.title}</h3>

                  <p className="text-muted-foreground">
                    {item.description + " "}
                    {isExpanded && item.extendedDescription + " "}

                    {item.extendedDescription && (
                      <button className="text-primary hover:underline" onClick={toggleExpanded}>
                        {isExpanded ? "read less" : "read more"}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
