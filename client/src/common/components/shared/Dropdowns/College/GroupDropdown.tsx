"use client";

import * as React from "react";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import type { GroupOption } from "@/features/college/types/dropdowns";

export interface CollegeGroupDropdownProps {
  classId?: number;
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
 * CollegeGroupDropdown - Reusable dropdown for selecting college groups
 * 
 * Features:
 * - Optionally depends on classId
 * - Auto-clears when classId changes
 * - Loading and error states
 */
export function CollegeGroupDropdown({
  classId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select group",
  className,
  emptyValue = false,
  emptyValueLabel = "No group",
  id,
  modal = false,
}: CollegeGroupDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useCollegeGroups(classId, { enabled: shouldFetch });

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  // Auto-clear value when classId changes (if classId is required)
  React.useEffect(() => {
    if (classId !== undefined && classId <= 0 && value !== null) {
      onChange?.(null);
    }
  }, [classId, value, onChange]);

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

  // Only disable if explicitly disabled or if classId is explicitly set to 0 or negative
  // Allow dropdown to work when classId is undefined (shows all groups)
  const isDisabled = disabled || (classId !== undefined && classId <= 0);

  const displayPlaceholder = 
    classId !== undefined && classId <= 0
      ? "Select class first"
      : isLoading
      ? "Loading groups..."
      : placeholder;

  return (
    <ServerCombobox<GroupOption>
      items={options}
      value={value ? String(value) : ""}
      onSelect={handleSelect}
      isLoading={isLoading}
      disabled={isDisabled}
      placeholder={displayPlaceholder}
      searchPlaceholder="Search group..."
      emptyText={
        classId !== undefined && classId <= 0
          ? "Select class first"
          : error
          ? "Failed to load groups"
          : "No groups found."
      }
      className={className}
      valueKey="group_id"
      labelKey="group_name"
      onDropdownOpen={handleDropdownOpen}
      modal={modal}
    />
  );
}

