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
}

export const FinancialStatsCards = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  formatCurrency,
  formatCompactCurrency,
}: FinancialStatsCardsProps) => {
  const stats = [
    {
      title: "Total Revenue",
      value: formatCompactCurrency(totalRevenue),
      fullValue: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+12.5%",
      trendColor: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: formatCompactCurrency(totalExpenses),
      fullValue: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "+8.2%",
      trendColor: "text-red-600",
    },
    {
      title: "Net Profit",
      value: formatCompactCurrency(netProfit),
      fullValue: formatCurrency(netProfit),
      icon: TrendingUp,
      color: netProfit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: netProfit >= 0 ? "bg-green-50" : "bg-red-50",
      trend: profitMargin >= 0 ? `+${profitMargin.toFixed(1)}%` : `${profitMargin.toFixed(1)}%`,
      trendColor: profitMargin >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      fullValue: `${profitMargin.toFixed(2)}%`,
      icon: Calculator,
      color: profitMargin >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: profitMargin >= 0 ? "bg-blue-50" : "bg-red-50",
      trend: profitMargin >= 0 ? "Healthy" : "Needs Attention",
      trendColor: profitMargin >= 0 ? "text-green-600" : "text-red-600",
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
