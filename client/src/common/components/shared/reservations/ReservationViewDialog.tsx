import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

interface ReservationViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  isLoading?: boolean;
  loadingText?: string;
}

export const ReservationViewDialog: React.FC<ReservationViewDialogProps> = ({
  isOpen,
  onClose,
  title = "Reservation Details",
  description = "Reservation information",
  children,
  maxWidth = "4xl",
  isLoading = false,
  loadingText = "Loading reservation details...",
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
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
          aria-label="Reservation details"
          tabIndex={-1}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader.Data message={loadingText} />
            </div>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

