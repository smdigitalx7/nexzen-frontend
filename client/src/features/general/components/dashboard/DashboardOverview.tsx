import { Users, GraduationCap, BookOpen, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardOverviewProps {
  data: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_branches: number;
  };
}

export const DashboardOverview = ({ data }: DashboardOverviewProps) => {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Students",
      value: data.total_students,
      sub: "Across all branches",
      icon: Users,
      gradient:
        "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/60 dark:border-blue-800/40",
      color:
        "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400",
      onClick: () => navigate("/school/admissions"),
    },
    {
      label: "Teachers",
      value: data.total_teachers,
      sub: "Teaching staff",
      icon: GraduationCap,
      gradient:
        "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200/60 dark:border-emerald-800/40",
      color:
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400",
      onClick: () => navigate("/employees"),
    },
    {
      label: "Classes",
      value: data.total_classes,
      sub: "Active classes",
      icon: BookOpen,
      gradient:
        "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 border-indigo-200/60 dark:border-indigo-800/40",
      color:
        "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400",
      onClick: () => navigate("/school/academic"),
    },
    {
      label: "Branches",
      value: data.total_branches,
      sub: "Institute branches",
      icon: Building2,
      gradient:
        "bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/30 border-slate-200/60 dark:border-slate-700/40",
      color:
        "bg-slate-500/15 text-slate-600 dark:bg-slate-400/25 dark:text-slate-300",
      onClick: undefined,
    },
  ];

  const statCardBase =
    "rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md group";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Institutional Overview
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Key metrics at a glance
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, gradient, color, onClick }) => {
          const content = (
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} group-hover:opacity-90 transition-opacity`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          );
          const className = `${statCardBase} ${gradient} ${onClick ? "cursor-pointer" : "cursor-default"} w-full`;
          return onClick ? (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={className}
            >
              {content}
            </button>
          ) : (
            <div key={label} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
