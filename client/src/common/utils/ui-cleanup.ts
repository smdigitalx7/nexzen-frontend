/**
 * Common utility to clean up global UI state after dialog operations.
 * Resolves "aria-hidden" accessibility issues and UI freezes caused by dialog locks.
 * Use "!important" to override any lingering Radix UI inline styles.
 */
export const cleanupDialogState = () => {
    if (typeof document === 'undefined') return;

    // 1. Force remove aria-hidden from focused elements and roots immediately
    const allHidden = document.querySelectorAll('[aria-hidden="true"]');
    allHidden.forEach((el) => {
      // If it's a root or contains the focus, it shouldn't be hidden
      if (el.id === 'root' || el.contains(document.activeElement)) {
        el.removeAttribute('aria-hidden');
        el.removeAttribute('data-aria-hidden');
      }
    });

    // Also target elements specifically marked with data-aria-hidden (common in some libraries)
    const allDataHidden = document.querySelectorAll('[data-aria-hidden="true"]');
    allDataHidden.forEach((el) => {
      if (el.id === 'root' || el.contains(document.activeElement)) {
        el.removeAttribute('aria-hidden');
        el.removeAttribute('data-aria-hidden');
      }
    });
  
    // 2. Restore body styles locked by Radix UI/Dialogs
    // Use setProperty with "important" to ensure we override Radix's lock
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("pointer-events", "auto", "important");
    document.body.style.setProperty("padding-right", "0px", "important");
    document.body.removeAttribute('data-scroll-locked');
    document.body.removeAttribute('aria-hidden');
    document.body.removeAttribute('data-aria-hidden');
  
    // 3. Deeper cleanup in next frames to ensure Radix cleanup is overridden if it re-applies
    requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('aria-hidden');
        root.removeAttribute('data-aria-hidden');
        root.style.setProperty("pointer-events", "auto", "important");
      }
      
      // Remove from any other potential roots or overlays
      document.querySelectorAll('[data-radix-portal]').forEach(el => {
        el.removeAttribute('aria-hidden');
      });
      
      document.body.style.setProperty("overflow", "auto", "important");
      document.body.style.setProperty("pointer-events", "auto", "important");
    });
  };
  
