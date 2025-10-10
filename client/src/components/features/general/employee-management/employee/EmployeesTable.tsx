import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedDataTable } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";

interface EmployeesTableProps {
  data: any[];
  columns: ColumnDef<any, any>[];
  title: string;
  isError: boolean;
  errorMessage?: string;
  isLoading: boolean;
}

const EmployeesTable = ({ data, columns, title, isError, errorMessage, isLoading }: EmployeesTableProps) => {
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{errorMessage || "Failed to load employees"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      title={isLoading ? `${title} (Loading...)` : title}
      searchKey="employee_name"
      exportable={true}
    />
  );
};

export default React.memo(EmployeesTable);
