import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type TextTooltipProps = {
  children: React.ReactNode;
  content: string;
  disabled: boolean;
};

export const TextTooltip = ({ children, content, disabled }: TextTooltipProps) => {
  if (disabled) return <>{children}</>;
  return (
    <TooltipProvider disableHoverableContent delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a>{children}</a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
