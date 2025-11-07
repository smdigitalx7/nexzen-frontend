import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CaptionProps, useNavigation } from "react-day-picker"

interface DatePickerProps {
  value?: string // yyyy-mm-dd format
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  required?: boolean
}

// Custom Caption with navigation buttons between month and year
function DatePickerCaption(props: CaptionProps & { fromYear?: number; toYear?: number }) {
  const { displayMonth, fromYear, toYear } = props;
  const { goToMonth, previousMonth, nextMonth } = useNavigation();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  const yearFrom = fromYear ?? 2020;
  const yearTo = toYear ?? new Date().getFullYear() + 1;

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

  const handlePreviousClick = () => {
    if (previousMonth && goToMonth) {
      goToMonth(previousMonth);
    }
  };

  const handleNextClick = () => {
    if (nextMonth && goToMonth) {
      goToMonth(nextMonth);
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
        <button
          type="button"
          onClick={handlePreviousClick}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-background p-0 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-background p-0 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
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

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert string (yyyy-mm-dd) to Date object
  const dateValue = value ? new Date(value + "T00:00:00") : undefined
  
  // Check if date is valid
  const isValidDate = dateValue && !isNaN(dateValue.getTime())
  const selectedDate = isValidDate ? dateValue : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to yyyy-mm-dd format
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      onChange(`${year}-${month}-${day}`)
      setOpen(false)
    }
  }

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
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 z-[10001]" 
        align="start"
        style={{ pointerEvents: 'auto' }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside calendar elements
          const target = e.target as HTMLElement
          if (target.closest('[role="grid"]') || target.closest('select')) {
            e.preventDefault()
          }
        }}
      >
        <div 
          style={{ pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={2020}
            toYear={new Date().getFullYear() + 1}
            components={{
              Caption: DatePickerCaption,
            }}
            classNames={{
              nav_button: "hidden",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

