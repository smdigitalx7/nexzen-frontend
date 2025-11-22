import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Loader } from '@/common/components/ui/ProfessionalLoader';

// Loading state types
export interface LoadingItem {
  id: string;
  message?: string;
  progress?: number;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'success' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
  fullScreen?: boolean;
  persistent?: boolean;
  timestamp: number;
}

export interface LoadingState {
  items: LoadingItem[];
  globalLoading: boolean;
  globalMessage?: string;
}

// Loading actions
type LoadingAction =
  | { type: 'ADD_LOADING'; payload: Omit<LoadingItem, 'timestamp'> }
  | { type: 'REMOVE_LOADING'; payload: string }
  | { type: 'UPDATE_LOADING'; payload: { id: string; updates: Partial<LoadingItem> } }
  | { type: 'CLEAR_ALL_LOADING' }
  | { type: 'SET_GLOBAL_LOADING'; payload: { loading: boolean; message?: string } }
  | { type: 'CLEAR_OLD_LOADING'; payload: number }; // Clear items older than timestamp

// Loading reducer
const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'ADD_LOADING':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            timestamp: Date.now()
          }
        ]
      };

    case 'REMOVE_LOADING':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_LOADING':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case 'CLEAR_ALL_LOADING':
      return {
        ...state,
        items: []
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload.loading,
        globalMessage: action.payload.message
      };

    case 'CLEAR_OLD_LOADING':
      return {
        ...state,
        items: state.items.filter(item => item.timestamp > action.payload)
      };

    default:
      return state;
  }
};

// Loading context
interface LoadingContextType {
  state: LoadingState;
  addLoading: (item: Omit<LoadingItem, 'timestamp'>) => string;
  removeLoading: (id: string) => void;
  updateLoading: (id: string, updates: Partial<LoadingItem>) => void;
  clearAllLoading: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  clearOldLoading: (olderThanMs?: number) => void;
  isLoading: (id?: string) => boolean;
  getLoadingItem: (id: string) => LoadingItem | undefined;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Loading provider
interface LoadingProviderProps {
  children: ReactNode;
  maxItems?: number;
  autoCleanupMs?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  maxItems = 10,
  autoCleanupMs = 30000 // 30 seconds
}) => {
  const [state, dispatch] = useReducer(loadingReducer, {
    items: [],
    globalLoading: false
  });

  const addLoading = useCallback((item: Omit<LoadingItem, 'timestamp'>): string => {
    const id = item.id || `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Remove oldest items if we exceed maxItems
    if (state.items.length >= maxItems) {
      const sortedItems = [...state.items].sort((a, b) => a.timestamp - b.timestamp);
      const itemsToRemove = sortedItems.slice(0, state.items.length - maxItems + 1);
      itemsToRemove.forEach(item => {
        dispatch({ type: 'REMOVE_LOADING', payload: item.id });
      });
    }

    dispatch({ type: 'ADD_LOADING', payload: { ...item, id } });
    return id;
  }, [state.items.length, maxItems]);

  const removeLoading = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_LOADING', payload: id });
  }, []);

  const updateLoading = useCallback((id: string, updates: Partial<LoadingItem>) => {
    dispatch({ type: 'UPDATE_LOADING', payload: { id, updates } });
  }, []);

  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: { loading, message } });
  }, []);

  const clearOldLoading = useCallback((olderThanMs: number = autoCleanupMs) => {
    const cutoffTime = Date.now() - olderThanMs;
    dispatch({ type: 'CLEAR_OLD_LOADING', payload: cutoffTime });
  }, [autoCleanupMs]);

  const isLoading = useCallback((id?: string) => {
    if (id) {
      return state.items.some(item => item.id === id);
    }
    return state.items.length > 0 || state.globalLoading;
  }, [state.items, state.globalLoading]);

  const getLoadingItem = useCallback((id: string) => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  // Auto-cleanup old loading items
  React.useEffect(() => {
    const interval = setInterval(() => {
      clearOldLoading();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [clearOldLoading]);

  const contextValue: LoadingContextType = {
    state,
    addLoading,
    removeLoading,
    updateLoading,
    clearAllLoading,
    setGlobalLoading,
    clearOldLoading,
    isLoading,
    getLoadingItem
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <LoadingOverlay />
    </LoadingContext.Provider>
  );
};

// Loading overlay component
const LoadingOverlay: React.FC = () => {
  const { state } = useLoading();

  if (!state.globalLoading && state.items.length === 0) {
    return null;
  }

  // Priority: Global loading > most recent fullScreen item > most recent overlay item
  // Only show ONE loader at a time to prevent duplicates
  if (state.globalLoading) {
    return <Loader.Page message={state.globalMessage} />;
  }

  // Find the most recent fullScreen item
  const fullScreenItems = state.items.filter(item => item.fullScreen);
  if (fullScreenItems.length > 0) {
    // Get the most recent one (highest timestamp)
    const mostRecent = fullScreenItems.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    return <Loader.Page message={mostRecent.message} />;
  }

  // Find the most recent overlay item
  const overlayItems = state.items.filter(item => item.overlay);
  if (overlayItems.length > 0) {
    // Get the most recent one (highest timestamp)
    const mostRecent = overlayItems.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    return <Loader.Data message={mostRecent.message} />;
  }

  return null;
};

// Hook to use loading context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Convenience hooks
export const useGlobalLoading = () => {
  const { setGlobalLoading, state } = useLoading();
  
  return {
    isLoading: state.globalLoading,
    message: state.globalMessage,
    setLoading: setGlobalLoading
  };
};

export const useLoadingItem = (id: string) => {
  const { getLoadingItem, updateLoading, removeLoading, isLoading } = useLoading();
  
  return {
    item: getLoadingItem(id),
    isLoading: isLoading(id),
    update: (updates: Partial<LoadingItem>) => updateLoading(id, updates),
    remove: () => removeLoading(id)
  };
};

export default LoadingProvider;
