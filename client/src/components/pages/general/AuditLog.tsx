import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { useActivitySummary } from "@/lib/hooks/general/useAuditLogs";

export default function ActivitySummary() {
  const [hoursBack, setHoursBack] = useState<number>(24);
  const [limit, setLimit] = useState<number>(100);
  const [userId, setUserId] = useState<number | null>(null);

  const {
    data: activitySummaries = [],
    isLoading,
    error,
    refetch,
  } = useActivitySummary({
    hours_back: hoursBack,
    limit: limit,
    user_id: userId || undefined,
  });

  const exportCSV = () => {
    const rows = [
      [
        "User",
        "Branch",
        "Activity",
        "Category",
        "Count/Amount",
        "Time Ago",
        "Changed At",
        "Changed Date",
      ],
      ...activitySummaries.map((r) => [
        r.user_full_name || "N/A",
        r.branch_name || "N/A",
        r.activity_description,
        r.category,
        r.count_or_amount,
        r.time_ago,
        r.changed_at,
        r.changed_date,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      VIEW: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category.toUpperCase()] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Summary</h1>
          <p className="text-muted-foreground">
            Dashboard-style activity summaries from audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </motion.div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Hours Back
              </label>
              <Select
                value={hoursBack.toString()}
                onValueChange={(value) => setHoursBack(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="6">Last 6 Hours</SelectItem>
                  <SelectItem value="12">Last 12 Hours</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="48">Last 48 Hours</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                  <SelectItem value="720">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Limit
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="250">250 records</SelectItem>
                  <SelectItem value="500">500 records</SelectItem>
                  <SelectItem value="1000">1000 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                User ID (Optional)
              </label>
              <Input
                type="number"
                placeholder="Filter by user ID"
                value={userId || ""}
                onChange={(e) =>
                  setUserId(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setUserId(null);
                  setHoursBack(24);
                  setLimit(100);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summaries</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : error
              ? "Error loading activity summaries"
              : `${activitySummaries.length} records`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load activity summaries</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : activitySummaries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No activity summaries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Count/Amount</TableHead>
                    <TableHead>Time Ago</TableHead>
                    <TableHead>Changed At</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitySummaries.map((activity, index) => (
                    <TableRow key={`${activity.user_id}-${activity.changed_at}-${index}`}>
                      <TableCell className="font-medium">
                        {activity.user_full_name || "N/A"}
                      </TableCell>
                      <TableCell>{activity.branch_name || "N/A"}</TableCell>
                      <TableCell>{activity.activity_description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(activity.category)}
                        >
                          {activity.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.count_or_amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {activity.time_ago}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(activity.changed_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {activity.changed_date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

