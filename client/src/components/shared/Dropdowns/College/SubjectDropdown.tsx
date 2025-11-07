"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeSubjects } from "@/lib/hooks/college/use-college-dropdowns";
import type { SubjectOption } from "@/lib/types/college/dropdowns";

export interface CollegeSubjectDropdownProps {
  groupId: number;
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
 * CollegeSubjectDropdown - Reusable dropdown for selecting college subjects
 * 
 * Features:
 * - Depends on groupId (disabled until group is selected)
 * - Auto-clears when groupId changes
 * - Loading and error states
 */
export function CollegeSubjectDropdown({
  groupId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select subject",
  className,
  emptyValue = false,
  emptyValueLabel = "No subject",
}: CollegeSubjectDropdownProps) {
  const { data, isLoading, error, refetch } = useCollegeSubjects(groupId);

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  // Auto-clear value when groupId changes
  React.useEffect(() => {
    if (groupId <= 0 && value !== null) {
      onChange?.(null);
    }
  }, [groupId, value, onChange]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  const isDisabled = disabled || groupId <= 0;

  return (
    <BaseDropdown<SubjectOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={isDisabled}
      required={required}
      placeholder={groupId <= 0 ? "Select group first" : placeholder}
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

