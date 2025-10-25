import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Edit, Trash2, User } from "lucide-react";
import { useTeachersByBranch } from "@/lib/hooks/general/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const TeachersTab = () => {
  const { data: teachers = [], isLoading, error } = useTeachersByBranch();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  // Filter teachers based on search term
  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachers;
    return teachers.filter((teacher: any) =>
      teacher.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "employee_name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("employee_name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "employee_id",
      header: "Employee ID",
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.getValue("designation") || "Teacher"}
        </Badge>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: any) => {
        setSelectedTeacher(row);
        setIsEditOpen(true);
      }
    }
  ], []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading teachers</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="search">Search Teachers</Label>
          <Input
            id="search"
            placeholder="Search by name, ID, designation, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <EnhancedDataTable
        data={filteredTeachers}
        columns={columns}
        title="Teachers"
        searchKey="employee_name"
        exportable={true}
        onAdd={() => setIsAddOpen(true)}
        addButtonText="Add Teacher"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        loading={isLoading}
      />

      <FormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Teacher"
        description="Add a new teacher to the system"
        onSave={async () => {
          // This would typically open a more comprehensive teacher form
          // For now, we'll just show a message
          toast({ 
            title: "Feature Coming Soon", 
            description: "Teacher addition will be available in the employee management section" 
          });
          setIsAddOpen(false);
        }}
        onCancel={() => {
          setIsAddOpen(false);
        }}
        saveText="Add Teacher"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              To add new teachers, please use the Employee Management section.
            </p>
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Teacher"
        description="Update teacher information"
        onSave={async () => {
          // This would typically open a more comprehensive teacher edit form
          // For now, we'll just show a message
          toast({ 
            title: "Feature Coming Soon", 
            description: "Teacher editing will be available in the employee management section" 
          });
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        saveText="Update Teacher"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              To edit teacher information, please use the Employee Management section.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
