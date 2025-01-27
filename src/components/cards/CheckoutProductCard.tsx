import { Design } from "@/data/designs";
import { XMarkIcon } from "../misc/icons";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "../misc/QuantityStepper";

interface CheckoutProductCardProps {
  design: Design;
  quantity: number;
  updateCartItemBy: (designId: string, quantity: number) => void;
  removeCartItem: (designId: string) => void;
}

export const CheckoutProductCard = ({
  design,
  quantity,
  updateCartItemBy,
  removeCartItem,
}: CheckoutProductCardProps) => {
  return (
    <div key={design.id} className="flex gap-4 p-4 bg-card rounded-lg relative border border-border">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => removeCartItem(design.id)}>
        <XMarkIcon className="w-4 h-4" />
      </Button>
      <div className="w-24 h-24 relative">
        <Link href={`/designs/${design.id}`}>
          <Image src={design.image} alt={design.name} fill className="object-cover rounded-md w-full h-full" />
        </Link>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{design.name}</h3>
        <p className="text-muted-foreground text-sm">₹{design.price}</p>
        <div className="flex items-center gap-2 mt-2 justify-end">
          <QuantityStepper
            quantity={quantity}
            increment={() => updateCartItemBy(design.id, 1)}
            decrement={() => updateCartItemBy(design.id, -1)}
          />
        </div>
      </div>
    </div>
  );
};
