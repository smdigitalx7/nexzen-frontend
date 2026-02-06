"use client";

import React, { useMemo, memo, useState, useEffect, useCallback } from "react";
import { CreditCard, Percent, Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { useCanDelete } from "@/core/permissions";
import type { ReservationStatusEnum } from "@/features/college/types/reservations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import CollegeReservationPaymentProcessor from "@/common/components/shared/payment/CollegeReservationPaymentProcessor";
import { ReservationPaymentData } from "@/common/components/shared/payment";
import { ReceiptPreviewModal } from "@/common/components/shared";
import type { CollegeIncomeRead } from "@/features/college/types/income";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { toast } from "@/common/hooks/use-toast";
import { CollegeReservationsService } from "@/features/college/services";
import { invalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

// Helper function to format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

export type ReservationForAllReservations = {
  reservation_id: number;
  reservation_no?: string | null;
  reservation_date?: string | null;
  student_name: string;
  aadhar_no?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  dob?: string | null;
  father_name?: string | null;
  father_mobile?: string | null;
  group_id: number;
  course_id: number;
  group_name?: string | null;
  course_name?: string | null;
  status: ReservationStatusEnum;
  created_at: string;
  remarks?: string | null;
  income_id?: number;
  application_income_id?: number | null;
  concession_lock?: boolean;
  tuition_fee?: number;
  transport_fee?: number;
  book_fee?: number;
  application_fee?: number;
  tuition_concession?: number;
  transport_concession?: number;
};

interface AllReservationsComponentProps {
  reservations: ReservationForAllReservations[];
  onView: (reservation: ReservationForAllReservations) => void;
  onEdit: (reservation: ReservationForAllReservations) => void;
  onDelete: (reservation: ReservationForAllReservations) => void;
  onUpdateConcession?: (reservation: ReservationForAllReservations) => void;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetch: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  enableServerSidePagination?: boolean;
}

const AllReservationsComponent: React.FC<AllReservationsComponentProps> = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
  isLoading,
  onRefetch,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  enableServerSidePagination = false,
}) => {
  const { user } = useAuthStore();
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isLoadingPaymentData, setIsLoadingPaymentData] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    return () => {
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
    };
  }, [receiptBlobUrl]);

  const canViewConcession = useMemo(() => {
    if (!user?.role) return false;
    return user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN;
  }, [user?.role]);

  const isApplicationFeePaid = useCallback((row: ReservationForAllReservations): boolean => {
    const aid = row.application_income_id;
    return aid !== null && aid !== undefined && aid !== 0 && (typeof aid === 'number' && aid > 0);
  }, []);

  const handlePayFee = useCallback(async (reservation: ReservationForAllReservations) => {
    try {
      setIsLoadingPaymentData(true);
      const resNo = reservation.reservation_no?.trim() || String(reservation.reservation_id);
      
      const fullData = await CollegeReservationsService.getById(reservation.reservation_id);
      const appFee = fullData.application_fee;
      
      if (appFee === null || appFee === undefined) {
        toast({
          title: "Error",
          description: "Application fee not set.",
          variant: "destructive",
        });
        return;
      }

      const pData: ReservationPaymentData = {
        reservationId: reservation.reservation_id,
        reservationNo: resNo,
        studentName: reservation.student_name,
        className: reservation.group_name 
          ? `${reservation.group_name}${reservation.course_name ? ` - ${reservation.course_name}` : ""}` 
          : "N/A",
        reservationFee: Number(appFee),
        totalAmount: Number(appFee),
        paymentMethod: "CASH",
        purpose: "APPLICATION_FEE",
        note: `Payment for reservation ${resNo}`,
      };

      setPaymentData(pData);
      setShowPaymentProcessor(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPaymentData(false);
    }
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: "reservation_no",
      header: "Reservation No",
      cell: ({ row }: { row: { original: ReservationForAllReservations } }) => row.original.reservation_no || "N/A",
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
    },
    {
      accessorKey: "group_course",
      header: "Group/Course",
      cell: ({ row }: { row: { original: ReservationForAllReservations } }) => {
        const r = row.original;
        return r.group_name ? `${r.group_name}${r.course_name ? ` - ${r.course_name}` : ""}` : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: ReservationForAllReservations } }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === "PENDING" ? "default" :
              s === "CANCELLED" ? "destructive" :
              s === "CONFIRMED" ? "secondary" : "outline"
            }
            className={s === "CONFIRMED" ? "bg-green-500 text-white" : ""}
          >
            {s}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reservation_date",
      header: "Date",
      cell: ({ row }: { row: { original: ReservationForAllReservations } }) => formatDate(row.original.reservation_date),
    },
    {
      accessorKey: "application_income_id",
      header: "Fee Status",
      cell: ({ row }: { row: { original: ReservationForAllReservations } }) => {
        const paid = isApplicationFeePaid(row.original);
        return (
          <Badge variant={paid ? "secondary" : "destructive"}>
            {paid ? "Paid" : "Not Paid"}
          </Badge>
        );
      },
    },
  ], [isApplicationFeePaid]);

  const canDeleteReservation = useCanDelete("reservations");

  const actions: ActionConfig<ReservationForAllReservations>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: onView,
      show: (row: ReservationForAllReservations) => isApplicationFeePaid(row),
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: onEdit,
      show: (row: ReservationForAllReservations) => isApplicationFeePaid(row),
    },
    {
      id: "pay-fee",
      label: "Pay Fee",
      icon: CreditCard,
      onClick: handlePayFee,
      show: (row: ReservationForAllReservations) => !isApplicationFeePaid(row),
    },
    {
      id: "concession",
      label: "Concession",
      icon: Percent,
      onClick: (row: ReservationForAllReservations) =>
        onUpdateConcession?.(row),
      show: (row: ReservationForAllReservations) => Boolean(canViewConcession && !row.concession_lock && row.status === "PENDING"),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: onDelete,
      show: (row: ReservationForAllReservations) => canDeleteReservation && (isApplicationFeePaid(row) || row.status === "PENDING"),
    },
  ], [onView, onEdit, onDelete, onUpdateConcession, handlePayFee, isApplicationFeePaid, canViewConcession, canDeleteReservation]);

  const statusFilterOptions = useMemo(() => [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "CANCELLED", label: "Cancelled" },
  ], []);

  const toolbarLeftContent = useMemo(() => (
    <div className="w-[180px]">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {statusFilterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ), [statusFilter, onStatusFilterChange, statusFilterOptions]);

  return (
    <>
      <div className="w-full mt-6">
        <DataTable
          key={`all-reservations-${refreshKey}`}
          data={reservations}
          columns={columns}
          actions={actions}
          loading={isLoading || isLoadingPaymentData}
          // Toolbar configuration
          toolbarLeftContent={toolbarLeftContent}
          showSearch={true}
          searchPlaceholder="Search students..."
          searchKey="student_name"
          // Pagination configuration
          pagination={enableServerSidePagination ? "server" : "client"}
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          // Export configuration
          export={{ enabled: true, filename: "all_college_reservations" }}
        />
      </div>

      <Dialog open={showPaymentProcessor} onOpenChange={setShowPaymentProcessor}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 text-gray-900 border-none shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                  Pay Application Fee
                </DialogTitle>
                <DialogDescription className="text-gray-500 mt-1.5 font-medium">
                  Process application fee payment for reservation <span className="text-blue-600 font-semibold">{paymentData?.reservationNo}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 bg-gray-50/30">
            {paymentData && (
              <CollegeReservationPaymentProcessor
                reservationData={paymentData}
                onPaymentComplete={(incRec: CollegeIncomeRead, blobUrl: string) => {
                  setShowPaymentProcessor(false);
                  setReceiptBlobUrl(blobUrl);
                  setTimeout(() => {
                    invalidateAndRefetch(collegeKeys.reservations.root());
                    if (onRefetch) onRefetch();
                    setRefreshKey(p => p + 1);
                    setTimeout(() => setShowReceipt(true), 250);
                    toast({ title: "Payment Successful", variant: "success" });
                  }, 0);
                }}
                onPaymentFailed={(err) => {
                  toast({ title: "Payment Failed", description: err, variant: "destructive" });
                  setShowPaymentProcessor(false);
                }}
                onPaymentCancel={() => {
                  setShowPaymentProcessor(false);
                  setPaymentData(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReceiptPreviewModal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
          setReceiptBlobUrl(null);
          setRefreshKey(p => p + 1);
          setPaymentData(null);
          invalidateAndRefetch(collegeKeys.reservations.root());
          if (onRefetch) onRefetch();
        }}
        blobUrl={receiptBlobUrl}
      />
    </>
  );
};

export default memo(AllReservationsComponent);
