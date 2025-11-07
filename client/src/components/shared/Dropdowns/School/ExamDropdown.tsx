"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolExams } from "@/lib/hooks/school/use-school-dropdowns";
import type { ExamOption } from "@/lib/types/school/dropdowns";

export interface SchoolExamDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
  emptyValueLabel?: string;
}

/**
 * SchoolExamDropdown - Reusable dropdown for selecting school exams
 * 
 * Features:
 * - Fetches exams from school API
 * - Shows exam date if available
 * - Loading and error states
 */
export function SchoolExamDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select exam",
  className,
  emptyValue = false,
  emptyValueLabel = "No exam",
}: SchoolExamDropdownProps) {
  const { data, isLoading, error, refetch } = useSchoolExams();

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  const renderOption = React.useCallback((option: ExamOption) => {
    if (option.exam_date) {
      return (
        <div className="flex flex-col">
          <span>{option.exam_name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(option.exam_date).toLocaleDateString()}
          </span>
        </div>
      );
    }
    return option.exam_name;
  }, []);

  return (
    <BaseDropdown<ExamOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      getValue={(option) => option.exam_id}
      getLabel={(option) => option.exam_name}
      renderOption={renderOption}
      noOptionsText="No exams available"
      loadingText="Loading exams..."
      errorText="Failed to load exams"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

