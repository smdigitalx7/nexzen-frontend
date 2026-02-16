import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";

import { cn } from "@/common/utils";
import { buttonVariants } from "@/common/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Custom Caption component that renders dropdowns without labels
function CustomCaption(
  props: CaptionProps & { fromYear?: number; toYear?: number }
) {
  const { displayMonth, fromYear, toYear } = props;
  const { goToMonth } = useNavigation();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  // Use fromYear and toYear from props
  const yearFrom = fromYear ?? 1900;
  const yearTo = toYear ?? new Date().getFullYear() + 10;

  const years = Array.from(
    { length: yearTo - yearFrom + 1 },
    (_, i) => yearFrom + i
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    if (goToMonth) {
      goToMonth(new Date(currentYear, newMonth, 1));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    if (goToMonth) {
      goToMonth(new Date(newYear, currentMonth, 1));
    }
  };

  return (
    <div className="flex justify-center pt-0 relative items-center mb-1.5 gap-2 px-1">
      <select
        aria-label="Select month"
        value={currentMonth}
        onChange={handleMonthChange}
        className="h-7 rounded-md border border-input/50 bg-background pl-2 pr-6 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 cursor-pointer min-w-[100px] shadow-sm outline-none transition-all hover:border-primary/50 hover:bg-muted/30"
      >
        {months.map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
      <select
        aria-label="Select year"
        value={currentYear}
        onChange={handleYearChange}
        className="h-7 rounded-md border border-input/50 bg-background pl-2 pr-6 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 cursor-pointer min-w-[80px] shadow-sm outline-none transition-all hover:border-primary/50 hover:bg-muted/30"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  const isDropdown = captionLayout === "dropdown";

  // Create a wrapper component that passes fromYear and toYear to CustomCaption
  const CaptionWithProps = React.useCallback(
    (captionProps: CaptionProps) => (
      <CustomCaption {...captionProps} fromYear={fromYear} toYear={toYear} />
    ),
    [fromYear, toYear]
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout || "buttons"}
      className={cn("p-1.5", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-2 sm:space-x-4 sm:space-y-0",
        month: "space-y-1.5",
        caption: "flex justify-center pt-0 relative items-center mb-0.5",
        caption_label:
          captionLayout === "dropdown" ? "sr-only" : "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-1.5 items-center",
        dropdown:
          "h-7 rounded-md border border-input bg-background px-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer",
        dropdown_month:
          "h-7 rounded-md border border-input bg-background px-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer min-w-[100px]",
        dropdown_year:
          "h-7 rounded-md border border-input bg-background px-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer min-w-[80px]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-background p-0 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-0",
        head_row: "flex",
        head_cell:
          "text-muted-foreground w-8 font-normal mb-1 text-[0.7rem] border-b border-1",
        row: "flex w-full mt-0.5",
        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-normal text-xs rounded-md transition-all duration-200",
          "hover:bg-slate-200 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 focus:ring-1 focus:ring-slate-300 active:scale-95"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground focus:!bg-primary focus:!text-primary-foreground ring-2 ring-primary ring-offset-2",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
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
        ...(isDropdown && { Caption: CaptionWithProps }),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
