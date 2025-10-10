import React from "react";
import { useCollegeAttendance } from "@/lib/hooks/college/use-college-attendance";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";

export default function CollegeAttendanceManagement() {
  const { attendance, columns, isLoading } = useCollegeAttendance();
  return (
    <EnhancedDataTable
      data={attendance}
      columns={columns}
      isLoading={isLoading}
      title="College Attendance"
    />
  );
}


