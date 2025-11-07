"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useQuery } from "@tanstack/react-query";
import { EmployeesService } from "@/lib/services/general/employees.service";
import type { TeacherByBranch } from "@/lib/types/general/employees";

export interface SchoolTeacherDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
}

/**
 * SchoolTeacherDropdown - Reusable dropdown for selecting teachers
 * 
 * Features:
 * - Fetches teachers by branch from public API
 * - Loading and error states
 * - Consistent styling
 */
export function SchoolTeacherDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select teacher",
  className,
  emptyValue = false,
}: SchoolTeacherDropdownProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teachers", "by-branch"],
    queryFn: () => EmployeesService.getTeachersByBranch(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const options = React.useMemo(() => {
    return data || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  return (
    <BaseDropdown<TeacherByBranch>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      getValue={(option) => option.employee_id}
      getLabel={(option) => option.employee_name}
      noOptionsText="No teachers available"
      loadingText="Loading teachers..."
      errorText="Failed to load teachers"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel="No teacher"
    />
  );
}

