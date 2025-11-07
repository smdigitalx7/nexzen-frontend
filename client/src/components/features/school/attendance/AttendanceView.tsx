import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/components/shared/Dropdowns';
import { useSchoolAttendance, useUpdateSchoolAttendance, useDeleteSchoolAttendance, useSchoolAttendanceAllStudents, useSchoolSectionsByClass } from '@/lib/hooks/school';
import { useToast } from '@/hooks/use-toast';
import { SchoolStudentAttendanceService } from '@/lib/services/school';
import type { SchoolStudentAttendanceMonthlyGroupedResponse, SchoolClassRead, SchoolSectionRead } from '@/lib/types/school';
import { useQueryClient } from '@tanstack/react-query';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const queryClient = useQueryClient();
  const deleteAttendanceMutation = useDeleteSchoolAttendance();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { data: sections = [] } = useSchoolSectionsByClass(selectedClassId || 0);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const month = selectedDate ? selectedDate.getMonth() + 1 : undefined;
  const year = selectedDate ? selectedDate.getFullYear() : undefined;
  const attendeeParams = selectedClassId ? { class_id: selectedClassId, section_id: selectedSectionId || undefined, month, year } : null;
  const studentsQuery = useSchoolAttendanceAllStudents(attendeeParams);
  const grouped: SchoolStudentAttendanceMonthlyGroupedResponse = studentsQuery.data || { groups: [] };
  const allStudents = ((grouped as any)?.groups?.[0]?.data as any[]) || [];
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any | null>(null);
  const viewQuery = useSchoolAttendance(viewingRow?.attendance_id ?? null);

  const isLoading = studentsQuery.isLoading;
  const hasError = studentsQuery.isError;
  const errorMessage = ((studentsQuery.error as any)?.message) || undefined;


  const handleView = (row: any) => {
    setViewingRow(row);
    setViewOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditingRow(row);
    setEditAbsent(String(row.absent_days));
    setEditRemarks(row.remarks ?? '');
    setEditOpen(true);
  };

  const handleDelete = (row: any) => {
    setRowToDelete(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete?.attendance_id) {
      toast({ title: 'Not found', description: 'No attendance record to delete', variant: 'destructive' });
      return;
    }
    try {
      await deleteAttendanceMutation.mutateAsync(rowToDelete.attendance_id);
      
      // Cache invalidation handled by mutation hook
      setDeleteOpen(false);
      setRowToDelete(null);
    } catch {
      // Error toast is handled by mutation hook
    }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'admission_no', header: 'Admission No' },
    { accessorKey: 'roll_number', header: 'Roll' },
    { accessorKey: 'student_name', header: 'Student' },
    { accessorKey: 'section_name', header: 'Section' },
    { accessorKey: 'total_working_days', header: 'Working Days' },
    { accessorKey: 'present_days', header: 'Present' },
    { accessorKey: 'absent_days', header: 'Absent' },
  ];

  return (
    <>
      <CardContent>
        {/* Filters & Actions Bar */}
        <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
          <SchoolClassDropdown
            value={selectedClassId}
            onChange={(value) => {
              setSelectedClassId(value);
              setSelectedSectionId(null); // Reset section when class changes
            }}
            placeholder="Select class"
            className="w-[160px]"
          />
          <SchoolSectionDropdown
            classId={selectedClassId || 0}
            value={selectedSectionId}
            onChange={(value) => setSelectedSectionId(value)}
            disabled={!selectedClassId}
            placeholder={selectedClassId ? "All Sections" : "Select class first"}
            className="w-[160px]"
            emptyValue
            emptyValueLabel="All Sections"
          />
          <Select value={month ? String(month) : ''} onValueChange={(v) => { const m = parseInt(v); const d = selectedDate || new Date(); setSelectedDate(new Date(d.getFullYear(), m - 1, d.getDate())); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {hasError ? (
          <div className="py-6 text-center text-red-600">{errorMessage || 'Failed to load data'}</div>
        ) : isLoading ? (
          <div className="py-6 text-center text-slate-500">Loading...</div>
        ) : allStudents.length === 0 ? (
          <div className="py-6 text-center text-slate-500">No Students Attendance to display</div>
        ) : (
          <EnhancedDataTable 
            data={allStudents} 
            columns={columns}
            title="Attendance"
            exportable={true}
            showSearch={true}
            searchPlaceholder="Search by admission, roll, name, or section..."
            showActions={true}
            actionButtonGroups={[
              { type: 'view', onClick: handleView },
              { type: 'edit', onClick: handleEdit },
              // { type: 'delete', onClick: handleDelete },
            ]}
          />
        )}
      </CardContent>
    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {viewQuery.isLoading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : viewQuery.isError ? (
            <div className="text-sm text-red-600">Failed to load attendance</div>
          ) : viewQuery.data ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Admission No</span><span className="font-medium">{viewQuery.data.admission_no}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Student</span><span className="font-medium">{viewQuery.data.student_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Roll</span><span className="font-medium">{viewQuery.data.roll_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Section</span><span className="font-medium">{viewQuery.data.section_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Working Days</span><span className="font-medium">{viewQuery.data.total_working_days}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Present</span><span className="font-medium">{viewQuery.data.present_days}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Absent</span><span className="font-medium">{viewQuery.data.absent_days}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Remarks</span><span className="font-medium">{viewQuery.data.remarks || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Month</span><span className="font-medium">{monthNames[viewQuery.data.attendance_month - 1]} / {viewQuery.data.attendance_year}</span></div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No data.</div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Absent Days</Label>
            <Input type="number" value={editAbsent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditAbsent(e.target.value)} />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={editRemarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditRemarks(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!editingRow?.attendance_id) { toast({ title: 'Not found', description: 'No attendance record to update', variant: 'destructive' }); return; }
              const absent = parseInt(editAbsent) || 0;
              const working = editingRow?.total_working_days || 0;
              if (absent < 0) {
                toast({ title: 'Invalid values', description: 'Absent days cannot be negative', variant: 'destructive' });
                return;
              }
              if (absent > working) {
                toast({ title: 'Invalid totals', description: `Absent days (${absent}) cannot exceed Working Days (${working})`, variant: 'destructive' });
                return;
              }
              try {
                // Use service directly with cache invalidation
                await SchoolStudentAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                
                // Invalidate cache to refresh the list
                void queryClient.invalidateQueries({ queryKey: ["school", "attendance"] });
                
                toast({ title: 'Updated', description: 'Attendance updated', variant: 'success' });
                setEditOpen(false);
              } catch (err: unknown) {
                const serverMsg = (err as any)?.response?.data?.detail || (err as any)?.message || 'Failed to update attendance';
                toast({ title: 'Error', description: serverMsg, variant: 'destructive' });
              }
            }}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete attendance record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the attendance record for {rowToDelete?.student_name || 'this student'}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
