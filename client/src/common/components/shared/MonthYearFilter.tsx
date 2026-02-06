import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { cn } from "@/common/utils";

interface MonthYearFilterProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  monthLabel?: string;
  yearLabel?: string;
  monthId?: string;
  yearId?: string;
  className?: string;
  showLabels?: boolean;
  yearMin?: number;
  yearMax?: number;
  // New props for customization
  monthWidth?: string;
  yearWidth?: string;
  monthClassName?: string;
  yearClassName?: string;
  label?: string;
  labelClassName?: string;
}

export const MonthYearFilter = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  monthLabel = "Month",
  yearLabel = "Year",
  monthId = "month-filter",
  yearId = "year-filter",
  className,
  showLabels = true,
  yearMin = 2020,
  yearMax = 2100,
  monthWidth,
  yearWidth,
  monthClassName,
  yearClassName,
  label,
  labelClassName,
}: MonthYearFilterProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && (
        <span className={cn("text-sm font-bold uppercase tracking-wider whitespace-nowrap", labelClassName)}>
          {label}
        </span>
      )}
      <div className="flex-shrink-0" style={{ width: monthWidth || 'auto' }}>
        {showLabels && (
          <Label htmlFor={monthId} className="text-sm font-medium mb-1.5 block">
            {monthLabel}
          </Label>
        )}
        <Select
          value={month.toString()}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger id={monthId} className={cn("w-full h-9", monthClassName)}>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
              <SelectItem key={monthNum} value={monthNum.toString()}>
                {new Date(0, monthNum - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-shrink-0" style={{ width: yearWidth || '100px' }}>
        {showLabels && (
          <Label htmlFor={yearId} className="text-sm font-medium mb-1.5 block">
            {yearLabel}
          </Label>
        )}
        <Input
          id={yearId}
          type="number"
          value={year}
          onChange={(e) => {
            const yearValue =
              parseInt(e.target.value) || new Date().getFullYear();
            onYearChange(yearValue);
          }}
          min={yearMin.toString()}
          max={yearMax.toString()}
          className={cn("w-full h-9", yearClassName)}
        />
      </div>
    </div>
  );
};
