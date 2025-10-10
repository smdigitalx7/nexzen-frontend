import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PayrollStatsCardsProps {
  totalPayrolls: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currentBranch?: { branch_name: string } | null;
}

export const PayrollStatsCards = ({
  totalPayrolls,
  totalAmount,
  paidAmount,
  pendingAmount,
  currentBranch,
}: PayrollStatsCardsProps) => {
  const stats = [
    {
      title: "Total Payrolls",
      value: totalPayrolls.toString(),
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+5.2%",
      trendColor: "text-green-600",
    },
    {
      title: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+12.5%",
      trendColor: "text-green-600",
    },
    {
      title: "Paid Amount",
      value: formatCurrency(paidAmount),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+8.2%",
      trendColor: "text-green-600",
    },
    {
      title: "Pending Amount",
      value: formatCurrency(pendingAmount),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "-2.1%",
      trendColor: "text-red-600",
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
