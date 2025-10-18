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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  
  // Status update functionality
  showStatusUpdate?: boolean;
  currentStatus?: string;
  newStatus?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: Array<{ value: string; label: string; color?: string }>;
  getStatusColor?: (status: string) => string;
  statusUpdateText?: string;
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
  
  // Status update functionality
  showStatusUpdate = false,
  currentStatus,
  newStatus,
  onStatusChange,
  statusOptions = [
    { value: 'ACTIVE', label: 'ACTIVE', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'INACTIVE', label: 'INACTIVE', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'ON_LEAVE', label: 'ON_LEAVE', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ],
  getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  },
  statusUpdateText = 'Update Status',
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
          
          {/* Status Update Section */}
          {showStatusUpdate && currentStatus && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Status Update</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Status</label>
                  <p className="text-lg font-semibold">
                    <Badge className={getStatusColor(currentStatus)}>
                      {currentStatus}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">New Status</label>
                  <Select value={newStatus || currentStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
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
                disabled={disabled || isLoading || (showStatusUpdate && newStatus === currentStatus)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {showStatusUpdate ? statusUpdateText : saveText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
