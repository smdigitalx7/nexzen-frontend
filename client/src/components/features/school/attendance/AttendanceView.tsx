import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, X, Clock, Pencil, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSchoolAttendance } from '@/lib/hooks/school/use-school-attendance';
import { useToast } from '@/hooks/use-toast';
import { useSchoolClasses } from '@/lib/hooks/school/use-school-classes';
import { useSchoolSectionsByClass } from '@/lib/hooks/school/use-school-sections';
import { useSchoolAttendanceAllStudents } from '@/lib/hooks/school/use-school-attendance';
import { SchoolStudentAttendanceService } from '@/lib/services/school/student-attendance.service';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const classesQuery = useSchoolClasses();
  const classes = (classesQuery.data as any[]) || [];
  const firstClassId = classes.length > 0 ? (classes[0]?.class_id as number | undefined) : undefined;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(firstClassId);
  const { data: sections = [] } = useSchoolSectionsByClass(selectedClassId as number);
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);
  const month = selectedDate ? selectedDate.getMonth() + 1 : undefined;
  const year = selectedDate ? selectedDate.getFullYear() : undefined;
  const attendeeParams = selectedClassId ? { class_id: selectedClassId, section_id: selectedSectionId, month, year } : null;
  const studentsQuery = useSchoolAttendanceAllStudents(attendeeParams);
  const grouped: any = studentsQuery.data || { groups: [] };
  const allStudents = ((grouped as any)?.groups?.[0]?.data as any[]) || [];
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<any | null>(null);
  const viewQuery = useSchoolAttendance(viewingRow?.attendance_id ?? null);

  const isLoading = classesQuery.isLoading || studentsQuery.isLoading;
  const hasError = classesQuery.isError || studentsQuery.isError;
  const errorMessage = ((classesQuery.error as any)?.message) || ((studentsQuery.error as any)?.message) || undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4" />;
      case 'absent': return <X className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  const getStudentAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(r => r.student_id === studentId && r.date === selectedDate?.toISOString().split('T')[0]);
    return record?.status || 'unmarked';
  };
  const markAttendance = async (studentId: number, status: string) => {
    if (!selectedClassId) {
      toast({ title: 'Error', description: 'Please select a class first', variant: 'destructive' });
      return;
    }
    const student = (allStudents as any[]).find((s) => s.student_id === studentId);
    if (!student?.attendance_id) {
      toast({ title: 'No record', description: 'Initialize month in Create tab first', variant: 'destructive' });
      return;
    }
    const nextAbsent = (student.absent_days ?? 0) + (status === 'absent' ? 1 : -1);
    try {
      await SchoolStudentAttendanceService.update(student.attendance_id, { absent_days: Math.max(0, nextAbsent) });
      await studentsQuery.refetch();
      toast({ title: 'Updated', description: `${student.student_name} marked ${status}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update attendance', variant: 'destructive' });
    }
  };

  const filteredStudents = useMemo(() => (allStudents as any[])
    .filter((s) => (s?.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s?.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase())), [allStudents, searchTerm]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'roll_number', header: 'Roll' },
    { accessorKey: 'student_name', header: 'Student' },
    { accessorKey: 'total_working_days', header: 'Working Days', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'present_days', header: 'Present', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'absent_days', header: 'Absent', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { id: 'status', header: 'Status', cell: ({ row }) => { const s = getStudentAttendanceStatus(row.original.student_id); return (<div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s)}`}>{getStatusIcon(s)}<span className="capitalize">{s}</span></div>);} },
    { id: 'actions', header: 'Actions', cell: ({ row }) => {
        const student = row.original;
        return (
          <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="View attendance" onClick={() => { setViewingRow(student); setViewOpen(true); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Edit attendance" onClick={() => { setEditingRow(student); setEditAbsent(String(student.absent_days ?? 0)); setEditRemarks(student.remarks ?? ''); setEditOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive" aria-label="Delete attendance" onClick={() => { setEditingRow(student); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete attendance record?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the attendance record for {student.student_name}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    if (!student.attendance_id) { toast({ title: 'Not found', description: 'No attendance record to delete', variant: 'destructive' }); return; }
                    try {
                      await SchoolStudentAttendanceService.delete(student.attendance_id);
                      await studentsQuery.refetch();
                      toast({ title: 'Deleted', description: 'Attendance record removed' });
                    } catch {
                      toast({ title: 'Error', description: 'Failed to delete record', variant: 'destructive' });
                    }
                  }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          </TooltipProvider>
        );
      }
    },
  ];

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Attendance</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Manage attendance records, filters, and quick actions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="w-full md:w-72">
            <Input placeholder="Search by name or roll" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={(v) => setSelectedClassId(parseInt(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (<SelectItem key={c.class_id} value={String(c.class_id)}>{c.class_name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedSectionId ? String(selectedSectionId) : 'all'} onValueChange={(v) => setSelectedSectionId(v === 'all' ? undefined : parseInt(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(sections as any[]).map((s: any) => (<SelectItem key={s.section_id} value={String(s.section_id)}>{s.section_name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={month ? String(month) : ''} onValueChange={(v) => { const m = parseInt(v); const d = selectedDate || new Date(); setSelectedDate(new Date(d.getFullYear(), m - 1, d.getDate())); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>))}
              </SelectContent>
            </Select>
            
          </div>
        </div>

        <div className="overflow-x-auto">
          {hasError ? (<div className="py-6 text-center text-red-600">{errorMessage || 'Failed to load data'}</div>) : classes.length === 0 ? (<div className="py-6 text-center text-slate-500">No classes available</div>) : isLoading ? (<div className="py-6 text-center text-slate-500">Loading...</div>) : filteredStudents.length === 0 ? (<div className="py-6 text-center text-slate-500">No students to display</div>) : (
            <EnhancedDataTable data={filteredStudents} columns={columns} exportable={true} />
          )}
        </div>
      </CardContent>
    </Card>
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
              <div className="flex justify-between"><span className="text-slate-600">Attendance ID</span><span className="font-medium">{viewQuery.data.attendance_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Enrollment ID</span><span className="font-medium">{viewQuery.data.enrollment_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Admission No</span><span className="font-medium">{viewQuery.data.admission_no}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Student</span><span className="font-medium">{viewQuery.data.student_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Roll</span><span className="font-medium">{viewQuery.data.roll_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Section</span><span className="font-medium">{viewQuery.data.section_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Working Days</span><span className="font-medium">{viewQuery.data.total_working_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Present</span><span className="font-medium">{viewQuery.data.present_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Absent</span><span className="font-medium">{viewQuery.data.absent_days ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Remarks</span><span className="font-medium">{viewQuery.data.remarks || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Month</span><span className="font-medium">{typeof viewQuery.data.attendance_month === 'number' ? monthNames[(viewQuery.data.attendance_month as number) - 1] : '-'} / {viewQuery.data.attendance_year ?? '-'}</span></div>
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
                await SchoolStudentAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                await studentsQuery.refetch();
                toast({ title: 'Updated', description: 'Attendance updated' });
                setEditOpen(false);
              } catch (err: any) {
                const serverMsg = err?.response?.data?.detail || err?.message || 'Failed to update attendance';
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


