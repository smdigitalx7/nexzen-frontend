import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

interface ReservationEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => Promise<void> | void;
  isSaving?: boolean;
  saveText?: string;
  closeText?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  disabled?: boolean;
}

export const ReservationEditDialog: React.FC<ReservationEditDialogProps> = ({
  isOpen,
  onClose,
  title = "Edit Reservation",
  description = "Update reservation information",
  children,
  onSave,
  isSaving = false,
  saveText = "Update Reservation",
  closeText = "Close",
  maxWidth = "4xl",
  disabled = false,
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      // Error handling is done by the caller
      console.error("Failed to save reservation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col p-0`}
        onOpenAutoFocus={(e) => {
          // Prevent auto-focus to avoid aria-hidden conflicts
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4"
          role="main"
          aria-label="Edit reservation form"
          tabIndex={-1}
        >
          {children}
        </div>
        <DialogFooter className="px-6 py-4 flex-shrink-0 bg-background border-t border-gray-200 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {closeText}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabled || isSaving}
          >
            {isSaving ? "Saving..." : saveText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

