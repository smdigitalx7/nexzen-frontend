/**
 * Custom hook for global student search
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { GlobalSearchService, type GlobalSearchResponse } from "@/features/general/services/global-search.service";
import { useDebounce } from "@/common/hooks/useDebounce";

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

  // Debounce the query to avoid excessive API calls - 150ms delay for better responsiveness
  // ✅ FIX: Reduced from 300ms to 150ms for faster search feedback
  const debouncedQuery = useDebounce(query, 150);

  const performSearch = useCallback(async () => {
    const trimmedQuery = debouncedQuery?.trim() || "";
    
    // Clear results if query is empty
    if (!trimmedQuery) {
      setSearchResult(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    // Only search when admission number is exactly 11 characters
    if (trimmedQuery.length !== 11) {
      setSearchResult(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    if (!currentBranch?.branch_type) {
      setError("Branch type not available");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await GlobalSearchService.searchStudent(
        trimmedQuery,
        currentBranch.branch_type
      );

      setSearchResult(result);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during search";
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

  // Auto-search when debounced query changes and meets criteria
  useEffect(() => {
    void performSearch();
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

