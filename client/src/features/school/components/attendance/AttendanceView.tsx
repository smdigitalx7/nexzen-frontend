import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { DataTable } from '@/common/components/shared/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/common/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/common/components/ui/alert-dialog';
import { Label } from '@/common/components/ui/label';
import { Input } from '@/common/components/ui/input';
import { MonthYearFilter } from '@/common/components/shared';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import { Info, Eye, Pencil, Trash2 } from 'lucide-react';
import { useSchoolAttendance, useDeleteSchoolAttendance, useSchoolAttendanceAllStudents, useSchoolSectionsByClass } from '@/features/school/hooks';
import { useToast } from '@/common/hooks/use-toast';
import { SchoolStudentAttendanceService } from '@/features/school/services';
import { schoolKeys } from '@/features/school/hooks/query-keys';
import type { SchoolStudentAttendancePaginatedResponse, SchoolStudentAttendanceRead } from '@/features/school/types';
import { invalidateAndRefetch } from '@/common/hooks/useGlobalRefetch';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';
import type { ActionConfig } from '@/common/components/shared/DataTable/types';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  const isTabActive = useTabEnabled("view", "view");
  const deleteAttendanceMutation = useDeleteSchoolAttendance();
  
  const now = new Date();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { data: sections = [] } = useSchoolSectionsByClass(isTabActive ? (selectedClassId || 0) : 0);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  
  const attendeeParams = useMemo(() => {
    if (!isTabActive || !selectedClassId) return null;
    return {
      class_id: selectedClassId,
      month: selectedMonth,
      year: selectedYear,
      section_id: selectedSectionId || undefined,
    };
  }, [selectedClassId, selectedMonth, selectedYear, selectedSectionId, isTabActive]);
  
  const studentsQuery = useSchoolAttendanceAllStudents(attendeeParams);
  const response = studentsQuery.data || { data: [] };
  const allStudents = (response?.data as any[]) || [];
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
      setDeleteOpen(false);
      setRowToDelete(null);
    } catch {
      // Error toast is handled by mutation hook
    }
  };

  const columns: ColumnDef<SchoolStudentAttendanceRead>[] = useMemo(() => [
    { accessorKey: 'admission_no', header: 'Admission No' },
    { accessorKey: 'roll_number', header: 'Roll No' },
    { accessorKey: 'student_name', header: 'Student Name', cell: ({ row }) => <span className="font-medium">{row.original.student_name}</span> },
    { accessorKey: 'section_name', header: 'Section' },
    { accessorKey: 'total_working_days', header: 'Working Days' },
    { accessorKey: 'present_days', header: 'Present', cell: ({ row }) => <span className="text-green-600 font-medium">{row.original.present_days}</span> },
    { accessorKey: 'absent_days', header: 'Absent', cell: ({ row }) => <span className="text-red-600 font-medium">{row.original.absent_days}</span> },
  ], []);

  const actions: ActionConfig<SchoolStudentAttendanceRead>[] = useMemo(() => [
    {
      id: "view",
      label: "View Details",
      icon: Eye,
      onClick: handleView,
    },
    {
      id: "edit",
      label: "Edit Attendance",
      icon: Pencil,
      onClick: handleEdit,
    }
    // Delete action commented out in original file, keeping unrelated actions available
  ], []);

  return (
    <>
      <CardContent className="p-0">
        {/* Unified Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/30 rounded-lg border mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="attendance-view-class" className="text-sm font-medium">Class:</label>
            <SchoolClassDropdown
              id="attendance-view-class"
              value={selectedClassId}
              onChange={(value: number | null) => {
                setSelectedClassId(value);
                setSelectedSectionId(null);
              }}
              placeholder="Select class"
              className="w-40 bg-background"
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

          <div className="flex items-center gap-2">
            <label htmlFor="attendance-view-section" className="text-sm font-medium text-muted-foreground">Section:</label>
            <SchoolSectionDropdown
              id="attendance-view-section"
              classId={selectedClassId || 0}
              value={selectedSectionId}
              onChange={(value: number | null) => setSelectedSectionId(value)}
              disabled={!selectedClassId}
              placeholder="All sections"
              className="w-40 bg-background"
              emptyValue
              emptyValueLabel="All sections"
            />
          </div>
        </div>

        {!selectedClassId ? (
          <Card className="p-8 text-center border-dashed shadow-none bg-muted/10">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Select Class to View Attendance
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Please select a class, month, and year from the filters above to view student attendance records.
                </p>
              </div>
            </div>
          </Card>
        ) : hasError ? (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-md border border-red-100">
            {errorMessage || 'Failed to load data. Please try again.'}
          </div>
        ) : (
              <DataTable 
                data={allStudents} 
                columns={columns}
                title="Attendance List"
                loading={isLoading}
                searchKey="student_name"
                searchPlaceholder="Search by name..."
                actions={actions}
                actionsHeader="Actions"
                emptyMessage="No attendance records found for this selection."
                export={{ enabled: true, filename: "attendance_report" }}
              />
        )}
      </CardContent>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription className="sr-only">View detailed attendance information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewQuery.isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading details...</div>
            ) : viewQuery.isError ? (
              <div className="py-4 text-center text-red-500">Failed to load details</div>
            ) : viewQuery.data ? (
              <div className="grid gap-3 text-sm">
                <div className="grid grid-cols-2 gap-1 pb-2 border-b">
                   <span className="text-muted-foreground">Student</span>
                   <span className="font-semibold text-right">{viewQuery.data.student_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                   <span className="text-muted-foreground">Admission No</span>
                   <span className="text-right">{viewQuery.data.admission_no}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                   <span className="text-muted-foreground">Roll No</span>
                   <span className="text-right">{viewQuery.data.roll_number}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                   <span className="text-muted-foreground">Section</span>
                   <span className="text-right">{viewQuery.data.section_name}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                   <div className="bg-slate-100 p-2 rounded text-center">
                     <div className="text-xs text-muted-foreground">Working</div>
                     <div className="font-bold">{viewQuery.data.total_working_days}</div>
                   </div>
                   <div className="bg-green-50 p-2 rounded text-center">
                     <div className="text-xs text-green-700">Present</div>
                     <div className="font-bold text-green-700">{viewQuery.data.present_days}</div>
                   </div>
                   <div className="bg-red-50 p-2 rounded text-center">
                     <div className="text-xs text-red-700">Absent</div>
                     <div className="font-bold text-red-700">{viewQuery.data.absent_days}</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-2">
                   <span className="text-muted-foreground">Month/Year</span>
                   <span className="text-right">{monthNames[viewQuery.data.attendance_month - 1]} / {viewQuery.data.attendance_year}</span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                   <span className="text-muted-foreground">Remarks</span>
                   <p className="text-sm bg-muted/50 p-2 rounded min-h-[40px] italic">
                     {viewQuery.data.remarks || 'No remarks provided.'}
                   </p>
                </div>
              </div>
            ) : null}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update absent days and remarks.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-edit-absent">Absent Days</Label>
              <Input 
                id="attendance-edit-absent" 
                type="number" 
                min="0"
                value={editAbsent} 
                onChange={(e) => setEditAbsent(e.target.value)} 
                autoComplete="off" 
              />
              <p className="text-xs text-muted-foreground">
                Total Working Days: {editingRow?.total_working_days || 0}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-edit-remarks">Remarks</Label>
              <Input 
                id="attendance-edit-remarks" 
                value={editRemarks} 
                onChange={(e) => setEditRemarks(e.target.value)} 
                placeholder="Optional remarks"
                autoComplete="off" 
              />
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
                  await SchoolStudentAttendanceService.update(editingRow.attendance_id, { absent_days: absent, remarks: editRemarks || null });
                  invalidateAndRefetch(schoolKeys.attendance.root());
                  await studentsQuery.refetch();
                  toast({ title: 'Updated', description: 'Attendance updated successfully', variant: 'success' });
                  setEditOpen(false);
                  setEditingRow(null);
                } catch (err: unknown) {
                  // ✅ FIX: Extract error message from backend response (supports nested error.message structure)
                  const errorData = (err as any)?.response?.data || (err as any)?.data;
                  const nestedError = errorData?.error?.message;
                  const serverMsg = nestedError || errorData?.detail || errorData?.message || (err as any)?.message || 'Failed to update attendance';
                  toast({ title: 'Error', description: serverMsg, variant: 'destructive' });
                }
              }}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the attendance record for <strong>{rowToDelete?.student_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
