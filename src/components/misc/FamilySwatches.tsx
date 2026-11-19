import { ProductVariant } from "@/types/product";
import { DESIGNS_OBJ } from "@/data/designs";
import { getProductVariantName } from "@/utils/product";
import { Swatch } from "@/components/misc/Swatch";

/** Colour picker for a folded card; nothing for a single variant */
export const FamilySwatches = ({
  family,
  activeId,
  onPick,
}: {
  family: ProductVariant[];
  activeId: string;
  onPick: (id: string) => void;
}) => {
  if (family.length <= 1) return null;

  // Swatches only work as a picker when each member looks different (zodiac signs share one palette)
  const distinct = new Set(family.map(v => DESIGNS_OBJ[v.designId].swatch.join())).size === family.length;
  if (!distinct) return <span>{family.length} options</span>;

  return (
    <span className="flex flex-wrap gap-1">
      {family.map(v => (
        <button
          key={v.id}
          type="button"
          title={getProductVariantName(v)}
          aria-label={`Show ${getProductVariantName(v)}`}
          aria-pressed={v.id === activeId}
          onClick={e => {
            e.preventDefault(); // cards wrap this in a Link
            onPick(v.id);
          }}
          className={`rounded-full p-[2px] ring-1 transition ${
            v.id === activeId ? "ring-bandit-orange" : "ring-transparent hover:ring-white/40"
          }`}>
          <Swatch colors={DESIGNS_OBJ[v.designId].swatch} className="w-3.5 h-3.5 rounded-full border border-white/25" />
        </button>
      ))}
    </span>
  );
};
