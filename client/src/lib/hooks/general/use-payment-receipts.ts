import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentReceiptsService, PaymentReceiptData, PaymentReceiptResponse, PaymentReceiptListResponse } from "@/lib/services/general/payment-receipts.service";

// Query keys for payment receipts
export const paymentReceiptKeys = {
  all: ['payment-receipts'] as const,
  lists: () => [...paymentReceiptKeys.all, 'list'] as const,
  list: (params?: any) => [...paymentReceiptKeys.lists(), params] as const,
  details: () => [...paymentReceiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentReceiptKeys.details(), id] as const,
  byTransaction: (transactionId: string) => [...paymentReceiptKeys.all, 'transaction', transactionId] as const,
  studentReceipts: (studentId: string, params?: any) => [...paymentReceiptKeys.all, 'student', studentId, params] as const,
  stats: (params?: any) => [...paymentReceiptKeys.all, 'stats', params] as const,
};

/**
 * Generate a payment receipt
 */
export function useGeneratePaymentReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentData: PaymentReceiptData) =>
      PaymentReceiptsService.generateReceipt(paymentData) as Promise<PaymentReceiptResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentReceiptKeys.all });
    },
  });
}

/**
 * Download a payment receipt
 */
export function useDownloadPaymentReceipt() {
  return useMutation({
    mutationFn: (receiptId: string) => PaymentReceiptsService.downloadReceipt(receiptId),
  });
}

/**
 * Get receipt by transaction ID
 */
export function usePaymentReceiptByTransactionId(transactionId: string | null | undefined) {
  return useQuery({
    queryKey: transactionId ? paymentReceiptKeys.byTransaction(transactionId) : [...paymentReceiptKeys.all, 'transaction', 'nil'],
    queryFn: () => PaymentReceiptsService.getReceiptByTransactionId(transactionId as string) as Promise<PaymentReceiptData>,
    enabled: typeof transactionId === "string" && transactionId.length > 0,
  });
}

/**
 * Get all payment receipts with filters
 */
export function usePaymentReceipts(params?: {
  page?: number;
  pageSize?: number;
  studentId?: string;
  academicYear?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: paymentReceiptKeys.list(params),
    queryFn: () => PaymentReceiptsService.getReceipts(params) as Promise<PaymentReceiptListResponse>,
  });
}

/**
 * Get receipts for a specific student
 */
export function useStudentPaymentReceipts(studentId: string | null | undefined, params?: {
  page?: number;
  pageSize?: number;
  academicYear?: string;
}) {
  return useQuery({
    queryKey: studentId ? paymentReceiptKeys.studentReceipts(studentId, params) : [...paymentReceiptKeys.all, 'student', 'nil'],
    queryFn: () => PaymentReceiptsService.getStudentReceipts(studentId as string, params) as Promise<PaymentReceiptListResponse>,
    enabled: typeof studentId === "string" && studentId.length > 0,
  });
}

/**
 * Send receipt via email
 */
export function useSendReceiptEmail() {
  return useMutation({
    mutationFn: ({ receiptId, email }: { receiptId: string; email: string }) =>
      PaymentReceiptsService.sendReceiptEmail(receiptId, email),
  });
}

/**
 * Get payment receipt statistics
 */
export function usePaymentReceiptStats(params?: {
  academicYear?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: paymentReceiptKeys.stats(params),
    queryFn: () => PaymentReceiptsService.getReceiptStats(params),
  });
}
