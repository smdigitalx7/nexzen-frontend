import React, { useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/common/components/ui/alert-dialog';
import { Loader } from '@/common/components/ui/ProfessionalLoader';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  loadingText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  loadingText = 'Processing...',
  onConfirm,
  onCancel,
  disabled = false,
}) => {
  const originalOverflowRef = useRef<string>('');
  const isClosingRef = useRef(false);

  // ✅ CRITICAL FIX: Ensure body overflow is restored when dialog closes
  useEffect(() => {
    if (open) {
      // Store original overflow when dialog opens
      if (!originalOverflowRef.current) {
        originalOverflowRef.current = document.body.style.overflow || '';
      }
    } else {
      // ✅ CRITICAL: Restore body overflow IMMEDIATELY when dialog closes
      // This prevents UI freeze caused by locked body scroll
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = '';
      } else {
        // Fallback: clear any overflow restriction
        document.body.style.overflow = '';
      }
      
      // ✅ CRITICAL: Remove pointer-events blocking
      document.body.style.pointerEvents = '';
      
      // ✅ CRITICAL: Force remove aria-hidden from focused elements
      requestAnimationFrame(() => {
        const allElements = document.querySelectorAll('[aria-hidden="true"]');
        allElements.forEach((el) => {
          if (el.contains(document.activeElement)) {
            el.removeAttribute('aria-hidden');
          }
        });
        
        // Remove aria-hidden from root
        const root = document.getElementById('root');
        if (root && root.getAttribute('aria-hidden') === 'true') {
          root.removeAttribute('aria-hidden');
        }
        
        // Ensure body is fully unlocked
        document.body.style.overflow = originalOverflowRef.current || '';
        document.body.style.pointerEvents = '';
      });
      
      isClosingRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = '';
      } else {
        document.body.style.overflow = '';
      }
      document.body.style.pointerEvents = '';
    };
  }, [open]);

  // ✅ CRITICAL FIX: Additional safety net - restore on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
      } else {
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Restore on unmount
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
      } else {
        document.body.style.overflow = '';
      }
    };
  }, []);

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onConfirm && !isLoading && !isClosingRef.current) {
      isClosingRef.current = true;
      
      // ✅ CRITICAL: Force remove aria-hidden from all elements immediately
      const allElements = document.querySelectorAll('[aria-hidden="true"]');
      allElements.forEach((el) => {
        if (el.contains(document.activeElement)) {
          el.removeAttribute('aria-hidden');
        }
      });
      
      // ✅ CRITICAL: Restore body overflow immediately (synchronous)
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
      } else {
        document.body.style.overflow = '';
      }
      
      // ✅ CRITICAL: Remove pointer-events blocking
      document.body.style.pointerEvents = '';
      
      // ✅ CRITICAL: Use requestAnimationFrame to ensure DOM updates happen immediately
      requestAnimationFrame(() => {
        // Force remove aria-hidden from root if dialog is closing
        const root = document.getElementById('root');
        if (root && root.getAttribute('aria-hidden') === 'true') {
          root.removeAttribute('aria-hidden');
        }
        
        // Ensure body overflow is still restored
        if (originalOverflowRef.current) {
          document.body.style.overflow = originalOverflowRef.current;
        } else {
          document.body.style.overflow = '';
        }
      });
      
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // ✅ CRITICAL: Restore body overflow immediately
    if (originalOverflowRef.current) {
      document.body.style.overflow = originalOverflowRef.current;
    } else {
      document.body.style.overflow = '';
    }

    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isClosingRef.current) {
      isClosingRef.current = true;
      
      // ✅ CRITICAL: Force remove aria-hidden from all elements immediately
      const allElements = document.querySelectorAll('[aria-hidden="true"]');
      allElements.forEach((el) => {
        if (el.contains(document.activeElement)) {
          el.removeAttribute('aria-hidden');
        }
      });
      
      // ✅ CRITICAL: Restore body overflow immediately (synchronous)
      if (originalOverflowRef.current) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = '';
      } else {
        document.body.style.overflow = '';
      }
      
      // ✅ CRITICAL: Remove pointer-events blocking
      document.body.style.pointerEvents = '';
      
      // ✅ CRITICAL: Use requestAnimationFrame to ensure DOM updates happen immediately
      requestAnimationFrame(() => {
        // Force remove aria-hidden from root
        const root = document.getElementById('root');
        if (root && root.getAttribute('aria-hidden') === 'true') {
          root.removeAttribute('aria-hidden');
        }
        
        // Remove aria-hidden from any dialog containers
        const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
        dialogs.forEach((dialog) => {
          if (dialog.getAttribute('aria-hidden') === 'true') {
            dialog.removeAttribute('aria-hidden');
          }
        });
        
        // Ensure body overflow is still restored
        document.body.style.overflow = originalOverflowRef.current || '';
        document.body.style.pointerEvents = '';
      });
    }
    onOpenChange(newOpen);
  };

  // ✅ FIX: Handle ReactNode descriptions that contain block elements (divs)
  // AlertDialogDescription renders as <p> which cannot contain <div> elements
  // Radix UI requires AlertDialogDescription for accessibility, so we always render it
  const isStringDescription = typeof description === 'string';
  
  // Extract a simple text description for accessibility when description is a ReactNode
  const getAccessibilityDescription = (): string => {
    if (isStringDescription) {
      return description;
    }
    // For ReactNode descriptions, provide a generic accessible description
    // The full ReactNode will be shown visually below
    return 'Please review the details below before confirming.';
  };
  
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {/* ✅ FIX: Always include AlertDialogDescription for accessibility */}
          <AlertDialogDescription className={isStringDescription ? '' : 'sr-only'}>
            {getAccessibilityDescription()}
          </AlertDialogDescription>
          {/* Render the full ReactNode description separately for visual users when it's not a string */}
          {!isStringDescription && (
            <div className="text-sm text-muted-foreground mt-2">{description}</div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            asChild={false}
          >
            {isLoading && <span className="mr-2"><Loader.Button size="sm" /></span>}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
