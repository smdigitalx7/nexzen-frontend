import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="flex justify-center pt-1 relative items-center mb-2">
      <div className="flex justify-center gap-2 items-center">
        <select
          value={currentMonth}
          onChange={handleMonthChange}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer min-w-[120px]"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={handleYearChange}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer min-w-[100px]"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
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
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label:
          captionLayout === "dropdown" ? "sr-only" : "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-2 items-center",
        dropdown:
          "h-8 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
        dropdown_month:
          "h-8 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer min-w-[120px]",
        dropdown_year:
          "h-8 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer min-w-[100px]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-0",
        head_row: "flex",
        head_cell:
          "text-muted-foreground w-9 font-normal mb-1.5 text-[0.8rem] border-b border-1",
        row: "flex w-full mt-0.5",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        ...(isDropdown && { Caption: CaptionWithProps }),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
