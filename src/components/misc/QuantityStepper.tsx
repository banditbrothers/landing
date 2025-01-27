import { Button } from "../ui/button";
import { MinusIcon, PlusIcon } from "./icons";

type QuantityStepperProps = {
  quantity: number;
  increment: () => void;
  decrement: () => void;
};

export const QuantityStepper = ({ quantity, increment, decrement }: QuantityStepperProps) => {
  return (
    <div className="flex items-center border rounded-full w-fit">
      <Button
        variant="ghost"
        type="button"
        size="icon"
        className="h-8 w-8 rounded-l-full hover:bg-transparent"
        disabled={quantity <= 1}
        onClick={() => quantity > 1 && decrement()}>
        <MinusIcon className="w-4 h-4" />
      </Button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        className="h-8 w-8 rounded-r-full hover:bg-transparent"
        onClick={() => increment()}>
        <PlusIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};
