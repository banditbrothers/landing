import { Design, DESIGN_COLOR_OBJ } from "@/data/designs";

import { Badge, BadgeProps } from "../ui/badge";
import { DESIGN_PATTERN_OBJ } from "@/data/designs";
import { invertColor } from "@/utils/misc";

export const PatternBadge = ({ pattern }: { pattern: Design["pattern"] }) => {
  return <Badge variant="secondary">{DESIGN_PATTERN_OBJ[pattern].name}</Badge>;
};

export const ColorBadge = ({ color, ...rest }: { color: Design["colors"][number] } & BadgeProps) => {
  let styles: React.CSSProperties = {
    backgroundColor: DESIGN_COLOR_OBJ[color].hex,
    color: invertColor(DESIGN_COLOR_OBJ[color].hex),
  };

  if (rest.variant === "outline") {
    styles = {
      border: `1px solid ${DESIGN_COLOR_OBJ[color].hex}`,
    };
  }

  return (
    <Badge {...rest} style={styles}>
      {DESIGN_COLOR_OBJ[color].name}
    </Badge>
  );
};

export const BadgeSpacer = () => {
  return <div className="border-l border-foreground h-5" />;
};

export const BadgeContainer = ({ children }: { children: React.ReactNode }) => {
  return <span className="flex flex-row gap-2 items-center">{children}</span>;
};
