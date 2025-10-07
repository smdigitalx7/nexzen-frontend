import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DIALOG_SIZES } from '@/lib/constants/ui';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: keyof typeof DIALOG_SIZES;
  isLoading?: boolean;
  showFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  saveVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  errors?: Record<string, string>;
  showErrors?: boolean;
  validateOnChange?: boolean;
  onValidate?: () => boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'MEDIUM',
  isLoading = false,
  showFooter = true,
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  saveVariant = 'default',
  disabled = false,
  errors = {},
  showErrors = true,
  validateOnChange = false,
  onValidate,
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
          
          {/* Error Display */}
          {showErrors && Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <strong>Please fix the following errors:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {showFooter && (
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            {onSave && (
              <Button
                type="button"
                variant={saveVariant}
                onClick={onSave}
                disabled={disabled || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saveText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
