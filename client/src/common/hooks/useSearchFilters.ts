import { useMemo, useState } from 'react';

export interface UseSearchFiltersOptions<TItem> {
  keys: Array<keyof TItem>;
  normalize?: (value: unknown) => string;
}

export interface UseSearchFiltersReturn<TItem> {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredItems: TItem[];
}

export function useSearchFilters<TItem>(
  items: TItem[] | undefined,
  options: UseSearchFiltersOptions<TItem>
): UseSearchFiltersReturn<TItem> {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const normalize = options.normalize ?? ((v: unknown) => String(v ?? '').toLowerCase());

  const filteredItems = useMemo<TItem[]>(() => {
    if (!items || items.length === 0) return [];
    if (!searchTerm.trim()) return items;

    const needle = searchTerm.toLowerCase();

    return items.filter((item) => {
      return options.keys.some((key) => {
        const value = (item as any)[key];
        return normalize(value).includes(needle);
      });
    });
  }, [items, searchTerm, options.keys, normalize]);

  return { searchTerm, setSearchTerm, filteredItems };
}


