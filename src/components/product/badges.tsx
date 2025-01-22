import { Design, designColorsObject } from "@/data/designs";

import { Badge } from "../ui/badge";
import { designPatternsObject } from "@/data/designs";
import { invertColor } from "@/utils/misc";

export const PatternBadge = ({ pattern }: { pattern: Design["pattern"] }) => {
  return <Badge variant="secondary">{designPatternsObject[pattern].name}</Badge>;
};

export const ColorBadge = ({ color }: { color: Design["colors"][number] }) => {
  return (
    <Badge
      style={{
        backgroundColor: designColorsObject[color].hex,
        color: invertColor(designColorsObject[color].hex),
      }}>
      {designColorsObject[color].name}
    </Badge>
  );
};

export const BadgeSpacer = () => {
  return <div className="border-l border-foreground h-5" />;
};

export const BadgeContainer = ({ children }: { children: React.ReactNode }) => {
  return <span className="flex flex-row gap-2 items-center">{children}</span>;
};
