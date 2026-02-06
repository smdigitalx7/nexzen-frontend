"use client";

import * as React from "react";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { useCollegeClasses } from "@/features/college/hooks/use-college-dropdowns";
import type { ClassOption } from "@/features/college/types/dropdowns";

export interface CollegeClassDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
  emptyValueLabel?: string;
  id?: string;
  modal?: boolean;
}

/**
 * CollegeClassDropdown - Reusable dropdown for selecting college classes
 * 
 * Features:
 * - ✅ OPTIMIZATION: On-demand fetching - only fetches when dropdown is opened
 * - Loading and error states with loader in dropdown
 * - Consistent styling
 */
export function CollegeClassDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select class",
  className,
  emptyValue = false,
  emptyValueLabel = "No class",
  id,
  modal = false,
}: CollegeClassDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useCollegeClasses({ enabled: shouldFetch });

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleSelect = React.useCallback(
    (newValue: string) => {
      onChange?.(newValue ? Number(newValue) : null);
    },
    [onChange]
  );

  // ✅ OPTIMIZATION: Trigger fetch when dropdown opens
  const handleDropdownOpen = React.useCallback(
    (open: boolean) => {
      if (open && !shouldFetch) {
        setShouldFetch(true);
      }
    },
    [shouldFetch]
  );

  return (
    <ServerCombobox<ClassOption>
      items={options}
      value={value ? String(value) : ""}
      onSelect={handleSelect}
      isLoading={isLoading}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder="Search class..."
      emptyText={error ? "Failed to load classes" : "No classes found."}
      className={className}
      valueKey="class_id"
      labelKey="class_name"
      onDropdownOpen={handleDropdownOpen}
      modal={modal}
    />
  );
}

