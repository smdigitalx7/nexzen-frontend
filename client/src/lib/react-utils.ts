import React from "react";

// Ensure React utilities are available
// Use direct references to avoid issues with code splitting
export const forwardRef = React.forwardRef;
export const createElement = React.createElement;
export const Fragment = React.Fragment;
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useMemo = React.useMemo;
export const useCallback = React.useCallback;
export const useRef = React.useRef;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const useLayoutEffect = React.useLayoutEffect;
export const useImperativeHandle = React.useImperativeHandle;
export const useDebugValue = React.useDebugValue;

// Ensure React is available globally (safely)
// Use a deferred assignment to avoid initialization issues
if (typeof window !== "undefined") {
  // Use requestIdleCallback or setTimeout to defer assignment
  // This ensures React is fully initialized before assignment
  const assignReact = () => {
    try {
      if (React && typeof React === "object" && typeof React.forwardRef === "function") {
        (window as any).React = React;
      }
    } catch (error) {
      // Silently fail if React is not fully initialized yet
      if (process.env.NODE_ENV === "development") {
        console.warn("React not available for global assignment:", error);
      }
    }
  };

  // Try immediate assignment, but defer if needed
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(assignReact, { timeout: 100 });
  } else {
    setTimeout(assignReact, 0);
  }
}
