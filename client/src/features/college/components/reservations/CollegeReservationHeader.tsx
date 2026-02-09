import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/common/components/ui/badge";
import { Building2, University } from "lucide-react";

interface CollegeReservationHeaderProps {
  currentBranch: { branch_type?: string; branch_name?: string } | null;
  reservationNo?: string | null;
}

export const CollegeReservationHeader = memo(
  ({ currentBranch, reservationNo }: CollegeReservationHeaderProps) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">Manage student reservations</p>
        </div>
        {reservationNo && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            Reservation No: {reservationNo}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "COLLEGE" ? (
              <University className="h-3 w-3" />
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

CollegeReservationHeader.displayName = "CollegeReservationHeader";
