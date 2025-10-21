import React from "react";

// Ensure React utilities are available
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

// Ensure React is available globally
if (typeof window !== "undefined") {
  (window as any).React = React;
  (window as any).React.forwardRef = forwardRef;
}
