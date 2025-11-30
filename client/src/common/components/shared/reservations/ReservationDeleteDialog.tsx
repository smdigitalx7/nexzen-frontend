import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";

interface ReservationDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId?: number | string | null;
  reservationNo?: string | null;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

export const ReservationDeleteDialog: React.FC<ReservationDeleteDialogProps> = ({
  isOpen,
  onClose,
  reservationId,
  reservationNo,
  onConfirm,
  isDeleting = false,
  title = "Delete Reservation",
  description,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done by the caller
      console.error("Failed to delete reservation:", error);
    }
  };

  const defaultDescription = `Are you sure you want to delete reservation ${
    reservationNo || reservationId || ""
  }? This action cannot be undone.`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


