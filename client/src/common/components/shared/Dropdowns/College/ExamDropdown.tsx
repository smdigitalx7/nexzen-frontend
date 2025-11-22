"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeExams } from "@/features/college/hooks/use-college-dropdowns";
import type { ExamOption } from "@/features/college/types/dropdowns";

export interface CollegeExamDropdownProps {
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
 * CollegeExamDropdown - Reusable dropdown for selecting college exams
 * 
 * Features:
 * - Fetches exams from college API
 * - Shows exam date if available
 * - Loading and error states
 */
export function CollegeExamDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select exam",
  className,
  emptyValue = false,
  emptyValueLabel = "No exam",
}: CollegeExamDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useCollegeExams({ enabled: shouldFetch });

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  // ✅ OPTIMIZATION: Trigger fetch when dropdown opens
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open && !shouldFetch) {
        setShouldFetch(true);
      }
    },
    [shouldFetch]
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
      onOpenChange={handleOpenChange}
    />
  );
}

