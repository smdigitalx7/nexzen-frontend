import { useMemo, useState } from "react";
import { useCollegeTuitionBalancesList } from "./use-college-tuition-balances";
import { useCollegeTransportBalancesList } from "./use-college-transport-balances";

export function useCollegeFeesManagement() {
  const [activeTab, setActiveTab] = useState("collect");
  
  // Get tuition balances - you may need to pass specific class_id and group_id
  const { 
    data: tuitionBalancesData, 
    isLoading: isLoadingTuition,
    error: tuitionError 
  } = useCollegeTuitionBalancesList({
    page: 1,
    pageSize: 100,
    // Add class_id and group_id as needed
    // class_id: 1,
    // group_id: 1,
  });

  // Get transport balances
  const { 
    data: transportBalancesData, 
    isLoading: isLoadingTransport,
    error: transportError 
  } = useCollegeTransportBalancesList({
    page: 1,
    pageSize: 100,
  });

  // Extract tuition balances
  const tuitionBalances = tuitionBalancesData?.data || [];
  const transportBalances = transportBalancesData?.data || [];

  // Calculate fee statistics
  const totalOutstanding = useMemo(() => {
    const tuitionOutstanding = tuitionBalances.reduce((sum, balance) => {
      return sum + (balance.overall_balance_fee || 0);
    }, 0);
    
    const transportOutstanding = transportBalances.reduce((sum, balance) => {
      return sum + (balance.overall_balance_fee || 0);
    }, 0);
    
    return tuitionOutstanding + transportOutstanding;
  }, [tuitionBalances, transportBalances]);

  const totalIncome = useMemo(() => {
    const tuitionPaid = tuitionBalances.reduce((sum, balance) => {
      const term1Paid = balance.term1_paid || 0;
      const term2Paid = balance.term2_paid || 0;
      const term3Paid = balance.term3_paid || 0;
      const bookPaid = balance.book_paid || 0;
      return sum + term1Paid + term2Paid + term3Paid + bookPaid;
    }, 0);
    
    const transportPaid = transportBalances.reduce((sum, balance) => {
      const term1Paid = balance.term1_paid || 0;
      const term2Paid = balance.term2_paid || 0;
      return sum + term1Paid + term2Paid;
    }, 0);
    
    return tuitionPaid + transportPaid;
  }, [tuitionBalances, transportBalances]);

  const collectionRate = useMemo(() => {
    const totalExpected = totalOutstanding + totalIncome;
    if (totalExpected === 0) return 0;
    return Math.round((totalIncome / totalExpected) * 100);
  }, [totalOutstanding, totalIncome]);

  return {
    tuitionBalances,
    transportBalances,
    totalOutstanding,
    totalIncome,
    collectionRate,
    activeTab,
    setActiveTab,
    isLoading: isLoadingTuition || isLoadingTransport,
    error: tuitionError || transportError,
  };
}
