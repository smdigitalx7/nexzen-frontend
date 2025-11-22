"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolSections } from "@/features/school/hooks/use-school-dropdowns";
import type { SectionOption } from "@/features/school/types/dropdowns";

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
  id?: string;
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
  id,
}: SchoolSectionDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useSchoolSections(classId, { enabled: shouldFetch && classId > 0 });

  const options = React.useMemo(() => {
    // Don't show options when classId is invalid
    if (classId <= 0) {
      return [];
    }
    return data?.items || [];
  }, [data, classId]);

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

  // ✅ OPTIMIZATION: Trigger fetch when dropdown opens (only if classId is valid)
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open && !shouldFetch && classId > 0) {
        setShouldFetch(true);
      }
    },
    [shouldFetch, classId]
  );

  const isDisabled = disabled || classId <= 0;
  const hasNoClass = classId <= 0;

  // Use the provided placeholder when classId <= 0, or default to "Select class first"
  const displayPlaceholder = hasNoClass 
    ? (placeholder || "Select class first")
    : placeholder;

  // When no class is selected, don't use emptyValue so placeholder can show
  const shouldUseEmptyValue = hasNoClass ? false : emptyValue;

  return (
    <BaseDropdown<SectionOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={hasNoClass ? false : isLoading}
      error={hasNoClass ? null : error}
      disabled={isDisabled}
      required={required}
      placeholder={displayPlaceholder}
      className={className}
      id={id}
      getValue={(option) => option.section_id}
      getLabel={(option) => option.section_name}
      noOptionsText={hasNoClass ? displayPlaceholder : "No sections available"}
      loadingText="Loading sections..."
      errorText="Failed to load sections"
      onRetry={() => refetch()}
      emptyValue={shouldUseEmptyValue}
      emptyValueLabel={emptyValueLabel}
      onOpenChange={handleOpenChange}
    />
  );
}

