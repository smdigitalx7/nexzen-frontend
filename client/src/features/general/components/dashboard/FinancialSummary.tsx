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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Total Financials */}
      <div
        className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate("/school/financial-reports")}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-semibold text-slate-900">
            Financial Performance
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete financial overview
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(parseFloat(data.total_income))}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-600 opacity-50" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 border border-red-100">
            <div className="flex items-center gap-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Expenditure
                </p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(parseFloat(data.total_expenditure))}
                </p>
              </div>
            </div>
            <ArrowDownRight className="h-5 w-5 text-red-600 opacity-50" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-200">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-slate-700" />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Net Profit
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(parseFloat(data.net_profit))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Breakdown */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-semibold text-slate-900">
            Current Period
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Monthly & yearly breakdown
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">
                This Month
              </span>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3 pl-2 border-l-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Income</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(parseFloat(data.income_this_month))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Expenditure</span>
                <span className="text-base font-bold text-red-700">
                  {formatCurrency(parseFloat(data.expenditure_this_month))}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">
                This Year
              </span>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Income</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(parseFloat(data.income_this_year))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Expenditure</span>
                <span className="text-base font-bold text-red-700">
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
