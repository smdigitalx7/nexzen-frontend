import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";

export interface IncomeItem {
  income_id: number;
  enrollment_id?: number;
  reservation_id?: number;
  admission_no?: string;
  roll_number?: string;
  student_name?: string;
  purpose: string;
  amount: number;
  income_date: string; // Backend sends as date, but we'll handle as string
  term_number?: number;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface ExpenditureItem {
  expenditure_id: number;
  expenditure_purpose: string;
  bill_date: string; // Backend sends as date, but we'll handle as string
  amount: number;
  remarks?: string;
  payment_method?: string;
  payment_date?: string; // Backend sends as date, but we'll handle as string
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

// Create/Update interfaces
export interface IncomeCreate {
  enrollment_id?: number;
  purpose: string;
  amount: number;
  income_date: string;
  term_number?: number;
  description?: string;
}

export interface IncomeUpdate {
  purpose?: string;
  amount?: number;
  income_date?: string;
  term_number?: number;
  description?: string;
}

export interface ExpenditureCreate {
  expenditure_purpose: string;
  bill_date: string;
  amount: number;
  remarks?: string;
  payment_method?: string;
  payment_date?: string;
}

export interface ExpenditureUpdate {
  expenditure_purpose?: string;
  bill_date?: string;
  amount?: number;
  remarks?: string;
  payment_method?: string;
  payment_date?: string;
}

export function useIncome(params?: {
  admission_no?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery<IncomeItem[]>({
    queryKey: ["school", "income", params],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const search = new URLSearchParams();
      if (params?.admission_no) search.append("admission_no", params.admission_no);
      if (params?.purpose) search.append("purpose", params.purpose);
      if (params?.start_date) search.append("start_date", params.start_date);
      if (params?.end_date) search.append("end_date", params.end_date);
      
      const res = await api.get(`/school/income/?${search.toString()}`);
      return res.data as IncomeItem[];
    },
    staleTime: 60_000,
  });
}

export function useExpenditure(params?: {
  start_date?: string;
  end_date?: string;
}) {
  return useQuery<ExpenditureItem[]>({
    queryKey: ["school", "expenditure", params],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const search = new URLSearchParams();
      if (params?.start_date) search.append("start_date", params.start_date);
      if (params?.end_date) search.append("end_date", params.end_date);
      
      const res = await api.get(`/school/expenditure/?${search.toString()}`);
      return res.data as ExpenditureItem[];
    },
    staleTime: 60_000,
  });
}

// Income CRUD operations
export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IncomeCreate) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.post("/school/income/by-admission/", data);
      return res.data as IncomeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "income"] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IncomeUpdate }) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.put(`/school/income/${id}`, data);
      return res.data as IncomeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "income"] });
    },
  });
}

export function useGetIncomeById(id: number) {
  return useQuery<IncomeItem>({
    queryKey: ["school", "income", id],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get(`/school/income/${id}`);
      return res.data as IncomeItem;
    },
    enabled: !!id,
  });
}

// Expenditure CRUD operations
export function useCreateExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExpenditureCreate) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.post("/school/expenditure/", data);
      return res.data as ExpenditureItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "expenditure"] });
    },
  });
}

export function useUpdateExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExpenditureUpdate }) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.put(`/school/expenditure/${id}`, data);
      return res.data as ExpenditureItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "expenditure"] });
    },
  });
}

export function useDeleteExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const api = ServiceLocator.getApiClient();
      await api.delete(`/school/expenditure/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "expenditure"] });
    },
  });
}

export function useGetExpenditureById(id: number) {
  return useQuery<ExpenditureItem>({
    queryKey: ["school", "expenditure", id],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get(`/school/expenditure/${id}`);
      return res.data as ExpenditureItem;
    },
    enabled: !!id,
  });
}
