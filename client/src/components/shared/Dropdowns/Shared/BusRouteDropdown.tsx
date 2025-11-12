"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useQuery } from "@tanstack/react-query";
import { TransportService } from "@/lib/services/general/transport.service";

export interface BusRouteOption {
  bus_route_id: number;
  route_name: string;
  route_no?: string;
}

export interface BusRouteDropdownProps {
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
 * BusRouteDropdown - Reusable dropdown for selecting bus routes
 * 
 * Features:
 * - Fetches route names from transport API
 * - Shows route number if available
 * - Loading and error states
 */
export function BusRouteDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select bus route",
  className,
  emptyValue = false,
  emptyValueLabel = "No route",
  id,
}: BusRouteDropdownProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bus-routes", "names"],
    queryFn: () => TransportService.getRouteNames(),
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

  const renderOption = React.useCallback((option: BusRouteOption) => {
    if (option.route_no) {
      return `${option.route_name} (${option.route_no})`;
    }
    return option.route_name;
  }, []);

  const getLabel = React.useCallback((option: BusRouteOption) => {
    if (option.route_no) {
      return `${option.route_name} (${option.route_no})`;
    }
    return option.route_name;
  }, []);

  return (
    <BaseDropdown<BusRouteOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      id={id}
      getValue={(option) => option.bus_route_id}
      getLabel={getLabel}
      renderOption={renderOption}
      noOptionsText="No bus routes available"
      loadingText="Loading routes..."
      errorText="Failed to load bus routes"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

