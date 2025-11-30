import { Api } from '@/core/api';

export interface PaymentReceiptData {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  paymentMethod: string;
  status: string;
  timestamp: string;
  fees?: number;
  totalAmount?: number;
  studentName?: string;
  studentId?: string;
  classInfo?: string;
  academicYear?: string;
  branchName?: string;
}

export interface PaymentReceiptResponse {
  receiptId: string;
  downloadUrl: string;
  receiptData: PaymentReceiptData;
}

export interface PaymentReceiptListResponse {
  receipts: PaymentReceiptData[];
  total: number;
  page: number;
  pageSize: number;
}

export class PaymentReceiptsService {
  private static baseUrl = '/api/payment-receipts';

  /**
   * Generate and download a payment receipt
   */
  static generateReceipt(paymentData: PaymentReceiptData): Promise<PaymentReceiptResponse> {
    return Api.post<PaymentReceiptResponse>(`${this.baseUrl}/generate`, paymentData);
  }

  /**
   * Download receipt by ID
   */
  static downloadReceipt(receiptId: string): Promise<Blob> {
    return Api.get<Blob>(`${this.baseUrl}/${receiptId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Get receipt by transaction ID
   */
  static getReceiptByTransactionId(transactionId: string): Promise<PaymentReceiptData> {
    return Api.get<PaymentReceiptData>(`${this.baseUrl}/transaction/${transactionId}`);
  }

  /**
   * Get all receipts for a student
   */
  static getStudentReceipts(studentId: string, params?: {
    page?: number;
    pageSize?: number;
    academicYear?: string;
  }): Promise<PaymentReceiptListResponse> {
    const query = params ? Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | boolean | undefined | null> : undefined;
    return Api.get<PaymentReceiptListResponse>(`${this.baseUrl}/student/${studentId}`, query);
  }

  /**
   * Get all receipts with filters
   */
  static getReceipts(params?: {
    page?: number;
    pageSize?: number;
    studentId?: string;
    academicYear?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentReceiptListResponse> {
    const query = params ? Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | boolean | undefined | null> : undefined;
    return Api.get<PaymentReceiptListResponse>(this.baseUrl, query);
  }

  /**
   * Send receipt via email
   */
  static sendReceiptEmail(receiptId: string, email: string): Promise<{ success: boolean; message: string }> {
    return Api.post<{ success: boolean; message: string }>(`${this.baseUrl}/${receiptId}/send-email`, { email });
  }

  /**
   * Get receipt statistics
   */
  static getReceiptStats(params?: {
    academicYear?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalAmount: number;
    totalReceipts: number;
    paymentMethodBreakdown: Record<string, number>;
    monthlyBreakdown: Array<{ month: string; amount: number; count: number }>;
  }> {
    const query = params ? Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | boolean | undefined | null> : undefined;
    return Api.get<{
      totalAmount: number;
      totalReceipts: number;
      paymentMethodBreakdown: Record<string, number>;
      monthlyBreakdown: Array<{ month: string; amount: number; count: number }>;
    }>(`${this.baseUrl}/stats`, query);
  }
}
