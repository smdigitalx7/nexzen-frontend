"use client";

import * as React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/common/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/common/utils";

export interface CollapsibleStatsSectionProps {
  children: React.ReactNode;
  /** Section label (e.g. "Stats", "Summary") */
  label?: string;
  /** Optional: custom icon when open (hide). Default: PanelRightClose */
  iconHide?: React.ComponentType<{ className?: string }>;
  /** Optional: custom icon when closed (show). Default: PanelRightOpen */
  iconShow?: React.ComponentType<{ className?: string }>;
  /** Vertical offset for fixed tag from top (e.g. "11rem"). Default: "11rem" */
  tagTop?: string;
  /** Controlled open state. If omitted, section is uncontrolled with defaultOpen. */
  open?: boolean;
  /** Default open state when uncontrolled. Default: true */
  defaultOpen?: boolean;
  /** Called when open state changes (for controlled use or persistence) */
  onOpenChange?: (open: boolean) => void;
  /** When false, the fixed right-edge tag is hidden (use e.g. a header button instead). Default: true */
  showTag?: boolean;
  className?: string;
}

/**
 * Right-edge tag with rounded card background and icon. Fixed to viewport right.
 * Wraps stats cards in a collapsible section. Click the tag to expand/collapse.
 */
export function CollapsibleStatsSection({
  children,
  label = "Stats",
  iconHide: IconHide = PanelRightClose,
  iconShow: IconShow = PanelRightOpen,
  tagTop = "11rem",
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  showTag = true,
  className,
}: CollapsibleStatsSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={handleOpenChange}
      className={cn("relative flex overflow-visible", !open && "min-h-0", className)}
    >
      <CollapsibleContent className="overflow-visible flex-1 min-w-0 data-[state=closed]:hidden">
        <div className={cn("pr-2", !showTag && "pr-0")}>{children}</div>
      </CollapsibleContent>
      {showTag && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger
                className={cn(
                  "fixed z-50 w-11 h-14 shrink-0",
                  "flex items-center justify-center",
                  "rounded-l-xl border border-r-0 border-border/80",
                  "bg-card shadow-md hover:bg-muted/50",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                style={{ right: 0, top: tagTop }}
                aria-expanded={open}
                aria-label={open ? `Hide ${label}` : `Show ${label}`}
              >
                {open ? (
                  <IconHide className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <IconShow className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {open ? `Hide ${label}` : `Show ${label}`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Collapsible>
  );
}
