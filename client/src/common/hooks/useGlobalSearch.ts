/**
 * Custom hook for global student search
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { GlobalSearchService, type GlobalSearchResponse } from "@/features/general/services/global-search.service";

export interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  searchResult: GlobalSearchResponse | null;
  isSearching: boolean;
  error: string | null;
  clearSearch: () => void;
  performSearch: (overrideQuery?: string) => Promise<void>;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<GlobalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentBranch } = useAuthStore();

  const currentRequestIdRef = useRef<number>(0);
  const lastSearchedQueryRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      if (!currentBranch?.branch_type) {
        setError("Branch type not available");
        setIsSearching(false);
        return;
      }

      const requestId = ++currentRequestIdRef.current;
      setIsSearching(true);
      setError(null);

      try {
        const result = await GlobalSearchService.searchStudent(
          searchQuery,
          currentBranch.branch_type
        );

        // Ignore stale responses if a newer request was dispatched
        if (requestId !== currentRequestIdRef.current) {
          return;
        }

        setSearchResult(result);
        if (result.error) {
          setError(result.error);
        }
      } catch (err: unknown) {
        if (requestId !== currentRequestIdRef.current) {
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred during search";
        setError(errorMessage);
        setSearchResult({
          result: null,
          branchType: currentBranch.branch_type,
          error: errorMessage,
        });
      } finally {
        if (requestId === currentRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [currentBranch?.branch_type]
  );

  const performSearch = useCallback(
    async (overrideQuery?: string) => {
      const targetQuery = (overrideQuery ?? query).trim();
      if (targetQuery.length < 11) {
        return;
      }
      lastSearchedQueryRef.current = targetQuery;
      await executeSearch(targetQuery);
    },
    [query, executeSearch]
  );

  const clearSearch = useCallback(() => {
    currentRequestIdRef.current++;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setQuery("");
    setSearchResult(null);
    setError(null);
    setIsSearching(false);
    lastSearchedQueryRef.current = "";
  }, []);

  // Auto-search logic:
  // - Length < 11: Do not perform search, reset results
  // - Length === 11: Immediately perform search without debounce delay
  // - Length > 11: Debounce 300ms before executing search
  useEffect(() => {
    const trimmedQuery = query.trim();

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (trimmedQuery.length < 11) {
      currentRequestIdRef.current++;
      setSearchResult(null);
      setError(null);
      setIsSearching(false);
      lastSearchedQueryRef.current = "";
      return;
    }

    // Immediately trigger search upon reaching 11 characters
    if (trimmedQuery.length === 11) {
      if (trimmedQuery !== lastSearchedQueryRef.current) {
        lastSearchedQueryRef.current = trimmedQuery;
        void executeSearch(trimmedQuery);
      }
      return;
    }

    // Debounce when query length is greater than 11 characters
    debounceTimerRef.current = setTimeout(() => {
      if (trimmedQuery !== lastSearchedQueryRef.current) {
        lastSearchedQueryRef.current = trimmedQuery;
        void executeSearch(trimmedQuery);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, executeSearch]);

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

