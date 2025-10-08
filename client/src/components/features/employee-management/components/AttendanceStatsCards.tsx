import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";

interface AttendanceStatsCardsProps {
  totalRecords: number;
  averageAttendance: number;
  totalLateArrivals: number;
  totalEarlyDepartures: number;
  totalPaidLeaves: number;
  totalUnpaidLeaves: number;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({
  totalRecords,
  averageAttendance,
  totalLateArrivals,
  totalEarlyDepartures,
  totalPaidLeaves,
  totalUnpaidLeaves,
}) => {
  const stats = [
    {
      title: "Total Records",
      value: totalRecords,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg. Attendance",
      value: `${averageAttendance.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Late Arrivals",
      value: totalLateArrivals,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Early Departures",
      value: totalEarlyDepartures,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Paid Leaves",
      value: totalPaidLeaves,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Unpaid Leaves",
      value: totalUnpaidLeaves,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
