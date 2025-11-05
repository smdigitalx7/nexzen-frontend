import { useCallback, useMemo } from 'react';
import { useQueryClient, useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseQueryOptimizationProps {
  queryKey: string[];
  staleTime?: number;
  cacheTime?: number;
}

interface UseQueryOptimizationReturn {
  invalidateQuery: () => Promise<void>;
  refetchQuery: () => Promise<void>;
  removeQuery: () => void;
  setQueryData: <T>(data: T) => void;
  getQueryData: <T>() => T | undefined;
  isQueryStale: () => boolean;
  getQueryState: () => any;
}

export const useQueryOptimization = ({
  queryKey,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
}: UseQueryOptimizationProps): UseQueryOptimizationReturn => {
  const queryClient = useQueryClient();

  const invalidateQuery = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const refetchQuery = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey });
  }, [queryClient, queryKey]);

  const removeQuery = useCallback(() => {
    queryClient.removeQueries({ queryKey });
  }, [queryClient, queryKey]);

  const setQueryData = useCallback(<T>(data: T) => {
    queryClient.setQueryData(queryKey, data);
  }, [queryClient, queryKey]);

  const getQueryData = useCallback(<T>(): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  }, [queryClient, queryKey]);

  const isQueryStale = useCallback(() => {
    const queryState = queryClient.getQueryState(queryKey);
    if (!queryState) return true;
    
    const now = Date.now();
    const lastUpdated = queryState.dataUpdatedAt;
    return (now - lastUpdated) > staleTime;
  }, [queryClient, queryKey, staleTime]);

  const getQueryState = useCallback(() => {
    return queryClient.getQueryState(queryKey);
  }, [queryClient, queryKey]);

  return {
    invalidateQuery,
    refetchQuery,
    removeQuery,
    setQueryData,
    getQueryData,
    isQueryStale,
    getQueryState,
  };
};

/**
 * Optimized query hook with field selection
 * Use this to fetch only specific fields from a larger dataset
 * 
 * @example
 * // Only fetch employee names instead of full employee objects
 * const { data: employeeNames } = useOptimizedQuery({
 *   queryKey: employeeKeys.lists(),
 *   queryFn: () => EmployeesService.listByBranch(),
 *   select: (employees) => employees.map(e => ({ id: e.employee_id, name: e.employee_name }))
 * });
 */
export function useOptimizedQuery<TData, TSelected = TData>(
  options: UseQueryOptions<TData, Error, TSelected> & {
    select?: (data: TData) => TSelected;
  }
) {
  return useQuery<TData, Error, TSelected>({
    ...options,
    // select only recomputes when data changes, not on every render
    select: options.select,
  });
}
