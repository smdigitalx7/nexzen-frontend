import React from "react";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useEmployeesMinimal } from "@/features/general/hooks/useEmployees";
import { RefreshCw } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { ServerCombobox } from "@/common/components/ui/server-combobox";

interface BiometricFiltersProps {
  // Config
  showDate?: boolean;
  showYear?: boolean;
  showMonth?: boolean;

  // Values
  date?: string;
  year?: number;
  month?: number;
  employeeId?: number | null;
  companyId?: number | null;
  departmentId?: number | null;
  categoryId?: number | null;

  // Setters
  onDateChange?: (val: string) => void;
  onYearChange?: (val: number) => void;
  onMonthChange?: (val: number) => void;
  onEmployeeChange?: (val: number | null) => void;
  onCompanyChange?: (val: number | null) => void;
  onDepartmentChange?: (val: number | null) => void;
  onCategoryChange?: (val: number | null) => void;

  // Actions
  onReset: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 years back to 2 years ahead

export const BiometricFilters = ({
  showDate = false,
  showYear = false,
  showMonth = false,
  date = "",
  year = currentYear,
  month = new Date().getMonth() + 1,
  employeeId = null,
  companyId = null,
  departmentId = null,
  categoryId = null,
  onDateChange,
  onYearChange,
  onMonthChange,
  onEmployeeChange,
  onCompanyChange,
  onDepartmentChange,
  onCategoryChange,
  onReset,
  onRefresh,
  isLoading = false,
}: BiometricFiltersProps) => {
  const { data: employeesData = [], isLoading: employeesLoading } = useEmployeesMinimal();

  // Handle both array and paginated/wrapped response types
  const employees = React.useMemo(() => {
    if (Array.isArray(employeesData)) return employeesData;
    const raw: any = employeesData;
    if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
      return raw.data;
    }
    return [];
  }, [employeesData]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    onCompanyChange?.(val !== null && isNaN(val) ? null : val);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    onDepartmentChange?.(val !== null && isNaN(val) ? null : val);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    onCategoryChange?.(val !== null && isNaN(val) ? null : val);
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-end gap-4 w-full">
      {/* Left side: Filter Inputs */}
      <div className="flex flex-wrap items-end gap-4 flex-1">
        {showDate && onDateChange && (
          <div className="space-y-2 w-48">
            <Label htmlFor="biometric-date" className="text-slate-700 dark:text-slate-300 font-semibold">
              Attendance Date
            </Label>
            <DatePicker
              id="biometric-date"
              value={date}
              onChange={onDateChange}
              placeholder="Select date"
              className="h-10 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 focus:ring-slate-400/20"
            />
          </div>
        )}

        {showYear && onYearChange && (
          <div className="space-y-2 w-32">
            <Label htmlFor="biometric-year" className="text-slate-700 dark:text-slate-300 font-semibold">Year</Label>
            <Select
              value={year.toString()}
              onValueChange={(val) => onYearChange(parseInt(val, 10))}
            >
              <SelectTrigger id="biometric-year" className="h-10 border-slate-200 bg-white">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showMonth && onMonthChange && (
          <div className="space-y-2 w-40">
            <Label htmlFor="biometric-month" className="text-slate-700 dark:text-slate-300 font-semibold">Month</Label>
            <Select
              value={month.toString()}
              onValueChange={(val) => onMonthChange(parseInt(val, 10))}
            >
              <SelectTrigger id="biometric-month" className="h-10 border-slate-200 bg-white">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {onEmployeeChange && (
          <div className="space-y-2 w-64">
            <Label htmlFor="biometric-employee" className="text-slate-700 dark:text-slate-300 font-semibold">
              Employee
            </Label>
            <ServerCombobox
              items={employees}
              isLoading={employeesLoading}
              value={employeeId?.toString() || ""}
              onSelect={(val) => onEmployeeChange(val ? parseInt(val, 10) : null)}
              placeholder="All Employees"
              searchPlaceholder="Search employees..."
              emptyText="No employees found."
              valueKey="employee_id"
              labelKey={(emp: any) => `${emp.employee_name} (${emp.employee_code || `ID: ${emp.employee_id}`})`}
              width="w-full"
              className="h-10 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-left justify-between font-normal"
            />
          </div>
        )}
      </div>

      {/* Commented out secondary ID filters as per request to focus on Date and Employee filters */}
      {/* 
      {onCompanyChange && (
        <div className="space-y-2 w-32">
          <Label htmlFor="biometric-company">Company ID</Label>
          <Input
            id="biometric-company"
            type="number"
            min={1}
            placeholder="Company ID"
            value={companyId || ""}
            onChange={handleCompanyChange}
          />
        </div>
      )}

      {onDepartmentChange && (
        <div className="space-y-2 w-32">
          <Label htmlFor="biometric-department">Department ID</Label>
          <Input
            id="biometric-department"
            type="number"
            min={1}
            placeholder="Department ID"
            value={departmentId || ""}
            onChange={handleDepartmentChange}
          />
        </div>
      )}

      {onCategoryChange && (
        <div className="space-y-2 w-32">
          <Label htmlFor="biometric-category">Category ID</Label>
          <Input
            id="biometric-category"
            type="number"
            min={1}
            placeholder="Category ID"
            value={categoryId || ""}
            onChange={handleCategoryChange}
          />
        </div>
      )}
      */}

      {/* Right side: Inline Action Buttons */}
      <div className="flex items-center gap-2 pb-0.5 shrink-0">
        <Button variant="outline" className="h-10 px-4 border-slate-200 hover:bg-slate-50" onClick={onReset}>
          Reset
        </Button>
        <Button
          variant="outline"
          className="h-10 px-4 gap-2 border-slate-200 hover:bg-slate-50"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader.Button size="xs" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>
    </div>
  );
};
