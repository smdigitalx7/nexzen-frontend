import { Receipt } from "lucide-react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Activity Summary
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/audit-log")}
            className="text-sky-600 hover:text-sky-700"
          >
            View All
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Latest audit log activities (Last 24 hours)
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {data.map((activity, index) => {
            const getCategoryColor = (category: string) => {
              const colors: Record<string, string> = {
                CREATE:
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                UPDATE:
                  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                DELETE:
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                VIEW: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
              };
              return (
                colors[category.toUpperCase()] ||
                "bg-muted text-muted-foreground"
              );
            };

            return (
              <div
                key={`${activity.user_id}-${activity.changed_at}-${index}`}
                className="flex items-start justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {activity.user_full_name || "System"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(activity.category)}`}
                    >
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    {activity.activity_description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{activity.branch_name || "N/A"}</span>
                    <span>•</span>
                    <span>{activity.time_ago}</span>
                    {activity.count_or_amount && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          {activity.count_or_amount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
