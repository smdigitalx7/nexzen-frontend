import { useQuery } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";

export interface TuitionFeeBalanceListItem {
  balance_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name?: string;
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1_amount: number;
  term1_paid: number;
  term1_balance: number;
  term2_amount: number;
  term2_paid: number;
  term2_balance: number;
  term3_amount: number;
  term3_paid: number;
  term3_balance: number;
  term1_status: string;
  term2_status: string;
  term3_status: string;
}

export interface TransportFeeBalanceListItem {
  balance_id: number;
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name?: string;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1_amount: number;
  term1_paid: number;
  term1_balance: number;
  term2_amount: number;
  term2_paid: number;
  term2_balance: number;
  term1_status: string;
  term2_status: string;
  overall_balance_fee: number;
}

type PaginatedResponse<T> = {
  data?: T[];
  total_pages?: number;
  current_page: number;
  page_size?: number;
  total_count?: number;
};

export function useTuitionFeeBalances(params: { class_id?: number; section_id?: number; page?: number; page_size?: number }) {
  const { class_id, section_id, page, page_size } = params || {};
  return useQuery<PaginatedResponse<TuitionFeeBalanceListItem>>({
    queryKey: ["school", "tuition-fee-balances", { class_id, section_id, page, page_size }],
    enabled: !!class_id,
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const search = new URLSearchParams();
      if (class_id) search.append("class_id", String(class_id));
      if (section_id) search.append("section_id", String(section_id));
      if (page) search.append("page", String(page));
      if (page_size) search.append("page_size", String(page_size));
      const res = await api.get(`/school/tuition-fee-balances/?${search.toString()}`);
      return res.data as PaginatedResponse<TuitionFeeBalanceListItem>;
    },
    staleTime: 60_000,
  });
}

export function useTransportFeeBalances(params: { class_id?: number; section_id?: number; page?: number; page_size?: number }) {
  const { class_id, section_id, page, page_size } = params || {};
  return useQuery<PaginatedResponse<TransportFeeBalanceListItem>>({
    queryKey: ["school", "transport-fee-balances", { class_id, section_id, page, page_size }],
    enabled: !!class_id,
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const search = new URLSearchParams();
      if (class_id) search.append("class_id", String(class_id));
      if (section_id) search.append("section_id", String(section_id));
      if (page) search.append("page", String(page));
      if (page_size) search.append("page_size", String(page_size));
      const res = await api.get(`/school/transport-fee-balances/?${search.toString()}`);
      return res.data as PaginatedResponse<TransportFeeBalanceListItem>;
    },
    staleTime: 60_000,
  });
}

// Fetch single tuition fee balance by ID
export function useTuitionFeeBalance(balance_id?: number) {
  return useQuery<any>({
    queryKey: ["school", "tuition-fee-balances", balance_id],
    enabled: !!balance_id,
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get(`/school/tuition-fee-balances/${balance_id}`);
      return res.data as any;
    },
    staleTime: 60_000,
  });
}

export function useTransportFeeBalance(balance_id?: number) {
  return useQuery<any>({
    queryKey: ["school", "transport-fee-balances", balance_id],
    enabled: !!balance_id,
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get(`/school/transport-fee-balances/${balance_id}`);
      return res.data as any;
    },
    staleTime: 60_000,
  });
}

// Distance slabs (transport fee structures) - public API
export function useDistanceSlabs() {
  return useQuery<any[]>({
    queryKey: ["transport-fee-structures"],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get(`/transport-fee-structures/`);
      const data = Array.isArray(res.data) ? res.data : [];
      return data;
    },
    staleTime: 60_000,
  });
}


