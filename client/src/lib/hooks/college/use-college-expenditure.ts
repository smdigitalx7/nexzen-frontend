import { useQuery } from "@tanstack/react-query";
import { CollegeExpenditureService } from "@/lib/services/college/expenditure.service";
import type { CollegeExpenditureRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeExpenditureList(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: collegeKeys.expenditure.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeExpenditureService.list(params) as Promise<CollegeExpenditureRead[]>,
  });
}

export function useCollegeExpenditure(expenditureId: number | null | undefined) {
  return useQuery({
    queryKey: typeof expenditureId === "number" ? collegeKeys.expenditure.detail(expenditureId) : [...collegeKeys.expenditure.root(), "detail", "nil"],
    queryFn: () => CollegeExpenditureService.getById(expenditureId as number) as Promise<CollegeExpenditureRead>,
    enabled: typeof expenditureId === "number" && expenditureId > 0,
  });
}


