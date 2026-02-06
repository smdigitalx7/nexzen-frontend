import React from "react";
import { DataTable } from "@/common/components/shared/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";

interface EmployeesTableProps {
  data: any[];
  columns: ColumnDef<any, any>[];
  title: string;
  searchKey: string;
  exportable?: boolean;
  showSearch?: boolean;
  onAdd?: () => void;
  addButtonText?: string;
  isError: boolean;
  errorMessage?: string;
  isLoading: boolean;
}

const EmployeesTable = ({ 
  data, 
  columns, 
  title, 
  searchKey,
  exportable = false,
  showSearch = true,
  onAdd,
  addButtonText,
  isError, 
  errorMessage, 
  isLoading 
}: EmployeesTableProps) => {
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
    <DataTable
      data={data}
      columns={columns as any}
      title={title}
      loading={isLoading}
      searchKey={searchKey as any}
      searchPlaceholder="Search employees..."
      export={{ enabled: exportable, filename: "employees" }}
      showSearch={showSearch}
      onAdd={onAdd}
      addButtonText={addButtonText}
    />
  );
};

export default React.memo(EmployeesTable);
