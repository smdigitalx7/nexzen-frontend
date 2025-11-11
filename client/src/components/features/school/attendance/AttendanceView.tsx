import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MonthYearFilter } from '@/components/shared';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/components/shared/Dropdowns';
import { Info } from 'lucide-react';
import { useSchoolAttendance, useDeleteSchoolAttendance, useSchoolAttendanceAllStudents, useSchoolSectionsByClass } from '@/lib/hooks/school';
import { useToast } from '@/hooks/use-toast';
import { SchoolStudentAttendanceService } from '@/lib/services/school';
import { schoolKeys } from '@/lib/hooks/school/query-keys';
import type { SchoolStudentAttendanceMonthlyGroupedResponse, SchoolClassRead, SchoolSectionRead, SchoolStudentAttendanceRead } from '@/lib/types/school';
import { useQueryClient } from '@tanstack/react-query';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const queryClient = useQueryClient();
  const deleteAttendanceMutation = useDeleteSchoolAttendance();
  
  // Initialize with current month/year (required parameters)
  const now = new Date();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { data: sections = [] } = useSchoolSectionsByClass(selectedClassId || 0);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  
  // Build query params - class_id, month, and year are required
  const attendeeParams = useMemo(() => {
    if (!selectedClassId) return null;
    return {
      class_id: selectedClassId,
      month: selectedMonth,
      year: selectedYear,
      section_id: selectedSectionId || undefined,
    };
  }, [selectedClassId, selectedMonth, selectedYear, selectedSectionId]);
  
  const studentsQuery = useSchoolAttendanceAllStudents(attendeeParams);
  const grouped: SchoolStudentAttendanceMonthlyGroupedResponse = studentsQuery.data || { groups: [] };
  const allStudents = ((grouped as any)?.groups?.[0]?.data as any[]) || [];
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<SchoolStudentAttendanceRead | null>(null);
  const [editAbsent, setEditAbsent] = useState<string>("0");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<SchoolStudentAttendanceRead | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<SchoolStudentAttendanceRead | null>(null);
  const viewQuery = useSchoolAttendance(viewingRow?.attendance_id ?? null);

  const isLoading = studentsQuery.isLoading;
  const hasError = studentsQuery.isError;
  const errorMessage = ((studentsQuery.error as any)?.message) || undefined;


  const handleView = (row: SchoolStudentAttendanceRead) => {
    setViewingRow(row);
    setViewOpen(true);
  };

  const handleEdit = (row: SchoolStudentAttendanceRead) => {
    setEditingRow(row);
    setEditAbsent(String(row.absent_days));
    setEditRemarks(row.remarks ?? '');
    setEditOpen(true);
  };

  const handleDelete = (row: SchoolStudentAttendanceRead) => {
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
        {/* Unified Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
          {/* Required Filters */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Class:</label>
            <SchoolClassDropdown
              value={selectedClassId}
              onChange={(value: number | null) => {
                setSelectedClassId(value);
                setSelectedSectionId(null); // Reset section when class changes
              }}
              placeholder="Select class"
              className="w-40"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
            <MonthYearFilter
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              monthId="attendance-month"
              yearId="attendance-year"
              showLabels={false}
              className="flex-1 items-center"
            />
          </div>

          {/* Optional Filters */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Section:</label>
            <SchoolSectionDropdown
              classId={selectedClassId || 0}
              value={selectedSectionId}
              onChange={(value: number | null) => setSelectedSectionId(value)}
              disabled={!selectedClassId}
              placeholder="All sections"
              className="w-40"
              emptyValue
              emptyValueLabel="All sections"
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
                  Select Class, Month, and Year
                </h3>
                <p className="text-slate-600 mt-1">
                  Please select a class, month, and year from the filters above to view attendance records.
                </p>
              </div>
            </div>
          </Card>
        ) : hasError ? (
          <div className="py-4 text-center text-red-600">{errorMessage || 'Failed to load data'}</div>
        ) : isLoading ? (
          <div className="py-4 text-center text-slate-500">Loading...</div>
        ) : allStudents.length === 0 ? (
          <div className="py-4 text-center text-slate-500">No Students Attendance to display</div>
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
        <div className="space-y-2">
          <div>
            <Label>Absent Days</Label>
            <Input type="number" value={editAbsent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditAbsent(e.target.value)} />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={editRemarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditRemarks(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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
                // Update attendance via service
                await SchoolStudentAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                
                // Invalidate and refetch queries to refresh the UI
                await queryClient.invalidateQueries({ queryKey: schoolKeys.attendance.detail(editingRow.attendance_id) });
                await queryClient.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
                await queryClient.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
                
                // Refetch the students list to show updated data
                await studentsQuery.refetch();
                
                toast({ title: 'Updated', description: 'Attendance updated', variant: 'success' });
                setEditOpen(false);
                setEditingRow(null);
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
