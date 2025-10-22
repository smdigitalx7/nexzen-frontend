import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Edit, Trash2 } from "lucide-react";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass, useCreateSchoolSection, useUpdateSchoolSection } from "@/lib/hooks/school/use-school-sections";
import type { SchoolSectionRead } from "@/lib/types/school";
import { useToast } from "@/hooks/use-toast";

export const SectionsTab = () => {
  const { data: classes = [] } = useSchoolClasses();
  const initialClassId = classes[0]?.class_id as number | undefined;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(initialClassId);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].class_id);
    }
  }, [classes, selectedClassId]);

  const { data: sections = [], isLoading } = useSchoolSectionsByClass(selectedClassId as number);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SchoolSectionRead | null>(null);
  const [newSection, setNewSection] = useState({ section_name: "", current_enrollment: 0 });
  const [editSection, setEditSection] = useState({ section_name: "", current_enrollment: 0 });

  const { toast } = useToast();
  const createSection = useCreateSchoolSection((selectedClassId || 0) as number);
  const updateSection = useUpdateSchoolSection((selectedClassId || 0) as number, selectedSection?.section_id || 0);

  const columns: ColumnDef<SchoolSectionRead>[] = useMemo(() => [
    { accessorKey: "section_id", header: "Section ID" },
    { accessorKey: "section_name", header: "Section Name" },
    { accessorKey: "current_enrollment", header: "Current Enrollment" },
    { accessorKey: "is_active", header: "Active" }
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: SchoolSectionRead) => {
        setSelectedSection(row);
        setEditSection({
          section_name: row.section_name,
          current_enrollment: row.current_enrollment,
        });
        setIsEditOpen(true);
      }
    }
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="class_select">Class</Label>
        <select
          id="class_select"
          className="border rounded px-2 py-1"
          value={selectedClassId || ""}
          onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
        >
          {classes.map((c: any) => (
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
        onSave={async () => {
          try {
            await createSection.mutateAsync({
              section_name: newSection.section_name.trim(),
              current_enrollment: Number(newSection.current_enrollment) || 0,
              is_active: true,
            });
            toast({ title: "Success", description: "Section created" });
            setNewSection({ section_name: "", current_enrollment: 0 });
            setIsAddOpen(false);
          } catch {
            toast({ title: "Error", description: "Failed to create section", variant: "destructive" });
          }
        }}
        onCancel={() => {
          setIsAddOpen(false);
          setNewSection({ section_name: "", current_enrollment: 0 });
        }}
        saveText="Create Section"
        cancelText="Cancel"
        disabled={createSection.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section_name">Section Name</Label>
            <Input id="section_name" value={newSection.section_name} onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })} placeholder="Enter section name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_enrollment">Current Enrollment</Label>
            <Input id="current_enrollment" type="number" value={newSection.current_enrollment} onChange={(e) => setNewSection({ ...newSection, current_enrollment: Number(e.target.value) })} placeholder="0" />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Section"
        description="Update section details"
        onSave={async () => {
          if (!selectedSection) return;
          try {
            await updateSection.mutateAsync({
              section_name: editSection.section_name.trim(),
              current_enrollment: Number(editSection.current_enrollment) || 0,
            });
            toast({ title: "Success", description: "Section updated" });
            setIsEditOpen(false);
            setSelectedSection(null);
          } catch {
            toast({ title: "Error", description: "Failed to update section", variant: "destructive" });
          }
        }}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedSection(null);
        }}
        saveText="Update Section"
        cancelText="Cancel"
        disabled={updateSection.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_section_name">Section Name</Label>
            <Input id="edit_section_name" value={editSection.section_name} onChange={(e) => setEditSection({ ...editSection, section_name: e.target.value })} placeholder="Enter section name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_current_enrollment">Current Enrollment</Label>
            <Input id="edit_current_enrollment" type="number" value={editSection.current_enrollment} onChange={(e) => setEditSection({ ...editSection, current_enrollment: Number(e.target.value) })} placeholder="0" />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};