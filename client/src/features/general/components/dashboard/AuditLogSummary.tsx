import { Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";

interface AuditLogActivity {
  user_id: string;
  user_full_name: string;
  category: string;
  activity_description: string;
  branch_name?: string;
  time_ago: string;
  count_or_amount?: string;
  changed_at: string;
}

interface AuditLogSummaryProps {
  data: AuditLogActivity[];
}

export const AuditLogSummary = ({ data }: AuditLogSummaryProps) => {
  const navigate = useNavigate();

  if (data.length === 0) return null;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CREATE:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
      UPDATE:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
      DELETE:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-800/40",
      VIEW: "bg-muted text-muted-foreground border-border",
    };
    return (
      colors[category.toUpperCase()] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <Receipt className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/audit-log")}
            className="text-sky-600 hover:text-sky-700 hover:bg-sky-500/10"
          >
            View All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Last 24 hours
        </p>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {data.map((activity, index) => (
            <div
              key={`${activity.user_id}-${activity.changed_at}-${index}`}
              className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {activity.user_full_name || "System"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${getCategoryColor(activity.category)}`}
                    >
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                    {activity.activity_description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{activity.branch_name || "N/A"}</span>
                    <span>{activity.time_ago}</span>
                    {activity.count_or_amount && (
                      <span className="font-medium text-foreground">
                        {activity.count_or_amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
