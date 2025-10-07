import { useState, useCallback, useMemo, useRef } from 'react';

interface UseOptimizedStateProps<T> {
  initialValue: T;
  debounceMs?: number;
  deepCompare?: boolean;
}

interface UseOptimizedStateReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  resetState: () => void;
  hasChanged: boolean;
  previousState: T | null;
}

export const useOptimizedState = <T>({
  initialValue,
  debounceMs = 0,
  deepCompare = false,
}: UseOptimizedStateProps<T>): UseOptimizedStateReturn<T> => {
  const [state, setState] = useState<T>(initialValue);
  const [hasChanged, setHasChanged] = useState(false);
  const previousStateRef = useRef<T | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const deepEqual = useCallback((a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (let key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }, []);

  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    const updateState = (value: T) => {
      const isEqual = deepCompare ? deepEqual(state, value) : state === value;
      
      if (!isEqual) {
        previousStateRef.current = state;
        setState(value);
        setHasChanged(true);
      }
    };

    if (debounceMs > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        const value = typeof newState === 'function' 
          ? (newState as (prev: T) => T)(state) 
          : newState;
        updateState(value);
      }, debounceMs);
    } else {
      const value = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(state) 
        : newState;
      updateState(value);
    }
  }, [state, deepCompare, deepEqual, debounceMs]);

  const resetState = useCallback(() => {
    setState(initialValue);
    setHasChanged(false);
    previousStateRef.current = null;
  }, [initialValue]);

  const previousState = previousStateRef.current;

  return {
    state,
    setState: optimizedSetState,
    resetState,
    hasChanged,
    previousState,
  };
};
