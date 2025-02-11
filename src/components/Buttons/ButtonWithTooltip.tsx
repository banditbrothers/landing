import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button, ButtonProps } from "@/components/ui/button";
import { useState } from "react";

export const ButtonWithTooltip = ({
  children,
  tooltipContent,
  tooltipDisabled,
  ...props
}: ButtonProps & { tooltipContent: string; tooltipDisabled?: boolean }) => {
  const [open, setOpen] = useState(false);

  if (tooltipDisabled) return <Button {...props}>{children}</Button>;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <a
            onClick={() => setOpen(!open)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onTouchStart={() => setOpen(!open)}
            onKeyDown={e => {
              e.preventDefault();
              if (e.key === "Enter") setOpen(!open);
            }}>
            <Button {...props}>{children}</Button>
          </a>
        </TooltipTrigger>
        <TooltipContent className={!tooltipContent ? "hidden" : ""}>
          <span className="inline-block select-none">{tooltipContent}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
