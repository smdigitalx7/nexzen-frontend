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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 items-end">
      {showDate && onDateChange && (
        <div className="space-y-2">
          <Label htmlFor="biometric-date">Attendance Date</Label>
          <DatePicker
            id="biometric-date"
            value={date}
            onChange={onDateChange}
            placeholder="Select date"
          />
        </div>
      )}

      {showYear && onYearChange && (
        <div className="space-y-2">
          <Label htmlFor="biometric-year">Year</Label>
          <Select
            value={year.toString()}
            onValueChange={(val) => onYearChange(parseInt(val, 10))}
          >
            <SelectTrigger id="biometric-year">
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
        <div className="space-y-2">
          <Label htmlFor="biometric-month">Month</Label>
          <Select
            value={month.toString()}
            onValueChange={(val) => onMonthChange(parseInt(val, 10))}
          >
            <SelectTrigger id="biometric-month">
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
        <div className="space-y-2">
          <Label htmlFor="biometric-employee">Employee</Label>
          <Select
            value={employeeId?.toString() || "all"}
            onValueChange={(val) => onEmployeeChange(val === "all" ? null : parseInt(val, 10))}
          >
            <SelectTrigger id="biometric-employee">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employeesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                employees.map((emp: any) => (
                  <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                    {emp.employee_name} ({emp.employee_code || `ID: ${emp.employee_id}`})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {onCompanyChange && (
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <div className="space-y-2">
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

      <div className="flex gap-2 min-w-[200px] xl:col-span-2">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Reset
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
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
