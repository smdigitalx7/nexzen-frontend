import { useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";

// Mock data for financial reports
const mockIncomeData = [
  {
    month: "Jan",
    tuition: 6500000,
    transport: 480000,
    books: 350000,
    admission: 200000,
    other: 150000,
  },
  {
    month: "Feb",
    tuition: 7200000,
    transport: 520000,
    books: 380000,
    admission: 180000,
    other: 120000,
  },
  {
    month: "Mar",
    tuition: 7800000,
    transport: 560000,
    books: 420000,
    admission: 220000,
    other: 180000,
  },
  {
    month: "Apr",
    tuition: 8200000,
    transport: 600000,
    books: 450000,
    admission: 250000,
    other: 200000,
  },
  {
    month: "May",
    tuition: 8500000,
    transport: 620000,
    books: 480000,
    admission: 280000,
    other: 220000,
  },
  {
    month: "Jun",
    tuition: 8800000,
    transport: 640000,
    books: 500000,
    admission: 300000,
    other: 250000,
  },
];

const mockExpenseData = [
  {
    month: "Jan",
    salaries: 4500000,
    maintenance: 180000,
    utilities: 120000,
    supplies: 80000,
    other: 60000,
  },
  {
    month: "Feb",
    salaries: 4600000,
    maintenance: 190000,
    utilities: 125000,
    supplies: 85000,
    other: 65000,
  },
  {
    month: "Mar",
    salaries: 4700000,
    maintenance: 200000,
    utilities: 130000,
    supplies: 90000,
    other: 70000,
  },
  {
    month: "Apr",
    salaries: 4800000,
    maintenance: 210000,
    utilities: 135000,
    supplies: 95000,
    other: 75000,
  },
  {
    month: "May",
    salaries: 4900000,
    maintenance: 220000,
    utilities: 140000,
    supplies: 100000,
    other: 80000,
  },
  {
    month: "Jun",
    salaries: 5000000,
    maintenance: 230000,
    utilities: 145000,
    supplies: 105000,
    other: 85000,
  },
];

const mockProfitLossData = [
  { category: "Tuition Fees", amount: 52000000, percentage: 65 },
  { category: "Transport Fees", amount: 3600000, percentage: 4.5 },
  { category: "Book Sales", amount: 2800000, percentage: 3.5 },
  { category: "Admission Fees", amount: 1500000, percentage: 1.9 },
  { category: "Other Income", amount: 1200000, percentage: 1.5 },
];

const mockExpenseBreakdown = [
  { category: "Salaries", amount: 28500000, percentage: 70 },
  { category: "Maintenance", amount: 1200000, percentage: 3 },
  { category: "Utilities", amount: 800000, percentage: 2 },
  { category: "Supplies", amount: 600000, percentage: 1.5 },
  { category: "Other Expenses", amount: 500000, percentage: 1.2 },
];

const mockRevenueTrends = [
  { month: "Jan", revenue: 7680000, profit: 1980000 },
  { month: "Feb", revenue: 8260000, profit: 2210000 },
  { month: "Mar", revenue: 8980000, profit: 2480000 },
  { month: "Apr", revenue: 9520000, profit: 2770000 },
  { month: "May", revenue: 10020000, profit: 3020000 },
  { month: "Jun", revenue: 10590000, profit: 3290000 },
];

export const useFinancialReports = () => {
  const { user, currentBranch } = useAuthStore();
  
  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("6months");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Computed values
  const totalRevenue = useMemo(() => {
    return mockIncomeData.reduce((sum, month) => 
      sum + month.tuition + month.transport + month.books + month.admission + month.other, 0
    );
  }, []);

  const totalExpenses = useMemo(() => {
    return mockExpenseData.reduce((sum, month) => 
      sum + month.salaries + month.maintenance + month.utilities + month.supplies + month.other, 0
    );
  }, []);

  const netProfit = useMemo(() => {
    return totalRevenue - totalExpenses;
  }, [totalRevenue, totalExpenses]);

  const profitMargin = useMemo(() => {
    return totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  }, [netProfit, totalRevenue]);

  const filteredIncomeData = useMemo(() => {
    return mockIncomeData;
  }, [dateRange, selectedBranch]);

  const filteredExpenseData = useMemo(() => {
    return mockExpenseData;
  }, [dateRange, selectedBranch]);

  const filteredProfitLossData = useMemo(() => {
    if (selectedCategory === "all") return mockProfitLossData;
    return mockProfitLossData.filter(item => 
      item.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  const filteredExpenseBreakdown = useMemo(() => {
    if (selectedCategory === "all") return mockExpenseBreakdown;
    return mockExpenseBreakdown.filter(item => 
      item.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  const filteredRevenueTrends = useMemo(() => {
    return mockRevenueTrends;
  }, [dateRange, selectedBranch]);

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  // Handlers
  const handleExportReport = () => {
    console.log(`Exporting ${exportFormat} report for ${dateRange}`);
    setShowExportDialog(false);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    // Data
    incomeData: filteredIncomeData,
    expenseData: filteredExpenseData,
    profitLossData: filteredProfitLossData,
    expenseBreakdown: filteredExpenseBreakdown,
    revenueTrends: filteredRevenueTrends,
    
    // Computed values
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    
    // UI State
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    selectedBranch,
    setSelectedBranch,
    showExportDialog,
    setShowExportDialog,
    exportFormat,
    setExportFormat,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    
    // Handlers
    handleExportReport,
    handleDateRangeChange,
    handleBranchChange,
    handleCategoryFilter,
    handleSearch,
    
    // Utilities
    formatCurrency,
    formatCompactCurrency,
    
    // User context
    user,
    currentBranch,
  };
};
