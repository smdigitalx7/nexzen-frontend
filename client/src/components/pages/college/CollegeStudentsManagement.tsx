import React from "react";
import { useCollegeStudents } from "@/lib/hooks/college/use-college-students";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";

export default function CollegeStudents() {
  const { students, columns, isLoading } = useCollegeStudents();
  return (
    <EnhancedDataTable
      data={students}
      columns={columns}
      isLoading={isLoading}
      title="College Students"
    />
  );
}


