import { Design } from "@/data/designs";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "../badges/DesignBadges";

interface SearchProductCardProps {
  design: Design;
}

export const SearchProductCard = ({ design }: SearchProductCardProps) => {
  return (
    <div key={design.id} className=" p-4 bg-card rounded-lg relative border border-border">
      <Link href={`/designs/${design.id}`}>
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square">
            <Image
              fill
              src={design.image}
              alt={design.name + " design image"}
              className="object-cover rounded-md w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="font-semibold text-sm sm:text-base pr-3">{design.name}</h3>
            <span className="flex flex-row gap-2 items-center justify-between">
              <CategoryBadge category={design.category} />
              <p className="text-muted-foreground text-sm">₹{design.price}</p>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
