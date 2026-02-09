import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/common/components/ui/badge";
import { School, Building2 } from "lucide-react";

interface SchoolReservationHeaderProps {
  currentBranch: { branch_type?: string; branch_name?: string } | null;
}

export const SchoolReservationHeader = memo(
  ({ currentBranch }: SchoolReservationHeaderProps) => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">Manage student reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "SCHOOL" ? (
              <School className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
);

SchoolReservationHeader.displayName = "SchoolReservationHeader";
