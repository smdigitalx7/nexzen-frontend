"use client"

import * as React from "react"
import { ServerCombobox, ServerComboboxProps } from "./server-combobox"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { cn } from "@/common/utils"

interface SmartSelectProps<T> extends Omit<ServerComboboxProps<T>, 'items'> {
  items: T[];
  // If true, always use ServerCombobox regardless of item count
  forceCombobox?: boolean;
  // Threshold for switching to radio buttons (default: 3)
  radioThreshold?: number;
  // Layout for radio buttons
  radioLayout?: 'horizontal' | 'vertical';
}

/**
 * Smart dropdown that automatically chooses the best UI:
 * - Radio buttons for ≤3 items (better UX for few options)
 * - ServerCombobox for >3 items (searchable, scrollable)
 */
export function SmartSelect<T extends Record<string, any>>({
  items = [],
  forceCombobox = false,
  radioThreshold = 3,
  radioLayout = 'horizontal',
  value,
  onSelect,
  labelKey = "label" as keyof T,
  valueKey = "value" as keyof T,
  disabled = false,
  className,
  ...comboboxProps
}: SmartSelectProps<T>) {
  const getLabel = (item: T) => {
    return typeof labelKey === 'function' ? labelKey(item) : String(item[labelKey]);
  };

  const getValue = (item: T) => String(item[valueKey]);

  // Use radio buttons for small static lists
  const useRadio = !forceCombobox && items.length > 0 && items.length <= radioThreshold;

  if (useRadio) {
    return (
      <RadioGroup
        value={value}
        onValueChange={onSelect}
        disabled={disabled}
        className={cn(
          radioLayout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2',
          className
        )}
      >
        {items.map((item) => {
          const itemValue = getValue(item);
          const itemLabel = getLabel(item);
          
          return (
            <div key={itemValue} className="flex items-center space-x-2">
              <RadioGroupItem value={itemValue} id={`radio-${itemValue}`} />
              <Label
                htmlFor={`radio-${itemValue}`}
                className="font-normal cursor-pointer"
              >
                {itemLabel}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  }

  // Use ServerCombobox for larger lists
  return (
    <ServerCombobox
      items={items}
      value={value}
      onSelect={onSelect}
      labelKey={labelKey}
      valueKey={valueKey}
      disabled={disabled}
      className={className}
      {...comboboxProps}
    />
  );
}
