import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/common/utils";

interface IncomeChartProps {
  data: {
    category: string;
    amount: string;
  }[];
}

export const IncomeChart = ({ data }: IncomeChartProps) => {
  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Income by Category
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Breakdown of income sources
        </p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data.map((item) => ({
              category: item.category || "Other",
              amount: Number.parseFloat(item.amount || "0"),
            }))}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                return `₹${value}`;
              }}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar
              dataKey="amount"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              name="Amount"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
