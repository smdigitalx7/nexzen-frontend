import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DataTableWithFilters } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createCurrencyColumn,
} from "@/lib/utils/columnFactories.tsx";

interface ProfitLossTableProps {
  profitLossData: any[];
  expenseBreakdown: any[];
}

export const ProfitLossTable = ({ 
  profitLossData, 
  expenseBreakdown, 
}: ProfitLossTableProps) => {
  
  // Define columns for income breakdown
  const incomeColumns: ColumnDef<any>[] = useMemo(() => [
    createTextColumn<any>("category", { header: "Category", className: "font-medium" }),
    createCurrencyColumn<any>("amount", { header: "Amount" }),
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress 
            value={row.original.percentage} 
            className="w-16 h-2" 
          />
          <span className="text-sm text-muted-foreground">
            {row.original.percentage}%
          </span>
        </div>
      ),
    },
  ], []);

  // Define columns for expense breakdown
  const expenseColumns: ColumnDef<any>[] = useMemo(() => [
    createTextColumn<any>("category", { header: "Category", className: "font-medium" }),
    createCurrencyColumn<any>("amount", { header: "Amount" }),
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress 
            value={row.original.percentage} 
            className="w-16 h-2" 
          />
          <span className="text-sm text-muted-foreground">
            {row.original.percentage}%
          </span>
        </div>
      ),
    },
  ], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableWithFilters
              data={profitLossData}
              columns={incomeColumns}
              title=""
              description=""
              searchKey="category"
              exportable={true}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableWithFilters
              data={expenseBreakdown}
              columns={expenseColumns}
              title=""
              description=""
              searchKey="category"
              exportable={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};