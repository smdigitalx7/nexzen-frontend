import React from "react";
import EmployeesStatsCards from "./EmployeesStatsCards";
import EmployeesTable from "./EmployeesTable";
import type { ColumnDef } from "@tanstack/react-table";

interface Stat {
  title: string;
  value: string;
  icon: any;
  color: string;
}

interface EmployeesTabProps {
  stats: Stat[];
  data: any[];
  columns: ColumnDef<any, any>[];
  isLoading: boolean;
  error?: Error | null;
}

const EmployeesTab = ({ stats, data, columns, isLoading, error }: EmployeesTabProps) => {
  return (
    <div className="space-y-4">
      <EmployeesStatsCards stats={stats} />
      <EmployeesTable
        data={data}
        columns={columns}
        title="Employees"
        searchKey={null as any}
        isError={Boolean(error)}
        errorMessage={error?.message}
        isLoading={isLoading}
      />
    </div>
  );
};

export default React.memo(EmployeesTab) as typeof EmployeesTab;
