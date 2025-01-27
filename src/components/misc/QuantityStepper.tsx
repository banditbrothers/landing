import { Button } from "../ui/button";
import { MinusIcon, PlusIcon } from "./icons";

type QuantityStepperProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const QuantityStepper = ({ quantity, onChange }: QuantityStepperProps) => {
  return (
    <div className="flex items-center border rounded-full">
      <Button
        variant="ghost"
        type="button"
        size="icon"
        className="h-8 w-8 rounded-l-full hover:bg-transparent"
        onClick={() => onChange(-1)}>
        <MinusIcon className="w-4 h-4" />
      </Button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        className="h-8 w-8 rounded-r-full hover:bg-transparent"
        onClick={() => onChange(+1)}>
        <PlusIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};
