import React from 'react';

/**
 * Enhanced accessibility utilities for existing components
 */

// ARIA live region for announcements
export const createLiveRegion = (id: string = 'aria-live-announcer') => {
  if (typeof document === 'undefined') return;
  
  let liveRegion = document.getElementById(id);
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('id', id);
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }
  return liveRegion;
};

// Announce changes to screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = createLiveRegion();
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
};

// Enhanced focus management
export const focusElement = (element: HTMLElement | null) => {
  if (element) {
    element.focus();
    // Ensure the element is visible
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Get focusable elements within a container
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors));
};

// Enhanced keyboard navigation
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      options.onEnter?.();
      break;
    case ' ':
      event.preventDefault();
      options.onSpace?.();
      break;
    case 'Escape':
      options.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      options.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      options.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      options.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      options.onArrowRight?.();
      break;
    case 'Home':
      event.preventDefault();
      options.onHome?.();
      break;
    case 'End':
      event.preventDefault();
      options.onEnd?.();
      break;
  }
};

// Enhanced ARIA attributes
export const getAriaAttributes = (props: {
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) => {
  const attributes: Record<string, string | boolean> = {};
  
  if (props.label) attributes['aria-label'] = props.label;
  if (props.describedBy) attributes['aria-describedby'] = props.describedBy;
  if (props.expanded !== undefined) attributes['aria-expanded'] = props.expanded;
  if (props.selected !== undefined) attributes['aria-selected'] = props.selected;
  if (props.disabled !== undefined) attributes['aria-disabled'] = props.disabled;
  if (props.required !== undefined) attributes['aria-required'] = props.required;
  if (props.invalid !== undefined) attributes['aria-invalid'] = props.invalid;
  if (props.live) attributes['aria-live'] = props.live;
  if (props.atomic !== undefined) attributes['aria-atomic'] = props.atomic;
  
  return attributes;
};

// Screen reader only text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => 
  React.createElement('span', { className: 'sr-only' }, children);

// Enhanced loading states - now using the new Loading component
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}> = ({ size = 'md', label = 'Loading...' }) => {
  // Map old size to new size format
  const sizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };
  
  return React.createElement('div', 
    { 
      className: 'flex items-center justify-center', 
      role: 'status', 
      'aria-label': label 
    },
    React.createElement('div', {
      className: 'animate-spin rounded-full border-2 border-primary border-t-transparent',
      style: {
        width: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
        height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px'
      },
      'aria-hidden': 'true'
    }),
    React.createElement(ScreenReaderOnly, null, label)
  );
};

// Enhanced error states
export const ErrorMessage: React.FC<{
  error: string;
  id?: string;
  className?: string;
}> = ({ error, id, className = '' }) => 
  React.createElement('p', {
    id,
    className: `text-sm text-destructive ${className}`,
    role: 'alert',
    'aria-live': 'polite'
  }, error);

// Enhanced success states
export const SuccessMessage: React.FC<{
  message: string;
  id?: string;
  className?: string;
}> = ({ message, id, className = '' }) => 
  React.createElement('p', {
    id,
    className: `text-sm text-success-600 ${className}`,
    role: 'status',
    'aria-live': 'polite'
  }, message);

// Enhanced form validation
export const validateForm = (formData: FormData, rules: Record<string, (value: string) => string | null>) => {
  const errors: Record<string, string> = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    const value = formData.get(field) as string;
    const error = validator(value);
    if (error) {
      errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => (value: string) => 
    !value || value.trim() === '' ? message : null,
  
  email: (message = 'Please enter a valid email address') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : null;
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    const msg = message || `Must be at least ${min} characters`;
    return value && value.length < min ? msg : null;
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    const msg = message || `Must be no more than ${max} characters`;
    return value && value.length > max ? msg : null;
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) => 
    value && !regex.test(value) ? message : null,
};

// Enhanced color contrast utilities
export const getContrastColor = (backgroundColor: string): 'light' | 'dark' => {
  // Simple contrast calculation - in production, use a proper color library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'dark' : 'light';
};

// Enhanced focus trap for modals and dropdowns
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Enhanced skip links
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className = '' }) => 
  React.createElement('a', {
    href,
    className: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg ${className}`
  }, children);
