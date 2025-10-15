import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";

interface FinancialStatsCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;
  incomeDashboard?: {
    income_this_month?: number;
    income_this_year?: number;
  };
  expenditureDashboard?: {
    expenditure_this_month?: number;
    expenditure_this_year?: number;
  };
}

export const FinancialStatsCards = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  formatCurrency,
  formatCompactCurrency,
  incomeDashboard,
  expenditureDashboard,
}: FinancialStatsCardsProps) => {
  // Safe handling of potentially NaN values
  const safeProfitMargin = typeof profitMargin === 'number' && !isNaN(profitMargin) ? profitMargin : 0;
  
  // Calculate trends from dashboard data
  const revenueTrend = incomeDashboard?.income_this_month 
    ? formatCompactCurrency(incomeDashboard.income_this_month)
    : "₹0";
  const expenseTrend = expenditureDashboard?.expenditure_this_month
    ? formatCompactCurrency(expenditureDashboard.expenditure_this_month)
    : "₹0";
  
  const stats = [
    {
      title: "Total Revenue",
      value: formatCompactCurrency(totalRevenue),
      fullValue: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: `This Month: ${revenueTrend}`,
      trendColor: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: formatCompactCurrency(totalExpenses),
      fullValue: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: `This Month: ${expenseTrend}`,
      trendColor: "text-red-600",
    },
    {
      title: "Net Profit",
      value: formatCompactCurrency(netProfit),
      fullValue: formatCurrency(netProfit),
      icon: TrendingUp,
      color: netProfit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: netProfit >= 0 ? "bg-green-50" : "bg-red-50",
      trend: safeProfitMargin >= 0 ? `+${safeProfitMargin.toFixed(1)}%` : `${safeProfitMargin.toFixed(1)}%`,
      trendColor: safeProfitMargin >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Profit Margin",
      value: `${safeProfitMargin.toFixed(1)}%`,
      fullValue: `${safeProfitMargin.toFixed(2)}%`,
      icon: Calculator,
      color: safeProfitMargin >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: safeProfitMargin >= 0 ? "bg-blue-50" : "bg-red-50",
      trend: safeProfitMargin >= 0 ? "Healthy" : "Needs Attention",
      trendColor: safeProfitMargin >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.fullValue}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stat.trendColor} border-current`}
                  >
                    {stat.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
