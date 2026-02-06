import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * Hook to manage state synchronized with URL search parameters.
 * @param key The query parameter key to manage (e.g., 'tab', 'page')
 * @param defaultValue The default value if the parameter is missing
 * @returns [value, setValue] tuple similar to useState
 */
export function useUrlState(key: string, defaultValue: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) || defaultValue;

  const setValue = useCallback(
    (newValue: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (newValue === defaultValue) {
          newParams.delete(key);
        } else {
          newParams.set(key, newValue);
        }
        return newParams;
      });
    },
    [defaultValue, key, setSearchParams]
  );

  return [value, setValue] as const;
}
