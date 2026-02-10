import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  IndianRupee, 
  PieChart as PieIcon, 
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/common/utils";

interface CollegeFinancialAnalyticsProps {
  incomeDashboard: any;
  expenditureDashboard: any;
  loading?: boolean;
}

const COLORS = {
  income: {
    tuition: "#3b82f6", // blue
    transport: "#8b5cf6", // purple
    books: "#06b6d4", // cyan
    reservation: "#10b981", // emerald
    other: "#f59e0b", // amber
  },
  expenditure: {
    paid: "#10b981", // emerald
    unpaid: "#ef4444", // red
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const CollegeFinancialAnalytics = ({
  incomeDashboard,
  expenditureDashboard,
  loading,
}: CollegeFinancialAnalyticsProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 border-[3px] border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-3 border-[3px] border-primary/10 rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-sm animate-pulse font-medium">Analyzing financial data...</p>
      </div>
    );
  }

  if (!incomeDashboard || !expenditureDashboard) {
    return (
      <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <PieIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No Analytics Data Yet</CardTitle>
        <CardDescription className="max-w-xs mx-auto mt-2">
          We couldn't find enough financial records to generate a meaningful analysis.
        </CardDescription>
      </Card>
    );
  }

  const income = incomeDashboard;
  const expenditure = expenditureDashboard;

  // Prepare Data for Income Breakdown
  const incomeData = [
    { name: "Tuition Fees", value: income.tuition_fee_income || 0, color: COLORS.income.tuition },
    { name: "Transport Fees", value: income.transport_fee_income || 0, color: COLORS.income.transport },
    { name: "Book Fees", value: income.book_fee_income || 0, color: COLORS.income.books },
    { name: "Reservation Fees", value: income.reservation_fee_income || income.application_fee_income || 0, color: COLORS.income.reservation },
    { name: "Other Income", value: income.other_income || 0, color: COLORS.income.other },
  ].filter(item => item.value > 0);

  // Comparison Data
  const comparisonData = [
    {
      period: "Current Year Statistics",
      income: income.total_income_amount || 0,
      expenditure: expenditure.total_expenditure_amount || 0,
    }
  ];

  const netProfit = (income.total_income_amount || 0) - (expenditure.total_expenditure_amount || 0);
  const profitMargin = income.total_income_amount > 0 
    ? ((netProfit / income.total_income_amount) * 100).toFixed(1) 
    : "0.0";

  const formatCurrency = (val: number) => `₹${new Intl.NumberFormat('en-IN').format(val)}`;

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Income" 
          value={income.total_income_amount || 0} 
          icon={TrendingUp}
          trend={income.income_this_month}
          trendLabel="This Month"
          color="emerald"
          variant="glow"
        />
        <KPICard 
          title="Total Expenses" 
          value={expenditure.total_expenditure_amount || 0} 
          icon={TrendingDown}
          trend={expenditure.expenditure_this_month}
          trendLabel="This Month"
          color="rose"
          variant="glow"
        />
        <KPICard 
          title="Net Cashflow" 
          value={netProfit} 
          icon={Wallet}
          trend={Number(profitMargin)}
          trendLabel="Margin %"
          isPercent
          color={netProfit >= 0 ? "blue" : "orange"}
          variant="glow"
        />
        <KPICard 
          title="Dues Outlook" 
          value={expenditure.total_unpaid_amount || 0} 
          icon={IndianRupee}
          trend={expenditure.unpaid_expenditures}
          trendLabel="Pending Vouchers"
          color="amber"
          variant="glow"
          isSimpleTrend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Distribution */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full border bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-blue-500" />
                    Income Sources
                  </CardTitle>
                  <CardDescription>Distribution across categories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(v: number) => formatCurrency(v)} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-2">
                {incomeData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profitability Snapshot */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Profitability Snapshot
                </CardTitle>
                <CardDescription>Total income vs total expenditure comparison</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-rose-500" />
                  <span>Expenditure</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} barGap={12} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(v) => `₹${v/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(v: number) => formatCurrency(v)} 
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenditure" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* consolidated summary */}
      <motion.div variants={itemVariants}>
        <Card className="border bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <IndianRupee className="h-40 w-40" />
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Annual Performance</span>
                </div>
                <h3 className="text-3xl font-bold">Consolidated View</h3>
                <p className="text-blue-100 text-sm opacity-90">Cumulative financial data for the current academic session.</p>
              </div>
              
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-blue-100 text-sm mb-1">Year-to-Date Income</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(income.income_this_year || 0)}</span>
                  <span className="text-xs text-emerald-300 font-bold flex items-center">
                    <ArrowUpRight className="h-3 w-3" />
                    {income.income_records_this_year || 0} records
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-blue-100 text-sm mb-1">Year-to-Date Expenses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(expenditure.expenditure_this_year || 0)}</span>
                  <span className="text-xs text-rose-300 font-bold flex items-center">
                    <ArrowDownRight className="h-3 w-3" />
                    {expenditure.expenditure_records_this_year || 0} records
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

interface KPICardProps {
  title: string;
  value: number;
  icon: any;
  trend?: number;
  trendLabel: string;
  isPercent?: boolean;
  isSimpleTrend?: boolean;
  color: "emerald" | "rose" | "blue" | "orange" | "amber";
  variant?: "glass" | "glow" | "simple";
}

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  isPercent, 
  isSimpleTrend,
  color,
  variant = "simple"
}: KPICardProps) => {
  const colorClasses = {
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-100",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100",
  };

  const glowClasses = {
    emerald: "shadow-emerald-500/10 border-t-2 border-t-emerald-500",
    rose: "shadow-rose-500/10 border-t-2 border-t-rose-500",
    blue: "shadow-blue-500/10 border-t-2 border-t-blue-500",
    orange: "shadow-orange-500/10 border-t-2 border-t-orange-500",
    amber: "shadow-amber-500/10 border-t-2 border-t-amber-500",
  };

  const formatWithK = (v: number) => {
    if (v >= 10000000) return `${(v/10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `${(v/100000).toFixed(1)}L`;
    if (v >= 1000) return `${(v/1000).toFixed(1)}k`;
    return v.toString();
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn(
        "relative overflow-hidden group transition-all duration-300 hover:shadow-lg", 
        variant === "glow" && glowClasses[color],
        "border bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
              <h4 className="text-2xl font-bold tracking-tight">
                {isPercent ? `${value}%` : `₹${new Intl.NumberFormat('en-IN').format(value)}`}
              </h4>
            </div>
            <div className={cn("p-2.5 rounded-xl transition-shadow group-hover:shadow-md", colorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          
          {trend !== undefined && (
            <div className="mt-4 flex items-center gap-1.5">
              <div className={cn(
                "flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                trend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
              )}>
                {trend >= 0 ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                {isSimpleTrend ? trend : isPercent ? `${trend}%` : `₹${formatWithK(trend)}`}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
