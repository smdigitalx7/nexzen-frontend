"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useQuery } from "@tanstack/react-query";
import { DistanceSlabsService } from "@/lib/services/general/distance-slabs.service";
import type { DistanceSlabRead } from "@/lib/types/general/distance-slabs";

export interface DistanceSlabDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
}

/**
 * DistanceSlabDropdown - Reusable dropdown for selecting distance slabs
 * 
 * Features:
 * - Fetches distance slabs from transport API
 * - Shows distance range and fee amount
 * - Loading and error states
 */
export function DistanceSlabDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select distance slab",
  className,
  emptyValue = false,
}: DistanceSlabDropdownProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["distance-slabs"],
    queryFn: () => DistanceSlabsService.listDistanceSlabs(),
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

  const renderOption = React.useCallback((option: DistanceSlabRead) => {
    const maxDistance = option.max_distance ?? "∞";
    return (
      <div className="flex flex-col">
        <span>
          {option.slab_name} ({option.min_distance}-{maxDistance} km)
        </span>
        <span className="text-xs text-muted-foreground">
          ₹{option.fee_amount.toLocaleString()}
        </span>
      </div>
    );
  }, []);

  const getLabel = React.useCallback((option: DistanceSlabRead) => {
    const maxDistance = option.max_distance ?? "∞";
    return `${option.slab_name} (${option.min_distance}-${maxDistance} km) - ₹${option.fee_amount.toLocaleString()}`;
  }, []);

  return (
    <BaseDropdown<DistanceSlabRead>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      getValue={(option) => option.slab_id}
      getLabel={getLabel}
      renderOption={renderOption}
      noOptionsText="No distance slabs available"
      loadingText="Loading distance slabs..."
      errorText="Failed to load distance slabs"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel="No slab"
    />
  );
}

