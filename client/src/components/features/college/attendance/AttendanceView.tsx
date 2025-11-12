import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MonthYearFilter } from '@/components/shared';
import { CollegeClassDropdown, CollegeGroupDropdown } from '@/components/shared/Dropdowns';
import { useCollegeAttendance, useCollegeClassGroups } from '@/lib/hooks/college';
import { useToast } from '@/hooks/use-toast';
import { CollegeAttendanceService } from '@/lib/services/college';
import { collegeKeys } from '@/lib/hooks/college/query-keys';
import { useQuery } from '@tanstack/react-query';
import { invalidateAndRefetch } from '@/lib/hooks/common/useGlobalRefetch';
import { Info } from 'lucide-react';
import type { CollegeStudentAttendanceRead } from '@/lib/types/college/attendance';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  // Initialize with current month/year (required parameters)
  const now = new Date();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { data: classGroups } = useCollegeClassGroups(selectedClassId || 0);
  const groups = (classGroups as any)?.groups || [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  
  // Build query params - class_id, group_id, month, and year are required
  const attendanceParams = useMemo(() => {
    if (!selectedClassId || !selectedGroupId) return null;
    return {
      class_id: selectedClassId,
      group_id: selectedGroupId,
      month: selectedMonth,
      year: selectedYear,
    };
  }, [selectedClassId, selectedGroupId, selectedMonth, selectedYear]);
  
  const studentsQuery = useQuery({
    queryKey: ['college-attendance-all', attendanceParams],
    queryFn: () => CollegeAttendanceService.getAll(attendanceParams!),
    enabled: !!attendanceParams,
  });
  const groupedData = (studentsQuery.data as any[]) || [];
  const allStudents = (groupedData?.[0]?.attendance?.[0]?.students as any[]) || [];
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CollegeStudentAttendanceRead | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<CollegeStudentAttendanceRead | null>(null);
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
      
      // Invalidate and refetch queries using debounced utility (prevents UI freeze)
      invalidateAndRefetch(collegeKeys.attendance.root());
      
      // Refetch the students list to show updated data
      await studentsQuery.refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to update attendance', variant: 'destructive' });
    }
  };

  const handleView = (row: CollegeStudentAttendanceRead) => {
    setViewingRow(row);
    setViewOpen(true);
  };

  const handleEdit = (row: CollegeStudentAttendanceRead) => {
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
        {/* Unified Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
          {/* Required Filters */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Class:</label>
            <CollegeClassDropdown
              value={selectedClassId}
              onChange={(value: number | null) => {
                setSelectedClassId(value);
                setSelectedGroupId(null); // Reset group when class changes
              }}
              placeholder="Select class"
              className="w-40"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Group:</label>
            <CollegeGroupDropdown
              classId={selectedClassId || 0}
              value={selectedGroupId}
              onChange={(value: number | null) => setSelectedGroupId(value)}
              disabled={!selectedClassId}
              placeholder={selectedClassId ? "Select group" : "Select class first"}
              className="w-40"
              emptyValue
              emptyValueLabel={selectedClassId ? "Select group" : "Select class first"}
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
            <MonthYearFilter
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              monthId="college-attendance-month"
              yearId="college-attendance-year"
              showLabels={false}
              className="flex-1 items-center"
            />
          </div>
        </div>

        {!selectedClassId ? (
          <Card className="p-8 text-center mb-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Info className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Select Class, Group, Month, and Year
                </h3>
                <p className="text-slate-600 mt-1">
                  Please select a class, group, month, and year from the filters above to view attendance records.
                </p>
              </div>
            </div>
          </Card>
        ) : !selectedGroupId ? (
          <Card className="p-8 text-center mb-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Info className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Select a Group
                </h3>
                <p className="text-slate-600 mt-1">
                  Please select a group from the dropdown above to view attendance records.
                </p>
              </div>
            </div>
          </Card>
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
                
                // Invalidate and refetch queries using debounced utility (prevents UI freeze)
                invalidateAndRefetch(collegeKeys.attendance.root());
                
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
