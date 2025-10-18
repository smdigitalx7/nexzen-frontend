import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface UITheme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface UIPreferences {
  theme: UITheme;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  showTooltips: boolean;
  showNotifications: boolean;
  autoSave: boolean;
  confirmBeforeDelete: boolean;
}

interface UIState {
  // Global loading states
  loading: LoadingState;
  
  // Toast notifications
  toasts: Toast[];
  maxToasts: number;
  
  // Modal management
  modals: Modal[];
  
  // UI preferences
  preferences: UIPreferences;
  
  // Computed selectors
  isLoading: (key: string) => boolean;
  hasActiveModals: () => boolean;
  getActiveModal: () => Modal | null;
  getToastsByType: (type: Toast['type']) => Toast[];
  isDarkMode: () => boolean;
  
  // Loading management
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  
  // Toast management
  showToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  clearToastsByType: (type: Toast['type']) => void;
  
  // Modal management
  showModal: (modal: Omit<Modal, 'id'>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  updateModal: (id: string, updates: Partial<Modal>) => void;
  
  // Theme management
  setTheme: (theme: Partial<UITheme>) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  
  // Preferences management
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
  resetPreferences: () => void;
  
  // Utility functions
  generateId: () => string;
  isSystemDarkMode: () => boolean;
}

const DEFAULT_PREFERENCES: UIPreferences = {
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    fontSize: 'md',
    density: 'comfortable',
  },
  animations: true,
  reducedMotion: false,
  highContrast: false,
  showTooltips: true,
  showNotifications: true,
  autoSave: true,
  confirmBeforeDelete: true,
};

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        loading: {},
        toasts: [],
        maxToasts: 5,
        modals: [],
        preferences: DEFAULT_PREFERENCES,

        // Computed selectors
        isLoading: (key: string) => {
          const state = get();
          return state.loading[key] || false;
        },

        hasActiveModals: () => {
          const state = get();
          return state.modals.length > 0;
        },

        getActiveModal: () => {
          const state = get();
          return state.modals[state.modals.length - 1] || null;
        },

        getToastsByType: (type: Toast['type']) => {
          const state = get();
          return state.toasts.filter((toast: Toast) => toast.type === type);
        },

        isDarkMode: () => {
          const state = get();
          if (state.preferences.theme.mode === 'system') {
            return get().isSystemDarkMode();
          }
          return state.preferences.theme.mode === 'dark';
        },

        // Loading management
        setLoading: (key: string, loading: boolean) => {
          set((state: UIState) => {
            if (loading) {
              state.loading[key] = true;
            } else {
              delete state.loading[key];
            }
          });
        },

        clearLoading: (key: string) => {
          set((state: UIState) => {
            delete state.loading[key];
          });
        },

        clearAllLoading: () => {
          set((state: UIState) => {
            state.loading = {};
          });
        },

        // Toast management
        showToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => {
          const id = get().generateId();
          const newToast: Toast = {
            ...toast,
            id,
            timestamp: Date.now(),
            duration: toast.duration || 5000,
          };

          set((state) => {
            // Remove oldest toasts if we exceed max
            if (state.toasts.length >= state.maxToasts) {
              state.toasts = state.toasts.slice(-(state.maxToasts - 1));
            }
            
            state.toasts.push(newToast);
          });

          // Auto-hide toast after duration
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().hideToast(id);
            }, newToast.duration);
          }

          return id;
        },

        hideToast: (id: string) => {
          set((state: UIState) => {
            state.toasts = state.toasts.filter((toast: Toast) => toast.id !== id);
          });
        },

        clearToasts: () => {
          set((state: UIState) => {
            state.toasts = [];
          });
        },

        clearToastsByType: (type: Toast['type']) => {
          set((state: UIState) => {
            state.toasts = state.toasts.filter((toast: Toast) => toast.type !== type);
          });
        },

        // Modal management
        showModal: (modal: Omit<Modal, 'id'>) => {
          const id = get().generateId();
          const newModal: Modal = {
            ...modal,
            id,
            closable: modal.closable !== false,
            backdrop: modal.backdrop !== false,
          };

          set((state: UIState) => {
            state.modals.push(newModal);
          });

          return id;
        },

        hideModal: (id: string) => {
          set((state: UIState) => {
            state.modals = state.modals.filter((modal: Modal) => modal.id !== id);
          });
        },

        hideAllModals: () => {
          set((state: UIState) => {
            state.modals = [];
          });
        },

        updateModal: (id: string, updates: Partial<Modal>) => {
          set((state: UIState) => {
            const modalIndex = state.modals.findIndex((modal: Modal) => modal.id === id);
            if (modalIndex !== -1) {
              state.modals[modalIndex] = { ...state.modals[modalIndex], ...updates };
            }
          });
        },

        // Theme management
        setTheme: (theme: Partial<UITheme>) => {
          set((state: UIState) => {
            state.preferences.theme = { ...state.preferences.theme, ...theme };
          });
        },

        toggleTheme: () => {
          set((state: UIState) => {
            const currentMode = state.preferences.theme.mode;
            if (currentMode === 'light') {
              state.preferences.theme.mode = 'dark';
            } else if (currentMode === 'dark') {
              state.preferences.theme.mode = 'system';
            } else {
              state.preferences.theme.mode = 'light';
            }
          });
        },

        resetTheme: () => {
          set((state: UIState) => {
            state.preferences.theme = DEFAULT_PREFERENCES.theme;
          });
        },

        // Preferences management
        updatePreferences: (preferences: Partial<UIPreferences>) => {
          set((state: UIState) => {
            state.preferences = { ...state.preferences, ...preferences };
          });
        },

        resetPreferences: () => {
          set((state: UIState) => {
            state.preferences = DEFAULT_PREFERENCES;
          });
        },

        // Utility functions
        generateId: () => {
          return Math.random().toString(36).substr(2, 9);
        },

        isSystemDarkMode: () => {
          if (typeof window === 'undefined') return false;
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        },
      })),
      {
        name: "ui-storage",
        partialize: (state) => ({
          preferences: state.preferences,
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            return {
              ...persistedState,
              preferences: {
                ...DEFAULT_PREFERENCES,
                ...persistedState.preferences,
              },
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// Convenience hooks
export const useToast = () => {
  const showToast = useUIStore((state) => state.showToast);
  const hideToast = useUIStore((state) => state.hideToast);
  const clearToasts = useUIStore((state) => state.clearToasts);
  const toasts = useUIStore((state) => state.toasts);

  return {
    showToast,
    hideToast,
    clearToasts,
    toasts,
    success: (title: string, description?: string, options?: Partial<Toast>) =>
      showToast({ type: 'success', title, description, ...options }),
    error: (title: string, description?: string, options?: Partial<Toast>) =>
      showToast({ type: 'error', title, description, ...options }),
    warning: (title: string, description?: string, options?: Partial<Toast>) =>
      showToast({ type: 'warning', title, description, ...options }),
    info: (title: string, description?: string, options?: Partial<Toast>) =>
      showToast({ type: 'info', title, description, ...options }),
  };
};

export const useModal = () => {
  const showModal = useUIStore((state) => state.showModal);
  const hideModal = useUIStore((state) => state.hideModal);
  const hideAllModals = useUIStore((state) => state.hideAllModals);
  const updateModal = useUIStore((state) => state.updateModal);
  const modals = useUIStore((state) => state.modals);
  const hasActiveModals = useUIStore((state) => state.hasActiveModals());
  const getActiveModal = useUIStore((state) => state.getActiveModal());

  return {
    showModal,
    hideModal,
    hideAllModals,
    updateModal,
    modals,
    hasActiveModals,
    getActiveModal,
  };
};

export const useLoading = (key: string) => {
  const isLoading = useUIStore((state) => state.isLoading(key));
  const setLoading = useUIStore((state) => state.setLoading);
  const clearLoading = useUIStore((state) => state.clearLoading);

  return {
    isLoading,
    setLoading: (loading: boolean) => setLoading(key, loading),
    clearLoading: () => clearLoading(key),
  };
};

export const useTheme = () => {
  const theme = useUIStore((state) => state.preferences.theme);
  const isDarkMode = useUIStore((state) => state.isDarkMode());
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const resetTheme = useUIStore((state) => state.resetTheme);

  return {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
    resetTheme,
  };
};

export const useUIPreferences = () => {
  const preferences = useUIStore((state) => state.preferences);
  const updatePreferences = useUIStore((state) => state.updatePreferences);
  const resetPreferences = useUIStore((state) => state.resetPreferences);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
};
