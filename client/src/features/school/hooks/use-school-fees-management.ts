import { useMemo } from "react";
import {
  useSchoolTuitionBalancesList,
  useSchoolTransportBalancesList,
} from "./use-school-fee-balances";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";

// ✅ OPTIMIZATION: Removed income/expenditure APIs from Fees Management
// Income and Expenditure APIs should only be called in Financial Reports module
export function useSchoolFeesManagement(params?: {
  tuitionPage?: number;
  tuitionPageSize?: number;
  transportPage?: number;
  transportPageSize?: number;
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

  const tuitionBalances = tuitionQuery.data?.data ?? [];
  const transportBalances = transportQuery.data?.data ?? [];

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

  return {
    // lists
    tuitionBalances,
    transportBalances,
    // totals
    totalOutstandingTuition,
    totalOutstandingTransport,
    totalOutstanding,
    // UI
    activeTab,
    setActiveTab,
    // loading/error flags
    loading:
      tuitionQuery.isLoading ||
      transportQuery.isLoading,
    error:
      tuitionQuery.error ||
      transportQuery.error,
  } as const;
}
