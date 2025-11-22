"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeCourses } from "@/features/college/hooks/use-college-dropdowns";
import type { CourseOption } from "@/features/college/types/dropdowns";

export interface CollegeCourseDropdownProps {
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
 * CollegeCourseDropdown - Reusable dropdown for selecting college courses
 * 
 * Features:
 * - Depends on groupId (disabled until group is selected)
 * - Auto-clears when groupId changes
 * - Loading and error states
 */
export function CollegeCourseDropdown({
  groupId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select course",
  className,
  emptyValue = false,
  emptyValueLabel = "No course",
}: CollegeCourseDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useCollegeCourses(groupId, { enabled: shouldFetch && groupId > 0 });

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

  // ✅ OPTIMIZATION: Trigger fetch when dropdown opens (only if groupId is valid)
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open && !shouldFetch && groupId > 0) {
        setShouldFetch(true);
      }
    },
    [shouldFetch, groupId]
  );

  const isDisabled = disabled || groupId <= 0;

  return (
    <BaseDropdown<CourseOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={isDisabled}
      required={required}
      placeholder={groupId <= 0 ? "Select group first" : placeholder}
      className={className}
      getValue={(option) => option.course_id}
      getLabel={(option) => option.course_name}
      noOptionsText="No courses available"
      loadingText="Loading courses..."
      errorText="Failed to load courses"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
      onOpenChange={handleOpenChange}
    />
  );
}

