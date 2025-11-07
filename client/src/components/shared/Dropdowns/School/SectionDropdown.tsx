"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolSections } from "@/lib/hooks/school/use-school-dropdowns";
import type { SectionOption } from "@/lib/types/school/dropdowns";

export interface SchoolSectionDropdownProps {
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
 * SchoolSectionDropdown - Reusable dropdown for selecting school sections
 * 
 * Features:
 * - Depends on classId (disabled until class is selected)
 * - Auto-clears when classId changes
 * - Loading and error states
 */
export function SchoolSectionDropdown({
  classId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select section",
  className,
  emptyValue = false,
  emptyValueLabel = "No section",
}: SchoolSectionDropdownProps) {
  const { data, isLoading, error, refetch } = useSchoolSections(classId);

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
    <BaseDropdown<SectionOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={isDisabled}
      required={required}
      placeholder={classId <= 0 ? "Select class first" : placeholder}
      className={className}
      getValue={(option) => option.section_id}
      getLabel={(option) => option.section_name}
      noOptionsText="No sections available"
      loadingText="Loading sections..."
      errorText="Failed to load sections"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

