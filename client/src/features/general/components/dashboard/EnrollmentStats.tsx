import { Users, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrollmentStatsProps {
  data: {
    enrollments: {
      total_enrollments: number;
      confirmed_enrollments: number;
      pending_enrollments: number;
      cancelled_enrollments: number;
    };
    reservations: {
      total_reservations: number;
      confirmed_reservations: number;
      pending_reservations: number;
      cancelled_reservations: number;
    };
  };
}

export const EnrollmentStats = ({ data }: EnrollmentStatsProps) => {
  const navigate = useNavigate();

  const rowClass =
    "flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm";

  const renderRows = (
    total: number,
    confirmed: number,
    pending: number,
    cancelled: number
  ) => (
    <div className="space-y-3">
      <div className={rowClass}>
        <span className="font-medium text-foreground">Total</span>
        <span className="font-bold tabular-nums text-foreground">{total}</span>
      </div>
      <div className={`${rowClass} border-emerald-200/60 bg-emerald-500/5 dark:border-emerald-800/40 dark:bg-emerald-500/10`}>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span className="font-medium text-foreground">Confirmed</span>
        </div>
        <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{confirmed}</span>
      </div>
      {pending > 0 && (
        <div className={`${rowClass} border-amber-200/60 bg-amber-500/5 dark:border-amber-800/40 dark:bg-amber-500/10`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-foreground">Pending</span>
          </div>
          <span className="font-bold tabular-nums text-amber-700 dark:text-amber-400">{pending}</span>
        </div>
      )}
      {cancelled > 0 && (
        <div className={`${rowClass} border-red-200/60 bg-red-500/5 dark:border-red-800/40 dark:bg-red-500/10`}>
          <span className="font-medium text-foreground">Cancelled</span>
          <span className="font-bold tabular-nums text-red-700 dark:text-red-400">{cancelled}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div
        className="lg:col-span-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => navigate("/school/admissions")}
      >
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Enrollments</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Enrollment status overview</p>
        </div>
        <div className="p-6">
          {renderRows(
            data.enrollments.total_enrollments,
            data.enrollments.confirmed_enrollments,
            data.enrollments.pending_enrollments,
            data.enrollments.cancelled_enrollments
          )}
        </div>
      </div>

      <div
        className="lg:col-span-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => navigate("/school/reservations/new")}
      >
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Reservations</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Reservation status overview</p>
        </div>
        <div className="p-6">
          {renderRows(
            data.reservations.total_reservations,
            data.reservations.confirmed_reservations,
            data.reservations.pending_reservations,
            data.reservations.cancelled_reservations
          )}
        </div>
      </div>
    </div>
  );
};
