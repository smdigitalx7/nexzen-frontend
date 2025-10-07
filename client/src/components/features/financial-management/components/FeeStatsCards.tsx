import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface FeeStatsCardsProps {
  totalOutstanding: number;
  totalCollected: number;
  collectionRate: number;
  currentBranch?: { branch_name: string };
}

export const FeeStatsCards = ({ 
  totalOutstanding, 
  totalCollected, 
  collectionRate, 
  currentBranch 
}: FeeStatsCardsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Outstanding
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pending fee payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Collected
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCollected)}
          </div>
          <p className="text-xs text-muted-foreground">
            Successfully collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Collection Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {collectionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Fee collection efficiency
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Branch
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {currentBranch?.branch_name || "N/A"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Active
          </div>
          <p className="text-xs text-muted-foreground">
            Current branch status
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
