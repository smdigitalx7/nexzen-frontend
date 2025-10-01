import { motion } from "framer-motion";
import { Users, UserCheck, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  pendingAdvances: number;
  currentBranch?: { branch_name: string };
}

export const EmployeeStatsCards = ({ 
  totalEmployees, 
  activeEmployees, 
  presentToday, 
  pendingLeaves, 
  pendingAdvances,
  currentBranch 
}: EmployeeStatsCardsProps) => {
  const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;
  
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
            Total Employees
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalEmployees}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeEmployees} active employees
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Present Today
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {presentToday}
          </div>
          <p className="text-xs text-muted-foreground">
            {attendanceRate.toFixed(1)}% attendance rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Leaves
          </CardTitle>
          <Calendar className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingLeaves}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Advances
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {pendingAdvances}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
