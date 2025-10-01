import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface RevenueChartProps {
  data: any[];
  formatCurrency: (amount: number) => string;
}

export const RevenueChart = ({ data, formatCurrency }: RevenueChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="tuition" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="Tuition Fees"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="transport" 
                  stackId="a" 
                  fill="#10b981" 
                  name="Transport Fees"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="books" 
                  stackId="a" 
                  fill="#f59e0b" 
                  name="Book Sales"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="admission" 
                  stackId="a" 
                  fill="#ef4444" 
                  name="Admission Fees"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="other" 
                  stackId="a" 
                  fill="#8b5cf6" 
                  name="Other Income"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
