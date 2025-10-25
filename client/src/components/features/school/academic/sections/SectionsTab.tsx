import { useMemo, useState, useEffect, memo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Edit, Trash2 } from "lucide-react";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass, useCreateSchoolSection, useUpdateSchoolSection } from "@/lib/hooks/school/use-school-sections";
import type { SchoolSectionRead, SchoolClassRead } from "@/lib/types/school";
import { useToast } from "@/hooks/use-toast";

// Initial form state
const initialSectionForm = { 
  section_name: "", 
  current_enrollment: 0 
};

const SectionsTabComponent = () => {
  const { data: classes = [] } = useSchoolClasses();
  
  // Memoized initial class ID
  const initialClassId = useMemo(() => classes[0]?.class_id, [classes]);
  
  // State management
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(initialClassId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SchoolSectionRead | null>(null);
  const [newSection, setNewSection] = useState(initialSectionForm);
  const [editSection, setEditSection] = useState(initialSectionForm);

  // Auto-select first class when classes load
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].class_id);
    }
  }, [classes, selectedClassId]);

  // Data fetching
  const { data: sections = [], isLoading } = useSchoolSectionsByClass(selectedClassId as number);

  // Hooks
  const { toast } = useToast();
  const createSection = useCreateSchoolSection((selectedClassId || 0) as number);
  const updateSection = useUpdateSchoolSection((selectedClassId || 0) as number, selectedSection?.section_id || 0);

  // Memoized validation functions
  const validateSectionForm = useCallback((form: typeof initialSectionForm) => {
    if (!form.section_name.trim()) {
      toast({
        title: "Error",
        description: "Section name is required",
        variant: "destructive",
      });
      return false;
    }

    if (form.current_enrollment < 0) {
      toast({
        title: "Error",
        description: "Enrollment cannot be negative",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  // Memoized mutation handlers
  const handleCreateSection = useCallback(async () => {
    if (!validateSectionForm(newSection)) return;

    try {
      await createSection.mutateAsync({
        section_name: newSection.section_name.trim(),
        current_enrollment: Number(newSection.current_enrollment) || 0,
        is_active: true,
      });
      
      toast({ 
        title: "Success", 
        description: "Section created successfully" 
      });
      
      setNewSection(initialSectionForm);
      setIsAddOpen(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create section", 
        variant: "destructive" 
      });
    }
  }, [newSection, validateSectionForm, createSection, toast]);

  const handleUpdateSection = useCallback(async () => {
    if (!validateSectionForm(editSection) || !selectedSection) return;

    try {
      await updateSection.mutateAsync({
        section_name: editSection.section_name.trim(),
        current_enrollment: Number(editSection.current_enrollment) || 0,
      });
      
      toast({ 
        title: "Success", 
        description: "Section updated successfully" 
      });
      
      setIsEditOpen(false);
      setSelectedSection(null);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update section", 
        variant: "destructive" 
      });
    }
  }, [editSection, selectedSection, validateSectionForm, updateSection, toast]);

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

  const handleClassChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(parseInt(e.target.value));
  }, []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: handleEditClick
    }
  ], [handleEditClick]);

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
      <div className="flex items-center gap-3">
        <Label htmlFor="class_select">Class</Label>
        <select
          id="class_select"
          className="border rounded px-2 py-1"
          value={selectedClassId || ""}
          onChange={handleClassChange}
        >
          {classes.map((c: SchoolClassRead) => (
            <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
          ))}
        </select>
      </div>

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

      <FormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Section"
        description="Create a new section in this class"
        onSave={handleCreateSection}
        onCancel={closeAddDialog}
        saveText="Create Section"
        cancelText="Cancel"
        disabled={createSection.isPending}
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
    </div>
  );
};

export const SectionsTab = SectionsTabComponent;