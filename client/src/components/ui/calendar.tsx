import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 rounded-lg border border-border/50 bg-card shadow-md",
        className
      )}
      classNames={{
        months: "flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-between items-center pt-1 mb-3 pb-2 border-b border-border/50 relative",
        caption_label: "text-sm font-semibold text-foreground absolute left-1/2 -translate-x-1/2",
        nav: "flex items-center gap-1 w-full",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background p-0 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200"
        ),
        nav_button_previous: "ml-0",
        nav_button_next: "ml-auto",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-1",
        head_cell:
          "text-muted-foreground rounded-md w-8 h-8 font-medium text-[10px] uppercase tracking-wide flex items-center justify-center text-foreground/60",
        row: "flex w-full mt-0.5",
        cell: "h-8 w-8 text-center text-xs p-0 relative rounded-md [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-xs rounded-md aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-all duration-200 focus:bg-primary/10 focus:text-primary focus:ring-1 focus:ring-primary/20 active:scale-95"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-sm font-medium",
        day_today: "bg-accent/60 text-accent-foreground font-medium border border-primary/30",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-60 aria-selected:bg-primary/5 aria-selected:text-primary/70",
        day_disabled: "text-muted-foreground/30 opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/30",
        day_range_middle:
          "aria-selected:bg-primary/10 aria-selected:text-primary font-medium",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-3.5 w-3.5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-3.5 w-3.5", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
