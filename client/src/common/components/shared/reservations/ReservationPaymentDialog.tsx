import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

interface ReservationPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservationNo?: string | number;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export const ReservationPaymentDialog: React.FC<
  ReservationPaymentDialogProps
> = ({
  isOpen,
  onClose,
  reservationNo,
  children,
  maxWidth = "3xl",
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
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
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {reservationNo
              ? `Process payment for reservation ${reservationNo}`
              : "Process payment for reservation"}
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4"
          role="main"
          aria-label="Payment processing form"
          tabIndex={-1}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

