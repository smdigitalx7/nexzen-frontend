import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/common/utils";

interface HelpTooltipProps {
  content: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  className,
  iconClassName,
  side = "top",
  align = "center",
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "p-0.5 hover:text-primary transition-colors cursor-help inline-flex items-center justify-center rounded-full ml-1",
              className
            )}
            aria-label="Help information"
          >
            <HelpCircle className={cn("h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors", iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5 text-xs max-w-[250px]"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
