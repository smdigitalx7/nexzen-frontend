/**
 * Custom hook for global student search
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { GlobalSearchService, type GlobalSearchResponse } from "@/lib/services/general/global-search.service";
import { useDebounce } from "@/lib/hooks/common/useDebounce";

export interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  searchResult: GlobalSearchResponse | null;
  isSearching: boolean;
  error: string | null;
  clearSearch: () => void;
  performSearch: () => Promise<void>;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<GlobalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentBranch } = useAuthStore();

  // Debounce the query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 500);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery || debouncedQuery.trim() === "") {
      setSearchResult(null);
      setError(null);
      return;
    }

    if (!currentBranch?.branch_type) {
      setError("Branch type not available");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await GlobalSearchService.searchStudent(
        debouncedQuery.trim(),
        currentBranch.branch_type
      );

      setSearchResult(result);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "An error occurred during search";
      setError(errorMessage);
      setSearchResult({
        result: null,
        branchType: currentBranch.branch_type,
        error: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, currentBranch?.branch_type]);

  // Auto-search when debounced query changes
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setSearchResult(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    searchResult,
    isSearching,
    error,
    clearSearch,
    performSearch,
  };
}

