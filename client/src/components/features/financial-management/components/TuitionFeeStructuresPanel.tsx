import { useMemo, useState } from "react";
import { useClasses, useCreateTuitionFeeStructure, useTuitionFeeStructures, useUpdateTuitionFeeStructure } from "@/lib/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus } from "lucide-react";
import { useFormState } from "@/lib/hooks/common/useFormState";
import { DataTableWithFilters, FormDialog } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createCurrencyColumn,
  createActionColumn,
  createEditAction
} from "@/lib/utils/columnFactories.tsx";

export const TuitionFeeStructuresPanel = () => {
  const { data: classes = [] } = useClasses();
  const { data: structures = [] } = useTuitionFeeStructures();
  const createMutation = useCreateTuitionFeeStructure();
  const updateMutation = useUpdateTuitionFeeStructure();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Using shared form state management
  const {
    formData,
    setFormData,
    resetForm: resetFormState,
    updateField,
  } = useFormState({
    initialData: {
      classId: "",
      bookFee: "",
      tuitionFee: "",
    }
  });

  const classIdToName = useMemo(() => Object.fromEntries(classes.map(c => [String(c.class_id), c.class_name])), [classes]);

  const resetForm = () => {
    setEditId(null);
    resetFormState();
  };

  const onSubmit = async () => {
    const payload = {
      class_id: Number(formData.classId),
      book_fee: Number(formData.bookFee || 0),
      tuition_fee: Number(formData.tuitionFee || 0),
    };
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, payload: { book_fee: payload.book_fee, tuition_fee: payload.tuition_fee } });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setOpen(false);
    resetForm();
  };

  const startCreate = () => {
    resetForm();
    setOpen(true);
  };

  const startEdit = (s: any) => {
    setEditId(s.fee_structure_id);
    setFormData({
      classId: String(s.class_id),
      bookFee: String(s.book_fee),
      tuitionFee: String(s.tuition_fee),
    });
    setOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<any>[] = useMemo(() => [
    createTextColumn<any>("class_name", { 
      header: "Class",
      className: "font-medium"
    }),
    createCurrencyColumn<any>("book_fee", { header: "Book Fee" }),
    createCurrencyColumn<any>("tuition_fee", { header: "Tuition Fee" }),
    createActionColumn<any>([
      createEditAction((row) => startEdit(row))
    ])
  ], [classIdToName]);

  return (
    <div className="space-y-4">
      <DataTableWithFilters
        data={structures}
        columns={columns}
        title="Tuition Fee Structures"
        description="Manage per-class tuition and book fees"
        searchKey="class_name"
        exportable={true}
        onAdd={startCreate}
      />

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tuition Fee Structure" : "New Tuition Fee Structure"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={formData.classId} onValueChange={(value) => updateField('classId', value)} disabled={!!editId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.class_id} value={String(c.class_id)}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Book Fee</Label>
              <Input type="number" value={formData.bookFee} onChange={(e) => updateField('bookFee', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tuition Fee</Label>
              <Input type="number" value={formData.tuitionFee} onChange={(e) => updateField('tuitionFee', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={onSubmit} disabled={!formData.classId}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};