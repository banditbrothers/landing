import { DesignColor } from "@/types/product";
import { DESIGN_COLOR_OBJ } from "@/data/designs";

/** One colourway chip; two colours render as a diagonal split */
export const Swatch = ({ colors, className = "" }: { colors: DesignColor[]; className?: string }) => {
  const [a = "#555", b] = colors.map(c => DESIGN_COLOR_OBJ[c].hex);
  return (
    <i
      className={`block shrink-0 ${className}`}
      // border-box origin: otherwise the gradient tiles under a (translucent) border and bleeds at the corners
      style={{ background: b ? `linear-gradient(135deg, ${a} 50%, ${b} 50%) border-box` : a }}
    />
  );
};
