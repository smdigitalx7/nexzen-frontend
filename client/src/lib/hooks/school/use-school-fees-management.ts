import { useMemo } from "react";
import {
  useSchoolTuitionBalancesList,
  useSchoolTransportBalancesList,
} from "./use-school-fee-balances";
import {
  useSchoolIncomeList,
  useSchoolExpenditureList,
} from "./use-school-income-expenditure";
import { useTabNavigation } from "../use-tab-navigation";

export function useSchoolFeesManagement(params?: {
  tuitionPage?: number;
  tuitionPageSize?: number;
  transportPage?: number;
  transportPageSize?: number;
  income?: {
    start_date?: string;
    end_date?: string;
    admission_no?: string;
    purpose?: string;
  };
  expenditure?: { start_date?: string; end_date?: string };
}) {
  const { activeTab, setActiveTab } = useTabNavigation("collect");

  const tuitionQuery = useSchoolTuitionBalancesList({
    page: params?.tuitionPage,
    page_size: params?.tuitionPageSize,
  });
  const transportQuery = useSchoolTransportBalancesList({
    page: params?.transportPage,
    page_size: params?.transportPageSize,
  });
  const incomeQuery = useSchoolIncomeList(params?.income);
  const expenditureQuery = useSchoolExpenditureList(params?.expenditure);

  const tuitionBalances = tuitionQuery.data?.data ?? [];
  const transportBalances = transportQuery.data?.data ?? [];
  const incomes = incomeQuery.data ?? [];
  const expenditures = expenditureQuery.data ?? [];

  const totalOutstandingTuition = useMemo(() => {
    return tuitionBalances.reduce(
      (sum: number, b: any) =>
        sum +
        (Number(b.term1_balance || 0) +
          Number(b.term2_balance || 0) +
          Number(b.term3_balance || 0)),
      0
    );
  }, [tuitionBalances]);

  const totalOutstandingTransport = useMemo(() => {
    return transportBalances.reduce(
      (sum: number, b: any) =>
        sum + (Number(b.term1_balance || 0) + Number(b.term2_balance || 0)),
      0
    );
  }, [transportBalances]);

  const totalOutstanding = totalOutstandingTuition + totalOutstandingTransport;

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, r: any) => sum + Number(r.amount || 0), 0);
  }, [incomes]);

  const totalExpenditure = useMemo(() => {
    return expenditures.reduce((sum, r: any) => sum + Number(r.amount || 0), 0);
  }, [expenditures]);

  const collectionRate = useMemo(() => {
    const collected = totalIncome;
    const target = totalIncome + totalOutstanding;
    return target > 0 ? (collected / target) * 100 : 0;
  }, [totalIncome, totalOutstanding]);

  return {
    // lists
    tuitionBalances,
    transportBalances,
    incomes,
    expenditures,
    // totals
    totalOutstandingTuition,
    totalOutstandingTransport,
    totalOutstanding,
    totalIncome,
    totalExpenditure,
    collectionRate,
    // UI
    activeTab,
    setActiveTab,
    // loading/error flags
    loading:
      tuitionQuery.isLoading ||
      transportQuery.isLoading ||
      incomeQuery.isLoading ||
      expenditureQuery.isLoading,
    error:
      tuitionQuery.error ||
      transportQuery.error ||
      incomeQuery.error ||
      expenditureQuery.error,
  } as const;
}
