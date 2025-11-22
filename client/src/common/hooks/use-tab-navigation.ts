import { useCallback, useMemo } from "react";
import { useLocation, useSearch } from "wouter";

/**
 * Global hook for managing tab navigation with URL query parameters
 * Provides consistent tab state management across all modules
 */
export function useTabNavigation(defaultTab: string = "overview") {
  const [, navigate] = useLocation();
  const search = useSearch();

  // Parse search parameters manually and memoize to prevent unnecessary re-renders
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const activeTab = useMemo(
    () => searchParams.get("tab") || defaultTab,
    [searchParams, defaultTab]
  );

  /**
   * Navigate to a specific tab
   * Updates the URL with the tab parameter
   */
  const setActiveTab = useCallback(
    (tab: string) => {
      const newSearchParams = new URLSearchParams(search);
      newSearchParams.set("tab", tab);
      const newSearch = newSearchParams.toString();
      navigate(
        `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`
      );
    },
    [navigate, search]
  );

  /**
   * Get a specific query parameter value
   */
  const getQueryParam = useCallback(
    (key: string, defaultValue?: string) => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  /**
   * Set a specific query parameter
   */
  const setQueryParam = useCallback(
    (key: string, value: string) => {
      const newSearchParams = new URLSearchParams(search);
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
      const newSearch = newSearchParams.toString();
      navigate(
        `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`
      );
    },
    [navigate, search]
  );

  /**
   * Clear all query parameters
   */
  const clearQueryParams = useCallback(() => {
    navigate(window.location.pathname);
  }, [navigate]);

  return {
    activeTab,
    setActiveTab,
    getQueryParam,
    setQueryParam,
    clearQueryParams,
    searchParams,
  };
}

/**
 * Hook for modules that need lazy loading based on active tab
 * Returns whether a specific tab is currently active
 * This hook directly uses wouter hooks to avoid hook order issues
 */
export function useTabActive(tabName: string) {
  const search = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const activeTab = useMemo(
    () => searchParams.get("tab") || "overview",
    [searchParams]
  );

  return activeTab === tabName;
}

/**
 * Hook for conditional data fetching based on active tab
 * Returns enabled state for React Query hooks
 * This hook directly uses wouter hooks to avoid hook order issues
 * @param tabName - The tab name(s) to check for
 * @param defaultTab - The default tab to use if no tab is in the URL (should match useTabNavigation defaultTab)
 */
export function useTabEnabled(tabName: string | string[], defaultTab: string = "overview") {
  const search = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const activeTab = useMemo(
    () => searchParams.get("tab") || defaultTab,
    [searchParams, defaultTab]
  );

  if (Array.isArray(tabName)) {
    return tabName.includes(activeTab);
  }

  return activeTab === tabName;
}
