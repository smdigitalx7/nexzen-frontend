import { Users, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

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
  const [, setLocation] = useLocation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div
        className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setLocation("/school/admissions")}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Enrollments
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enrollment status overview
          </p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">Total</span>
            <span className="text-lg font-bold text-slate-900">
              {data.enrollments.total_enrollments}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                Confirmed
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-700">
              {data.enrollments.confirmed_enrollments}
            </span>
          </div>
          {data.enrollments.pending_enrollments > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">
                  Pending
                </span>
              </div>
              <span className="text-lg font-bold text-amber-700">
                {data.enrollments.pending_enrollments}
              </span>
            </div>
          )}
          {data.enrollments.cancelled_enrollments > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
              <span className="text-sm font-medium text-slate-700">
                Cancelled
              </span>
              <span className="text-lg font-bold text-red-700">
                {data.enrollments.cancelled_enrollments}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setLocation("/school/reservations/new")}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Reservations
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reservation status overview
          </p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">Total</span>
            <span className="text-lg font-bold text-slate-900">
              {data.reservations.total_reservations}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                Confirmed
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-700">
              {data.reservations.confirmed_reservations}
            </span>
          </div>
          {data.reservations.pending_reservations > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">
                  Pending
                </span>
              </div>
              <span className="text-lg font-bold text-amber-700">
                {data.reservations.pending_reservations}
              </span>
            </div>
          )}
          {data.reservations.cancelled_reservations > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
              <span className="text-sm font-medium text-slate-700">
                Cancelled
              </span>
              <span className="text-lg font-bold text-red-700">
                {data.reservations.cancelled_reservations}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
