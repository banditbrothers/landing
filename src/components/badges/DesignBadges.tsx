import { Design, designColorsObject } from "@/data/designs";

import { Badge, BadgeProps } from "../ui/badge";
import { designPatternsObject } from "@/data/designs";
import { invertColor } from "@/utils/misc";

export const PatternBadge = ({ pattern }: { pattern: Design["pattern"] }) => {
  return <Badge variant="secondary">{designPatternsObject[pattern].name}</Badge>;
};

export const ColorBadge = ({ color, ...rest }: { color: Design["colors"][number] } & BadgeProps) => {
  let styles: React.CSSProperties = {
    backgroundColor: designColorsObject[color].hex,
    color: invertColor(designColorsObject[color].hex),
  };

  if (rest.variant === "outline") {
    styles = {
      border: `1px solid ${designColorsObject[color].hex}`,
    };
  }

  return (
    <Badge {...rest} style={styles}>
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
