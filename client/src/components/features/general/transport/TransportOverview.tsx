import { motion } from "framer-motion";
import { Route, Users, Navigation } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransportOverviewProps {
  activeRoutes: number;
  totalStudents: number;
  overallUtilization: number;
  totalCost: number;
}

const TransportOverview = ({
  activeRoutes,
  totalStudents,
  overallUtilization,
  totalCost,
}: TransportOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
          <Route className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {activeRoutes}
          </div>
          <p className="text-xs text-muted-foreground">Transport routes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Students
          </CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalStudents}
          </div>
          <p className="text-xs text-muted-foreground">
            Students using transport
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Route Utilization
          </CardTitle>
          <Navigation className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {overallUtilization.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Average capacity usage
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <span className="text-base font-bold text-orange-600">₹</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalCost)}
          </div>
          <p className="text-xs text-muted-foreground">Fuel + Maintenance</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TransportOverview;
