import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useCollegeAttendance, useUpdateCollegeAttendance, useDeleteCollegeAttendance, useCollegeClasses, useCollegeClassGroups } from '@/lib/hooks/college';
import { useToast } from '@/hooks/use-toast';
import { CollegeAttendanceService } from '@/lib/services/college';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CollegeClassResponse, CollegeGroupResponse } from '@/lib/types/college';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const queryClient = useQueryClient();
  const deleteAttendanceMutation = useDeleteCollegeAttendance();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const classesQuery = useCollegeClasses();
  const classes = (classesQuery.data as any[]) || [];
  const firstClassId = classes.length > 0 ? (classes[0]?.class_id as number | undefined) : undefined;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(firstClassId);
  const { data: classGroups } = useCollegeClassGroups(selectedClassId as number);
  const groups = (classGroups as any)?.groups || [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const month = selectedDate ? selectedDate.getMonth() + 1 : undefined;
  const year = selectedDate ? selectedDate.getFullYear() : undefined;
  const studentsQuery = useQuery({
    queryKey: ['college-attendance-all', selectedClassId, selectedGroupId, month, year],
    queryFn: () => CollegeAttendanceService.getAll({ class_id: selectedClassId as number, group_id: selectedGroupId as number, year: year ?? null, month: month ?? null }),
    enabled: !!selectedClassId && !!selectedGroupId,
  });
  const groupedData = (studentsQuery.data as any[]) || [];
  const allStudents = (groupedData?.[0]?.attendance?.[0]?.students as any[]) || [];
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<any | null>(null);
  const viewQuery = useCollegeAttendance(viewingRow?.attendance_id ?? null);

  const isLoading = classesQuery.isLoading || studentsQuery.isLoading;
  const hasError = classesQuery.isError || studentsQuery.isError;
  const errorMessage = ((classesQuery.error as any)?.message) || ((studentsQuery.error as any)?.message) || undefined;

  const markAttendance = async (studentId: number, status: string) => {
    if (!selectedClassId) {
      toast({ title: 'Error', description: 'Please select a class first', variant: 'destructive' });
      return;
    }
    const student = (allStudents).find((s) => s.student_id === studentId);
    if (!student?.attendance_id) {
      toast({ title: 'No record', description: 'Initialize month in Create tab first', variant: 'destructive' });
      return;
    }
    const nextAbsent = (student.absent_days ?? 0) + (status === 'absent' ? 1 : -1);
    try {
      // Use service directly with cache invalidation
      await CollegeAttendanceService.update(student.attendance_id, { absent_days: Math.max(0, nextAbsent) });
      
      // Invalidate cache to refresh the list
      void queryClient.invalidateQueries({ queryKey: ["college", "attendance"] });
    } catch {
      toast({ title: 'Error', description: 'Failed to update attendance', variant: 'destructive' });
    }
  };

  const handleView = (row: any) => {
    setViewingRow(row);
    setViewOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditingRow(row);
    setEditAbsent(String(row.absent_days ?? 0));
    setEditRemarks(row.remarks ?? '');
    setEditOpen(true);
  };

  const handleDelete = (row: any) => {
    setEditingRow(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingRow?.attendance_id) {
      toast({ title: 'Not found', description: 'No attendance record to delete', variant: 'destructive' });
      return;
    }
    try {
      await deleteAttendanceMutation.mutateAsync(editingRow.attendance_id);
      setDeleteOpen(false);
      setEditingRow(null);
    } catch {
      // Error toast is handled by mutation hook
    }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'admission_no', header: 'Admission No' },
    { accessorKey: 'roll_number', header: 'Roll' },
    { accessorKey: 'student_name', header: 'Student' },
    { accessorKey: 'group_name', header: 'Group' },
    { accessorKey: 'total_working_days', header: 'Working Days', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'present_days', header: 'Present', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'absent_days', header: 'Absent', cell: ({ getValue }) => (getValue<number>() ?? 0) },
  ];

  return (
    <>
      <CardContent>
        {/* Filters & Actions Bar */}
        <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
          <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={(v) => setSelectedClassId(parseInt(v))}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c: CollegeClassResponse) => (<SelectItem key={c.class_id} value={String(c.class_id)}>{c.class_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedGroupId ? String(selectedGroupId) : ''} onValueChange={(v) => setSelectedGroupId(parseInt(v))}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Group" /></SelectTrigger>
            <SelectContent>
              {(groups as CollegeGroupResponse[]).map((g: CollegeGroupResponse) => (<SelectItem key={g.group_id} value={String(g.group_id)}>{g.group_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={month ? String(month) : ''} onValueChange={(v) => { const m = parseInt(v); const d = selectedDate || new Date(); setSelectedDate(new Date(d.getFullYear(), m - 1, d.getDate())); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {hasError ? (
          <div className="py-6 text-center text-red-600">{errorMessage || 'Failed to load data'}</div>
        ) : classes.length === 0 ? (
          <div className="py-6 text-center text-slate-500">No classes available</div>
        ) : isLoading ? (
          <div className="py-6 text-center text-slate-500">Loading...</div>
        ) : allStudents.length === 0 ? (
          <div className="py-6 text-center text-slate-500">No students to display</div>
        ) : (
          <EnhancedDataTable 
            data={allStudents} 
            columns={columns}
            title="Attendance"
            exportable={true}
            showSearch={true}
            searchPlaceholder="Search by admission, roll, name, or group..."
            showActions={true}
            actionButtonGroups={[
              { type: 'view', onClick: handleView },
              { type: 'edit', onClick: handleEdit },
              { type: 'delete', onClick: handleDelete },
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
              <div className="flex justify-between"><span className="text-slate-600">Working Days</span><span className="font-medium">{viewQuery.data.total_working_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Present</span><span className="font-medium">{viewQuery.data.present_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Absent</span><span className="font-medium">{viewQuery.data.absent_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Remarks</span><span className="font-medium">{viewQuery.data.remarks || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Month</span><span className="font-medium">{viewQuery.data.attendance_month ? `${viewQuery.data.attendance_month}` : '-'} / {viewQuery.data.attendance_year ? `${viewQuery.data.attendance_year}` : '-'}</span></div>
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
            <Input type="number" value={editAbsent} onChange={(e) => setEditAbsent(e.target.value)} />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!editingRow?.attendance_id) { toast({ title: 'Not found', description: 'No attendance record to update', variant: 'destructive' }); return; }
              const absent = parseInt(editAbsent) || 0;
              const working = editingRow?.total_working_days ?? 0;
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
                await CollegeAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                
                // Invalidate cache to refresh the list
                void queryClient.invalidateQueries({ queryKey: ["college", "attendance"] });
                
                toast({ title: 'Updated', description: 'Attendance updated' });
                setEditOpen(false);
                setEditingRow(null);
                setEditAbsent("0");
                setEditRemarks("");
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
            This will remove the attendance record for {editingRow?.student_name || 'this student'}. This action cannot be undone.
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
