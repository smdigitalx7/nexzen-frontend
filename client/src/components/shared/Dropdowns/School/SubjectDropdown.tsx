"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolSubjects } from "@/lib/hooks/school/use-school-dropdowns";
import type { SubjectOption } from "@/lib/types/school/dropdowns";

export interface SchoolSubjectDropdownProps {
  classId: number;
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
 * SchoolSubjectDropdown - Reusable dropdown for selecting school subjects
 * 
 * Features:
 * - Depends on classId (disabled until class is selected)
 * - Auto-clears when classId changes
 * - Loading and error states
 */
export function SchoolSubjectDropdown({
  classId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select subject",
  className,
  emptyValue = false,
  emptyValueLabel = "No subject",
}: SchoolSubjectDropdownProps) {
  const { data, isLoading, error, refetch } = useSchoolSubjects(classId);

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  // Auto-clear value when classId changes
  React.useEffect(() => {
    if (classId <= 0 && value !== null) {
      onChange?.(null);
    }
  }, [classId, value, onChange]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  const isDisabled = disabled || classId <= 0;

  return (
    <BaseDropdown<SubjectOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={isDisabled}
      required={required}
      placeholder={classId <= 0 ? "Select class first" : placeholder}
      className={className}
      getValue={(option) => option.subject_id}
      getLabel={(option) => option.subject_name}
      noOptionsText="No subjects available"
      loadingText="Loading subjects..."
      errorText="Failed to load subjects"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

