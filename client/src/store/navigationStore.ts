import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface NavigationHistory {
  module: string;
  timestamp: number;
  path?: string;
}

export interface NavigationPreferences {
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  showBreadcrumbs: boolean;
  showModuleIcons: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface NavigationState {
  // Core navigation state
  sidebarOpen: boolean;
  activeModule: string;
  
  // Navigation history
  history: NavigationHistory[];
  maxHistorySize: number;
  
  // Navigation preferences
  preferences: NavigationPreferences;
  
  // Computed selectors
  getCurrentPath: () => string;
  getPreviousModule: () => string | null;
  canGoBack: () => boolean;
  getModuleHistory: (module: string) => NavigationHistory[];
  isSidebarCollapsed: () => boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveModule: (module: string, path?: string) => void;
  toggleSidebar: () => void;
  
  // History management
  addToHistory: (module: string, path?: string) => void;
  goBack: () => boolean;
  clearHistory: () => void;
  removeFromHistory: (index: number) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NavigationPreferences>) => void;
  resetPreferences: () => void;
  
  // Sidebar management
  toggleSidebarCollapse: () => void;
  toggleSidebarPin: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarPinned: (pinned: boolean) => void;
}

export const useNavigationStore = create<NavigationState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        sidebarOpen: true,
        activeModule: 'dashboard',
        history: [],
        maxHistorySize: 50,
        preferences: {
          sidebarCollapsed: false,
          sidebarPinned: false,
          showBreadcrumbs: true,
          showModuleIcons: true,
          theme: 'system',
        },

        // Computed selectors
        getCurrentPath: () => {
          const { activeModule, history } = get();
          const currentEntry = history.find(entry => entry.module === activeModule);
          return currentEntry?.path || `/${activeModule}`;
        },

        getPreviousModule: () => {
          const { history } = get();
          if (history.length < 2) return null;
          return history[history.length - 2].module;
        },

        canGoBack: () => {
          const { history } = get();
          return history.length > 1;
        },

        getModuleHistory: (module: string) => {
          const { history } = get();
          return history.filter((entry: NavigationHistory) => entry.module === module);
        },

        isSidebarCollapsed: () => {
          const { preferences } = get();
          return preferences.sidebarCollapsed;
        },

        // Actions
        setSidebarOpen: (open) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        setActiveModule: (module, path) => {
          set((state) => {
            state.activeModule = module;
          });
          
          // Add to history
          get().addToHistory(module, path);
        },


        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        // History management
        addToHistory: (module, path) => {
          set((state) => {
            const newEntry: NavigationHistory = {
              module,
              timestamp: Date.now(),
              path,
            };

            // Remove duplicate entries for the same module
            state.history = state.history.filter((entry: NavigationHistory) => entry.module !== module);
            
            // Add new entry
            state.history.push(newEntry);

            // Limit history size
            if (state.history.length > state.maxHistorySize) {
              state.history = state.history.slice(-state.maxHistorySize);
            }
          });
        },

        goBack: () => {
          const { history } = get();
          if (history.length < 2) return false;

          set((state) => {
            // Remove current entry
            state.history.pop();
            
            // Set previous module as active
            const previousEntry = state.history[state.history.length - 1];
            if (previousEntry) {
              state.activeModule = previousEntry.module;
            }
          });

          return true;
        },

        clearHistory: () => {
          set((state) => {
            state.history = [];
          });
        },

        removeFromHistory: (index) => {
          set((state) => {
            if (index >= 0 && index < state.history.length) {
              state.history.splice(index, 1);
            }
          });
        },

        // Preferences
        updatePreferences: (newPreferences) => {
          set((state) => {
            state.preferences = { ...state.preferences, ...newPreferences };
          });
        },

        resetPreferences: () => {
          set((state) => {
            state.preferences = {
              sidebarCollapsed: false,
              sidebarPinned: false,
              showBreadcrumbs: true,
              showModuleIcons: true,
              theme: 'system',
            };
          });
        },

        // Sidebar management
        toggleSidebarCollapse: () => {
          set((state) => {
            state.preferences.sidebarCollapsed = !state.preferences.sidebarCollapsed;
          });
        },

        toggleSidebarPin: () => {
          set((state) => {
            state.preferences.sidebarPinned = !state.preferences.sidebarPinned;
          });
        },

        setSidebarCollapsed: (collapsed) => {
          set((state) => {
            state.preferences.sidebarCollapsed = collapsed;
          });
        },

        setSidebarPinned: (pinned) => {
          set((state) => {
            state.preferences.sidebarPinned = pinned;
          });
        },
      })),
      {
        name: "enhanced-navigation-storage",
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          activeModule: state.activeModule,
          history: state.history.slice(-10), // Only persist last 10 entries
          preferences: state.preferences,
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            return {
              ...persistedState,
              history: [],
              preferences: {
                sidebarCollapsed: false,
                sidebarPinned: false,
                showBreadcrumbs: true,
                showModuleIcons: true,
                theme: 'system',
              },
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// Selectors for better performance
export const useNavigationSelectors = () => {
  const sidebarOpen = useNavigationStore((state) => state.sidebarOpen);
  const activeModule = useNavigationStore((state) => state.activeModule);
  const canGoBack = useNavigationStore((state) => state.canGoBack());
  const getCurrentPath = useNavigationStore((state) => state.getCurrentPath);
  const preferences = useNavigationStore((state) => state.preferences);

  return {
    sidebarOpen,
    activeModule,
    canGoBack,
    getCurrentPath,
    preferences,
  };
};

// History hooks
export const useNavigationHistory = () => {
  const history = useNavigationStore((state) => state.history);
  const addToHistory = useNavigationStore((state) => state.addToHistory);
  const goBack = useNavigationStore((state) => state.goBack);
  const clearHistory = useNavigationStore((state) => state.clearHistory);
  const getModuleHistory = useNavigationStore((state) => state.getModuleHistory);
  
  return {
    history,
    addToHistory,
    goBack,
    clearHistory,
    getModuleHistory,
  };
};

// Preferences hooks
export const useNavigationPreferences = () => {
  const preferences = useNavigationStore((state) => state.preferences);
  const updatePreferences = useNavigationStore((state) => state.updatePreferences);
  const resetPreferences = useNavigationStore((state) => state.resetPreferences);
  
  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
};