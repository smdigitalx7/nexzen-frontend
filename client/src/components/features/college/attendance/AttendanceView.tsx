import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { CollegeClassDropdown, CollegeGroupDropdown } from '@/components/shared/Dropdowns';
import { useCollegeAttendance, useCollegeClassGroups } from '@/lib/hooks/college';
import { useToast } from '@/hooks/use-toast';
import { CollegeAttendanceService } from '@/lib/services/college';
import { collegeKeys } from '@/lib/hooks/college/query-keys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CollegeClassResponse, CollegeGroupResponse } from '@/lib/types/college';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { data: classGroups } = useCollegeClassGroups(selectedClassId || 0);
  const groups = (classGroups as any)?.groups || [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
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
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<any | null>(null);
  const viewQuery = useCollegeAttendance(viewingRow?.attendance_id ?? null);

  const isLoading = studentsQuery.isLoading;
  const hasError = studentsQuery.isError;
  const errorMessage = ((studentsQuery.error as any)?.message) || undefined;

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
      // Update attendance via service
      await CollegeAttendanceService.update(student.attendance_id, { absent_days: Math.max(0, nextAbsent) });
      
      // Invalidate and refetch queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: collegeKeys.attendance.detail(student.attendance_id) });
      await queryClient.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
      await queryClient.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
      
      // Refetch the students list to show updated data
      await studentsQuery.refetch();
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

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'admission_no', header: 'Admission No' },
    { accessorKey: 'roll_number', header: 'Roll' },
    { accessorKey: 'student_name', header: 'Student' },
    { accessorKey: 'total_working_days', header: 'Working Days', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'present_days', header: 'Present', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'absent_days', header: 'Absent', cell: ({ getValue }) => (getValue<number>() ?? 0) },
  ];

  return (
    <>
      <CardContent>
        {/* Filters & Actions Bar */}
        <div className="flex flex-wrap items-center justify-start gap-2 mb-2">
          <CollegeClassDropdown
            value={selectedClassId}
            onChange={(value) => {
              setSelectedClassId(value);
              setSelectedGroupId(null); // Reset group when class changes
            }}
            placeholder="Select class"
            className="w-[160px]"
            required={true}
            emptyValue={true}
            emptyValueLabel="Select class"
          />
          {selectedClassId && (
            <CollegeGroupDropdown
              classId={selectedClassId}
              value={selectedGroupId}
              onChange={(value) => setSelectedGroupId(value)}
              disabled={!selectedClassId}
              placeholder="All Groups"
              className="w-[160px]"
              emptyValue
              emptyValueLabel="All Groups"
            />
          )}
          <Select value={month ? String(month) : ''} onValueChange={(v) => { const m = parseInt(v); const d = selectedDate || new Date(); setSelectedDate(new Date(d.getFullYear(), m - 1, d.getDate())); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {!selectedClassId || !selectedGroupId ? (
          <Alert className="mb-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please select a class and group first to view attendance records.
            </AlertDescription>
          </Alert>
        ) : hasError ? (
          <div className="py-4 text-center text-red-600">{errorMessage || 'Failed to load data'}</div>
        ) : isLoading ? (
          <div className="py-4 text-center text-slate-500">Loading...</div>
        ) : allStudents.length === 0 ? (
          <div className="py-4 text-center text-slate-500">No students to display</div>
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
            ]}
          />
        )}
      </CardContent>
    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {viewQuery.isLoading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : viewQuery.isError ? (
            <div className="text-sm text-red-600">Failed to load attendance</div>
          ) : viewQuery.data ? (
            <div className="space-y-1 text-sm">
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
        <div className="space-y-2">
          <div>
            <Label>Absent Days</Label>
            <Input type="number" value={editAbsent} onChange={(e) => setEditAbsent(e.target.value)} />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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
                // Update attendance via service
                await CollegeAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                
                // Invalidate and refetch queries to refresh the UI
                await queryClient.invalidateQueries({ queryKey: collegeKeys.attendance.detail(editingRow.attendance_id) });
                await queryClient.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
                await queryClient.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
                
                // Refetch the students list to show updated data
                await studentsQuery.refetch();
                
                toast({ title: 'Updated', description: 'Attendance updated', variant: 'success' });
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
    </>
  );
}
