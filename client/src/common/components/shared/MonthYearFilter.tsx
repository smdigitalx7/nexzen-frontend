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
}: MonthYearFilterProps) => {
  return (
    <div className={cn("flex items-end gap-4", className)}>
      <div className="flex-1">
        {showLabels && (
          <Label htmlFor={monthId} className="text-sm font-medium mb-2 block">
            {monthLabel}
          </Label>
        )}
        <Select
          value={month.toString()}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger id={monthId} className="w-full">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
              <SelectItem key={monthNum} value={monthNum.toString()}>
                {new Date(0, monthNum - 1).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-32">
        {showLabels && (
          <Label htmlFor={yearId} className="text-sm font-medium mb-2 block">
            {yearLabel}
          </Label>
        )}
        <Input
          id={yearId}
          type="number"
          value={year}
          onChange={(e) => {
            const yearValue = parseInt(e.target.value) || new Date().getFullYear();
            onYearChange(yearValue);
          }}
          min={yearMin.toString()}
          max={yearMax.toString()}
          className="w-full"
        />
      </div>
    </div>
  );
};
