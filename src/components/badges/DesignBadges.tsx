import { Badge } from "../ui/badge";
import { DESIGN_CATEGORIES_OBJ } from "@/data/products";
import { Design } from "@/types/product";

export const CategoryBadge = ({ category }: { category: Design["category"] }) => {
  return (
    <Badge className="w-fit" variant="secondary">
      {DESIGN_CATEGORIES_OBJ[category].name}
    </Badge>
  );
};
