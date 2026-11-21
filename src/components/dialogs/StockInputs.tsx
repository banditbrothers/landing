import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSizeLabel } from "@/utils/product";

// Raw input strings per size; "" = stock not tracked for that size
export type StockInputValues = Record<string, string>;

export const toStockInputs = (stock: Record<string, number> | undefined): StockInputValues =>
  Object.fromEntries(Object.entries(stock ?? {}).map(([size, qty]) => [size, String(qty)]));

/** Only sizes of this product with a value are kept; empty means untracked. */
export const parseStockInputs = (inputs: StockInputValues, sizes: string[]): Record<string, number> => {
  const stock: Record<string, number> = {};
  for (const size of sizes) {
    const raw = inputs[size]?.trim();
    if (!raw) continue;
    const qty = parseInt(raw, 10);
    if (!Number.isNaN(qty)) stock[size] = Math.max(0, qty);
  }
  return stock;
};

type StockInputsProps = {
  sizes: string[];
  value: StockInputValues;
  onChange: (value: StockInputValues) => void;
};

export const StockInputs = ({ sizes, value, onChange }: StockInputsProps) => {
  if (sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>Stock</Label>
      <p className="text-xs text-muted-foreground">
        Units in stock per size. Leave empty to not track stock for that size (always shown as available).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sizes.map(size => (
          <div key={size} className="space-y-1">
            <Label htmlFor={`stock-${size}`} className="text-xs text-muted-foreground">
              {getSizeLabel(size)}
            </Label>
            <Input
              id={`stock-${size}`}
              type="number"
              min={0}
              step={1}
              placeholder="Not tracked"
              value={value[size] ?? ""}
              onChange={e => onChange({ ...value, [size]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
