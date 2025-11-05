import { useMemo, useState, useEffect, memo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Edit, Trash2 } from "lucide-react";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass, useCreateSchoolSection, useUpdateSchoolSection, useDeleteSchoolSection } from "@/lib/hooks/school/use-school-sections";
import type { SchoolSectionRead, SchoolClassRead } from "@/lib/types/school";

// Initial form state
const initialSectionForm = { 
  section_name: "", 
  current_enrollment: 0 
};

const SectionsTabComponent = () => {
  const { data: classes = [] } = useSchoolClasses();
  
  // State management
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SchoolSectionRead | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SchoolSectionRead | null>(null);
  const [newSection, setNewSection] = useState(initialSectionForm);
  const [editSection, setEditSection] = useState(initialSectionForm);

  // Data fetching - only fetch when a class is selected
  const { data: sections = [], isLoading } = useSchoolSectionsByClass(selectedClassId);

  // Hooks
  const createSection = useCreateSchoolSection((selectedClassId || 0) as number);
  const updateSection = useUpdateSchoolSection((selectedClassId || 0) as number, selectedSection?.section_id || 0);
  const deleteSection = useDeleteSchoolSection((selectedClassId || 0) as number);

  // Memoized validation functions
  const validateSectionForm = useCallback((form: typeof initialSectionForm) => {
    if (!form.section_name.trim()) {
      return false;
    }

    if (form.current_enrollment < 0) {
      return false;
    }

    return true;
  }, []);

  // Memoized mutation handlers
  const handleCreateSection = useCallback(async () => {
    if (!validateSectionForm(newSection)) return;

    try {
      await createSection.mutateAsync({
        section_name: newSection.section_name.trim(),
        current_enrollment: Number(newSection.current_enrollment) || 0,
        is_active: true,
      });
      
      setNewSection(initialSectionForm);
      setIsAddOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [newSection, validateSectionForm, createSection]);

  const handleUpdateSection = useCallback(async () => {
    if (!validateSectionForm(editSection) || !selectedSection) return;

    try {
      await updateSection.mutateAsync({
        section_name: editSection.section_name.trim(),
        current_enrollment: Number(editSection.current_enrollment) || 0,
      });
      
      setIsEditOpen(false);
      setSelectedSection(null);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [editSection, selectedSection, validateSectionForm, updateSection]);

  // Memoized columns definition
  const columns: ColumnDef<SchoolSectionRead>[] = useMemo(() => [
    { accessorKey: "section_name", header: "Section Name" },
    { accessorKey: "current_enrollment", header: "Current Enrollment" },
    { accessorKey: "is_active", header: "Active" }
  ], []);

  // Memoized action handlers
  const handleEditClick = useCallback((row: SchoolSectionRead) => {
    setSelectedSection(row);
    setEditSection({
      section_name: row.section_name,
      current_enrollment: row.current_enrollment,
    });
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((row: SchoolSectionRead) => {
    setSectionToDelete(row);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteSection = useCallback(async () => {
    if (!sectionToDelete || !selectedClassId) return;

    try {
      await deleteSection.mutateAsync(sectionToDelete.section_id);
      setIsDeleteDialogOpen(false);
      setSectionToDelete(null);
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [sectionToDelete, selectedClassId, deleteSection]);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSectionToDelete(null);
  }, []);

  const handleClassChange = useCallback((value: string) => {
    if (value === "all" || !value) {
      setSelectedClassId(undefined);
    } else {
      const classId = parseInt(value);
      if (!isNaN(classId)) {
    setSelectedClassId(classId);
      }
    }
  }, []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: handleEditClick
    },
    {
      type: 'delete' as const,
      onClick: handleDeleteClick
    }
  ], [handleEditClick, handleDeleteClick]);

  // Memoized dialog close handlers
  const closeAddDialog = useCallback(() => {
    setIsAddOpen(false);
    setNewSection(initialSectionForm);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditOpen(false);
    setSelectedSection(null);
  }, []);

  // Memoized form update handlers
  const updateNewSection = useCallback((field: keyof typeof initialSectionForm, value: string | number) => {
    setNewSection(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateEditSection = useCallback((field: keyof typeof initialSectionForm, value: string | number) => {
    setEditSection(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Class:</label>
          <Select
            value={selectedClassId ? selectedClassId.toString() : "all"}
            onValueChange={handleClassChange}
        >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
          {classes.map((c: SchoolClassRead) => (
                <SelectItem
                  key={c.class_id}
                  value={c.class_id.toString()}
                >
                  {c.class_name}
                </SelectItem>
          ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please select a class to view sections
        </div>
      ) : (
          <EnhancedDataTable
          data={sections}
          columns={columns}
          title="Sections"
          searchKey="section_name"
          exportable={true}
          onAdd={() => setIsAddOpen(true)}
          addButtonText="Add Section"
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
        />
      )}

      <FormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Section"
        description="Create a new section in this class"
        onSave={handleCreateSection}
        onCancel={closeAddDialog}
        saveText="Create Section"
        cancelText="Cancel"
        disabled={createSection.isPending || !selectedClassId}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section_name">Section Name</Label>
            <Input 
              id="section_name" 
              value={newSection.section_name} 
              onChange={(e) => updateNewSection('section_name', e.target.value)} 
              placeholder="Enter section name" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_enrollment">Current Enrollment</Label>
            <Input 
              id="current_enrollment" 
              type="number" 
              value={newSection.current_enrollment} 
              onChange={(e) => updateNewSection('current_enrollment', Number(e.target.value))} 
              placeholder="0" 
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Section"
        description="Update section details"
        onSave={handleUpdateSection}
        onCancel={closeEditDialog}
        saveText="Update Section"
        cancelText="Cancel"
        disabled={updateSection.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_section_name">Section Name</Label>
            <Input 
              id="edit_section_name" 
              value={editSection.section_name} 
              onChange={(e) => updateEditSection('section_name', e.target.value)} 
              placeholder="Enter section name" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_current_enrollment">Current Enrollment</Label>
            <Input 
              id="edit_current_enrollment" 
              type="number" 
              value={editSection.current_enrollment} 
              onChange={(e) => updateEditSection('current_enrollment', Number(e.target.value))} 
              placeholder="0" 
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Section"
        description={`Are you sure you want to delete the section "${sectionToDelete?.section_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteSection}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export const SectionsTab = SectionsTabComponent;