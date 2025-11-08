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

// Ensure React is available globally IMMEDIATELY
// This is critical for libraries like Radix UI that may load before React is fully initialized
// They need React to be available on window.React when their chunks execute
if (typeof window !== "undefined") {
  try {
    // Assign React immediately - this must happen synchronously
    // so that other chunks (like vendor-radix) can access it
    (window as any).React = React;
    
    // Also ensure React.forwardRef is available (some libraries check for this)
    if (React && typeof React === "object") {
      (window as any).React.forwardRef = React.forwardRef;
      (window as any).React.createElement = React.createElement;
      (window as any).React.Fragment = React.Fragment;
    }
  } catch (error) {
    // If assignment fails, log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to assign React to window:", error);
    }
  }
}
