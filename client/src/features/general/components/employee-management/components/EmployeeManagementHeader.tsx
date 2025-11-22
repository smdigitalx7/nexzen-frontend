import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";

interface EmployeeManagementHeaderProps {
  currentBranch?: { branch_name: string };
}

export const EmployeeManagementHeader = ({ currentBranch }: EmployeeManagementHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        <p className="text-muted-foreground">
          Comprehensive employee management and tracking
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {currentBranch?.branch_name}
        </Badge>
      </div>
    </motion.div>
  );
};
