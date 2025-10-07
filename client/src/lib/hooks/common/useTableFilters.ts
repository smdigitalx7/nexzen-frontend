import { useMemo, useState } from 'react';

export type SelectFilterValue = string | number | boolean | null | undefined;

export interface TableSelectFilter<TItem> {
  key: keyof TItem;
  value: SelectFilterValue;
}

export interface UseTableFiltersReturn<TItem> {
  filters: Record<string, SelectFilterValue>;
  setFilter: (key: keyof TItem | string, value: SelectFilterValue) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  filteredItems: TItem[];
}

export function useTableFilters<TItem>(
  items: TItem[] | undefined,
  selectFilters: Array<TableSelectFilter<TItem>>
): UseTableFiltersReturn<TItem> {
  const [filters, setFiltersState] = useState<Record<string, SelectFilterValue>>(
    Object.fromEntries(selectFilters.map((f) => [String(f.key), f.value ?? 'all']))
  );

  const setFilter = (key: keyof TItem | string, value: SelectFilterValue) => {
    setFiltersState((prev) => ({ ...prev, [String(key)]: value }));
  };

  const resetFilters = () => {
    setFiltersState(Object.fromEntries(selectFilters.map((f) => [String(f.key), 'all'])));
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== undefined && v !== null && v !== '' && v !== 'all');
  }, [filters]);

  const filteredItems = useMemo<TItem[]>(() => {
    if (!items || items.length === 0) return [];
    const entries = Object.entries(filters);
    if (entries.length === 0) return items;

    return items.filter((item) => {
      for (const [key, value] of entries) {
        if (value === undefined || value === null || value === '' || value === 'all') continue;
        if ((item as any)[key] !== value) return false;
      }
      return true;
    });
  }, [items, filters]);

  return { filters, setFilter, resetFilters, hasActiveFilters, filteredItems };
}


