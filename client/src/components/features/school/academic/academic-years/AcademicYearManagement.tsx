import { useState, useMemo } from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog, ConfirmDialog } from '@/components/shared';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/lib/hooks/general/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from '@tanstack/react-table';
import {
  createIconTextColumn,
  createDateColumn,
  createBadgeColumn
} from "@/lib/utils/columnFactories";

// UI row shape for the table
type UIAcademicYearRow = {
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
  const { data: academicYears = [], isLoading: academicYearsLoading, error } = useAcademicYears();
  
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
      
      toast({
        title: "Success",
        description: "Academic year created successfully",
      });
      
      setNewAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create academic year",
        variant: "destructive",
      });
    }
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
      
      toast({
        title: "Success",
        description: "Academic year updated successfully",
      });
      
      setEditAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
      setSelectedAcademicYear(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update academic year",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAcademicYear = async () => {
    if (!selectedAcademicYear) return;

    try {
      await deleteAcademicYearMutation.mutateAsync(selectedAcademicYear.academic_year_id);
      
      toast({
        title: "Success",
        description: "Academic year deleted successfully",
      });
      
      setSelectedAcademicYear(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete academic year",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (academicYear: UIAcademicYearRow) => {
    setSelectedAcademicYear(academicYear);
    setEditAcademicYear({
      year_name: academicYear.year_name,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      is_active: academicYear.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (academicYear: UIAcademicYearRow) => {
    setSelectedAcademicYear(academicYear);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table
  const columns: ColumnDef<UIAcademicYearRow>[] = useMemo(() => [
    createIconTextColumn<UIAcademicYearRow>('year_name', { header: 'Academic Year', icon: Calendar }),
    createDateColumn<UIAcademicYearRow>('start_date', { header: 'Start Date' }),
    createDateColumn<UIAcademicYearRow>('end_date', { header: 'End Date' }),
    createBadgeColumn<UIAcademicYearRow>('is_active', { header: 'Status', variant: 'outline', fallback: 'Inactive' }),
  ], [handleEditClick, handleDeleteClick]);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (academicYear: UIAcademicYearRow) => handleEditClick(academicYear)
    },
    {
      type: 'delete' as const,
      onClick: (academicYear: UIAcademicYearRow) => handleDeleteClick(academicYear)
    }
  ], [handleEditClick, handleDeleteClick]);

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Failed to load academic years</p>
      </div>
    );
  }

  if (academicYearsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={academicYears as UIAcademicYearRow[]}
        columns={columns}
        title="Academic Years"
        searchKey="year_name"
        exportable={true}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonText="Add Academic Year"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Academic Year Dialog */}
      <FormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Academic Year"
        description="Create a new academic year"
        onSave={handleCreateAcademicYear}
        onCancel={() => {
          setIsAddDialogOpen(false);
          setNewAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
        }}
        saveText="Create Academic Year"
        cancelText="Cancel"
        disabled={createAcademicYearMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year_name">Academic Year Name</Label>
            <Input
              id="year_name"
              value={newAcademicYear.year_name}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, year_name: e.target.value })}
              placeholder="e.g., 2024-25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={newAcademicYear.start_date}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={newAcademicYear.end_date}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, end_date: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={newAcademicYear.is_active}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, is_active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active">Mark as active year</Label>
          </div>
        </div>
      </FormDialog>

      {/* Edit Academic Year Dialog */}
      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Academic Year"
        description="Update academic year information"
        onSave={handleUpdateAcademicYear}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setEditAcademicYear({ year_name: '', start_date: '', end_date: '', is_active: false });
          setSelectedAcademicYear(null);
        }}
        saveText="Update Academic Year"
        cancelText="Cancel"
        disabled={updateAcademicYearMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_year_name">Academic Year Name</Label>
            <Input
              id="edit_year_name"
              value={editAcademicYear.year_name}
              onChange={(e) => setEditAcademicYear({ ...editAcademicYear, year_name: e.target.value })}
              placeholder="e.g., 2024-25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_start_date">Start Date</Label>
            <Input
              id="edit_start_date"
              type="date"
              value={editAcademicYear.start_date}
              onChange={(e) => setEditAcademicYear({ ...editAcademicYear, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_end_date">End Date</Label>
            <Input
              id="edit_end_date"
              type="date"
              value={editAcademicYear.end_date}
              onChange={(e) => setEditAcademicYear({ ...editAcademicYear, end_date: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={editAcademicYear.is_active}
              onChange={(e) => setEditAcademicYear({ ...editAcademicYear, is_active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="edit_is_active">Mark as active year</Label>
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Academic Year"
        description={`Are you sure you want to delete the academic year "${selectedAcademicYear?.year_name}"? This action cannot be undone and may affect related data.`}
        onConfirm={handleDeleteAcademicYear}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAcademicYear(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default AcademicYearManagement;