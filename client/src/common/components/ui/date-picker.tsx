import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/common/components/ui/calendar";
import { Button, buttonVariants } from "@/common/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { cn } from "@/common/utils";
import { CaptionProps, useNavigation } from "react-day-picker";

interface DatePickerProps {
  value?: string; // yyyy-mm-dd format
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
}

// Custom Caption with navigation buttons between month and year
function DatePickerCaption(
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
    <div className="flex items-center justify-center gap-2 px-1 py-1 mb-1">
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

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  required: _required = false,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 10,
}: DatePickerProps & { fromYear?: number; toYear?: number }) {
  const [open, setOpen] = React.useState(false);

  // Convert string (yyyy-mm-dd) to Date object
  const dateValue = value ? new Date(value + "T00:00:00") : undefined;

  // Check if date is valid
  const isValidDate = dateValue && !isNaN(dateValue.getTime());
  const selectedDate = isValidDate ? dateValue : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to yyyy-mm-dd format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  // Create caption component with fromYear and toYear props
  const CaptionWithProps = React.useCallback(
    (captionProps: CaptionProps) => (
      <DatePickerCaption
        {...captionProps}
        fromYear={fromYear}
        toYear={toYear}
      />
    ),
    [fromYear, toYear]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-datepicker-popover
        className="w-auto p-0 z-[10001]"
        align="start"
        style={{ pointerEvents: "auto" }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside calendar elements
          const target = e.target as HTMLElement;
          if (target.closest('[role="grid"]') || target.closest("select")) {
            e.preventDefault();
          }
        }}
      >
        <div
          style={{ pointerEvents: "auto" }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus={true}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            components={{
              Caption: CaptionWithProps,
            }}
            classNames={{
              nav_button: "hidden",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
