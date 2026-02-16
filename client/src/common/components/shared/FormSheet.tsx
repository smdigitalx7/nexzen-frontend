import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/common/components/ui/sheet';
import { Button } from '@/common/components/ui/button';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { cn } from '@/common/utils';

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'default' | 'large' | 'xl';
  isLoading?: boolean;
  showFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  saveVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  side?: 'right' | 'left';
}

const SHEET_SIZES = {
  default: 'sm:max-w-md',
  large: 'sm:max-w-xl',
  xl: 'sm:max-w-3xl',
};

export const FormSheet: React.FC<FormSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'default',
  isLoading = false,
  showFooter = true,
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  showCancelButton = true,
  saveVariant = 'default',
  disabled = false,
  side = 'right',
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side}
        className={cn(SHEET_SIZES[size], "flex flex-col h-full p-0")}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6 py-6 border-b border-gray-100 bg-slate-50/50">
          <SheetTitle className="text-xl font-bold text-slate-900">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-slate-500 mt-1">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {children}
        </div>
        
        {showFooter && (
          <SheetFooter className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex-shrink-0 flex items-center justify-end gap-3 sm:space-x-0">
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {cancelText}
              </Button>
            )}
            {onSave && (
              <Button
                type="button"
                variant={saveVariant}
                onClick={onSave}
                disabled={disabled || isLoading}
                className="flex-1 sm:flex-none min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader.Button size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  saveText
                )}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
