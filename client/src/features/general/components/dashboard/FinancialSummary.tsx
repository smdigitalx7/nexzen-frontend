import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/common/utils";

interface FinancialSummaryProps {
  data: {
    total_income: string;
    total_expenditure: string;
    net_profit: string;
    income_this_month: string;
    expenditure_this_month: string;
    income_this_year: string;
    expenditure_this_year: string;
  };
}

export const FinancialSummary = ({ data }: FinancialSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div
        className="lg:col-span-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => navigate("/school/financial-reports")}
      >
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Financial Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete financial overview
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-500/5 p-4 dark:border-emerald-800/40 dark:bg-emerald-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Income
                </p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(parseFloat(data.total_income))}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-600/70" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-red-500/5 p-4 dark:border-red-800/40 dark:bg-red-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15 text-red-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Expenditure
                </p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">
                  {formatCurrency(parseFloat(data.total_expenditure))}
                </p>
              </div>
            </div>
            <ArrowDownRight className="h-5 w-5 text-red-600/70" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Net Profit
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(parseFloat(data.net_profit))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Current Period
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly & yearly breakdown
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                This Month
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2.5 pl-3 border-l-2 border-primary/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(parseFloat(data.income_this_month))}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expenditure</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(parseFloat(data.expenditure_this_month))}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                This Year
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2.5 pl-3 border-l-2 border-primary/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(parseFloat(data.income_this_year))}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expenditure</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(parseFloat(data.expenditure_this_year))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
