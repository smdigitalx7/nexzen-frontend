import { useMemo, useState } from "react";
import { useClasses, useCreateTuitionFeeStructure, useTuitionFeeStructures, useUpdateTuitionFeeStructure } from "@/lib/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus } from "lucide-react";

export const TuitionFeeStructuresPanel = () => {
  const { data: classes = [] } = useClasses();
  const { data: structures = [] } = useTuitionFeeStructures();
  const createMutation = useCreateTuitionFeeStructure();
  const updateMutation = useUpdateTuitionFeeStructure();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [bookFee, setBookFee] = useState<string>("");
  const [tuitionFee, setTuitionFee] = useState<string>("");

  const classIdToName = useMemo(() => Object.fromEntries(classes.map(c => [String(c.class_id), c.class_name])), [classes]);

  const resetForm = () => {
    setEditId(null);
    setClassId("");
    setBookFee("");
    setTuitionFee("");
  };

  const onSubmit = async () => {
    const payload = {
      class_id: Number(classId),
      book_fee: Number(bookFee || 0),
      tuition_fee: Number(tuitionFee || 0),
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
    setClassId(String(s.class_id));
    setBookFee(String(s.book_fee));
    setTuitionFee(String(s.tuition_fee));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tuition Fee Structures</h2>
          <p className="text-muted-foreground">Manage per-class tuition and book fees</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Tuition Fee Structure" : "New Tuition Fee Structure"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId} disabled={!!editId}>
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
                <Input type="number" value={bookFee} onChange={(e) => setBookFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tuition Fee</Label>
                <Input type="number" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={onSubmit} disabled={!classId}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Book Fee</TableHead>
              <TableHead>Tuition Fee</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {structures.map((s: any) => (
              <TableRow key={s.fee_structure_id}>
                <TableCell>{classIdToName[String(s.class_id)] || s.class_id}</TableCell>
                <TableCell>{s.book_fee}</TableCell>
                <TableCell>{s.tuition_fee}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


