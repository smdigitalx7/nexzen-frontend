import { useState, useMemo, useCallback } from 'react';
import { Calendar, Edit as EditIcon, Trash2 } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { DatePicker } from '@/common/components/ui/date-picker';
import { FormDialog, ConfirmDialog } from '@/common/components/shared';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/features/general/hooks/useAcademicYear';
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { useTabEnabled } from "@/common/hooks/use-tab-navigation";
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';
import { Badge } from '@/common/components/ui/badge';
import { Checkbox } from '@/common/components/ui/checkbox';

// UI row shape for the table
export type UIAcademicYearRow = {
  academic_year_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
};

const AcademicYearManagement = () => {
  // ✅ OPTIMIZATION: Only fetch academic years when this tab is active
  const academicYearsTabEnabled = useTabEnabled("academic-years", "classes");
  const { data: academicYears = [], isLoading: academicYearsLoading, refetch: refetchAcademicYears } = useAcademicYears({ enabled: academicYearsTabEnabled });
  
  const createAcademicYearMutation = useCreateAcademicYear();
  const updateAcademicYearMutation = useUpdateAcademicYear();
  const deleteAcademicYearMutation = useDeleteAcademicYear();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<UIAcademicYearRow | null>(null);
  const [newAcademicYear, setNewAcademicYear] = useState({ 
    year_name: '', 
    start_date: '', 
    end_date: '', 
    is_active: false 
  });
  const [editAcademicYear, setEditAcademicYear] = useState({ 
    year_name: '', 
    start_date: '', 
    end_date: '', 
    is_active: false 
  });

  const { toast } = useToast();

  const handleCreateAcademicYear = async () => {
    if (!newAcademicYear.year_name.trim() || !newAcademicYear.start_date || !newAcademicYear.end_date) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAcademicYearMutation.mutateAsync(newAcademicYear);
      setNewAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
      setIsAddDialogOpen(false);
    } catch (error) {}
  };

  const handleUpdateAcademicYear = async () => {
    if (!editAcademicYear.year_name.trim() || !editAcademicYear.start_date || !editAcademicYear.end_date || !selectedAcademicYear) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAcademicYearMutation.mutateAsync({
        id: selectedAcademicYear.academic_year_id,
        data: editAcademicYear,
      });
      setEditAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
      setSelectedAcademicYear(null);
      setIsEditDialogOpen(false);
    } catch (error) {}
  };

  const handleDeleteAcademicYear = async () => {
    if (!selectedAcademicYear) return;
    try {
      await deleteAcademicYearMutation.mutateAsync(selectedAcademicYear.academic_year_id);
      setSelectedAcademicYear(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {}
  };

  const handleEditClick = useCallback((academicYear: UIAcademicYearRow) => {
    setSelectedAcademicYear(academicYear);
    setEditAcademicYear({
      year_name: academicYear.year_name,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      is_active: academicYear.is_active,
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((academicYear: UIAcademicYearRow) => {
    setSelectedAcademicYear(academicYear);
    setIsDeleteDialogOpen(true);
  }, []);

  const columns: ColumnDef<UIAcademicYearRow>[] = useMemo(() => [
    {
      accessorKey: 'year_name',
      header: 'Academic Year',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">{row.original.year_name}</span>
        </div>
      )
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => <span className="text-slate-500 font-mono">{new Date(row.original.start_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => <span className="text-slate-500 font-mono">{new Date(row.original.end_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "secondary"} className="shadow-none">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  ], []);

  const actions: ActionConfig<UIAcademicYearRow>[] = useMemo(() => [
    {
      id: "edit",
      label: "Edit",
      icon: EditIcon,
      onClick: handleEditClick
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDeleteClick,
      variant: 'destructive'
    }
  ], [handleEditClick, handleDeleteClick]);

  return (
    <div className="space-y-4">
      <DataTable
        data={academicYears as UIAcademicYearRow[]}
        columns={columns}
        actions={actions}
        title="Academic Years"
        searchKey="year_name"
        loading={academicYearsLoading}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonText="Add Year"
        export={{ enabled: true, filename: 'academic_years' }}
      />

      {/* Add Academic Year Dialog */}
      <FormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Create New Session"
        description="Initialize a new academic year session for the institution."
        onSave={handleCreateAcademicYear}
        onCancel={() => {
          setIsAddDialogOpen(false);
          setNewAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
        }}
        saveText="Save Academic Year"
        cancelText="Discard"
        disabled={createAcademicYearMutation.isPending}
      >
        <div className="space-y-5 p-1">
          <div className="space-y-2">
            <Label htmlFor="year_name" className="text-sm font-semibold text-slate-700">Academic Year Name</Label>
            <Input
              id="year_name"
              value={newAcademicYear.year_name}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, year_name: e.target.value })}
              placeholder="e.g., 2024-2025"
              className="h-11 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-semibold text-slate-700">Start Date</Label>
              <DatePicker
                id="start_date"
                value={newAcademicYear.start_date}
                onChange={(value) => setNewAcademicYear({ ...newAcademicYear, start_date: value })}
                placeholder="Pick date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-semibold text-slate-700">End Date</Label>
              <DatePicker
                id="end_date"
                value={newAcademicYear.end_date}
                onChange={(value) => setNewAcademicYear({ ...newAcademicYear, end_date: value })}
                placeholder="Pick date"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Checkbox
              id="is_active"
              checked={newAcademicYear.is_active}
              onCheckedChange={(checked) => setNewAcademicYear({ ...newAcademicYear, is_active: !!checked })}
            />
            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-slate-600">Mark as primary active year</Label>
          </div>
        </div>
      </FormDialog>

      {/* Edit Academic Year Dialog */}
      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Modify Academic Session"
        description="Update the configuration for this academic session."
        onSave={handleUpdateAcademicYear}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setEditAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
          setSelectedAcademicYear(null);
        }}
        saveText="Update Changes"
        cancelText="Cancel"
        disabled={updateAcademicYearMutation.isPending}
      >
        <div className="space-y-5 p-1">
          <div className="space-y-2">
            <Label htmlFor="edit_year_name" className="text-sm font-semibold text-slate-700">Academic Year Name</Label>
            <Input
              id="edit_year_name"
              value={editAcademicYear.year_name}
              onChange={(e) => setEditAcademicYear({ ...editAcademicYear, year_name: e.target.value })}
              placeholder="e.g., 2024-2025"
              className="h-11 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_start_date" className="text-sm font-semibold text-slate-700">Start Date</Label>
              <DatePicker
                id="edit_start_date"
                value={editAcademicYear.start_date}
                onChange={(value) => setEditAcademicYear({ ...editAcademicYear, start_date: value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date" className="text-sm font-semibold text-slate-700">End Date</Label>
              <DatePicker
                id="edit_end_date"
                value={editAcademicYear.end_date}
                onChange={(value) => setEditAcademicYear({ ...editAcademicYear, end_date: value })}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Checkbox
              id="edit_is_active"
              checked={editAcademicYear.is_active}
              onCheckedChange={(checked) => setEditAcademicYear({ ...editAcademicYear, is_active: !!checked })}
            />
            <Label htmlFor="edit_is_active" className="text-sm font-medium cursor-pointer text-slate-600">Set as active session</Label>
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Archive Academic Session?"
        description={`This will permanently remove "${selectedAcademicYear?.year_name}". All associated dependency records might be affected. This action is irreversible.`}
        onConfirm={handleDeleteAcademicYear}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAcademicYear(null);
        }}
        confirmText="Confirm Delete"
        variant="destructive"
      />
    </div>
  );
};

export default AcademicYearManagement;
