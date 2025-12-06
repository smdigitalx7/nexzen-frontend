import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/common/utils";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { useEmployeesMinimal } from "@/features/general/hooks/useEmployees";
import type { EmployeeMinimal } from "@/features/general/types/employees";

interface EmployeeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function EmployeeSelect({
  value,
  onValueChange,
  placeholder = "Select employee...",
  className,
  id,
}: EmployeeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ✅ FIX: Use minimal endpoint for better performance - only fetch when dropdown is open
  const { data: employees = [], isLoading } = useEmployeesMinimal(open);

  const selectedEmployee = React.useMemo(() => {
    return employees.find(
      (employee) => employee.employee_id.toString() === value
    );
  }, [employees, value]);

  const hasValidValue = value && value !== "" && value !== "0";

  // Filter employees based on search query
  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }
    const query = searchQuery.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.employee_name?.toLowerCase().includes(query) ||
        emp.employee_id.toString().includes(query)
    );
  }, [employees, searchQuery]);

  const handleSelect = React.useCallback((employeeId: string) => {
    onValueChange(employeeId);
    setOpen(false);
    setSearchQuery("");
  }, [onValueChange]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Don't close if clicking on dialog overlay
        if (!target.closest('[data-radix-dialog-overlay]')) {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  // Focus input when dropdown opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        id={id}
        onClick={() => setOpen(!open)}
        className={cn("w-full justify-between", className)}
      >
        {hasValidValue && selectedEmployee ? (
          <div className="flex flex-col items-start">
            <span className="font-medium">{selectedEmployee.employee_name}</span>
            <span className="text-xs text-muted-foreground">
              ID: {selectedEmployee.employee_id}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Employee List */}
          <div className="overflow-y-auto max-h-48">
            {isLoading ? (
              <Loader.Data message="Loading..." />
            ) : filteredEmployees.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No employee found.
              </div>
            ) : (
              <>
                {hasValidValue && (
                  <button
                    type="button"
                    onClick={() => {
                      onValueChange("");
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 opacity-0" />
                    <span>Clear selection</span>
                  </button>
                )}
                {filteredEmployees.map((employee) => {
                  const employeeId = employee.employee_id.toString();
                  const isSelected = value === employeeId;

                  return (
                    <button
                      key={employee.employee_id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(employeeId);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 cursor-pointer",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100 text-blue-600" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{employee.employee_name}</span>
                        <span className="text-xs text-muted-foreground">
                          Employee ID: {employee.employee_id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
