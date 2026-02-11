import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { DataTable } from '@/common/components/shared/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { Input } from '@/common/components/ui/input';
import { MonthYearFilter } from '@/common/components/shared';
import { CollegeClassDropdown, CollegeGroupDropdown } from '@/common/components/shared/Dropdowns';
import { useCollegeAttendance, useCollegeClassGroups } from '@/features/college/hooks';
import { useToast } from '@/common/hooks/use-toast';
import { CollegeAttendanceService } from '@/features/college/services';
import { collegeKeys } from '@/features/college/hooks/query-keys';
import { useQuery } from '@tanstack/react-query';
import { invalidateAndRefetch } from '@/common/hooks/useGlobalRefetch';
import { Info, Eye, Pencil } from 'lucide-react';
import type { CollegeStudentAttendanceRead, CollegeStudentAttendanceWithClassGroup } from '@/features/college/types/attendance';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';
import type { ActionConfig } from '@/common/components/shared/DataTable/types';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceView() {
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  const isTabActive = useTabEnabled("view", "view");
  
  // Initialize with current month/year (required parameters)
  const now = new Date();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  // ✅ OPTIMIZATION: Only fetch class groups when tab is active
  const { data: classGroups } = useCollegeClassGroups(isTabActive ? (selectedClassId || 0) : 0);
  const groups = (classGroups as any)?.groups || [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // ✅ OPTIMIZATION: Build query params - only when tab is active AND required params are provided
  const attendanceParams = useMemo(() => {
    if (!isTabActive || !selectedClassId || !selectedGroupId) return null;
    return {
      class_id: selectedClassId,
      group_id: selectedGroupId,
      month: selectedMonth,
      year: selectedYear,
      page,
      pageSize,
    };
  }, [selectedClassId, selectedGroupId, selectedMonth, selectedYear, page, pageSize, isTabActive]);
  
  // ✅ OPTIMIZATION: Stabilize query key
  const attendanceQueryKey = useMemo(
    () => ['college-attendance-all', attendanceParams],
    [attendanceParams]
  );
  
  const studentsQuery = useQuery({
    queryKey: attendanceQueryKey,
    queryFn: () => CollegeAttendanceService.getAll(attendanceParams!),
    enabled: !!attendanceParams && isTabActive, // ✅ Gate by tab active state
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });

  // Extract total count and students from paginated response
  const totalCount = useMemo(() => {
    const raw = studentsQuery.data as any;
    if (!raw) return 0;
    if (raw.total_count !== undefined) return raw.total_count;
    if (Array.isArray(raw)) return raw.length; // Fallback
    return 0;
  }, [studentsQuery.data]);

  const allStudents = useMemo(() => {
    const rawData = studentsQuery.data as any;
    if (!rawData) return [];
    
    // Check for paginated response first
    if (rawData && typeof rawData === 'object' && 'students' in rawData) {
      const paginatedData = rawData as { students?: CollegeStudentAttendanceWithClassGroup[] | null };
      const studentsInGroup = paginatedData.students?.[0]?.attendance?.[0]?.students;
      return Array.isArray(studentsInGroup) ? studentsInGroup : [];
    }

    // Fallback if it's directly the grouped array
    if (Array.isArray(rawData)) {
      const studentsInGroup = rawData?.[0]?.attendance?.[0]?.students;
      return Array.isArray(studentsInGroup) ? studentsInGroup : [];
    }

    return [];
  }, [studentsQuery.data]);
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

  const columns: ColumnDef<CollegeStudentAttendanceRead>[] = useMemo(() => [
    { accessorKey: 'admission_no', header: 'Admission No' },
    { accessorKey: 'roll_number', header: 'Roll' },
    { accessorKey: 'student_name', header: 'Student', cell: ({ row }) => <span className="font-medium">{row.original.student_name}</span> },
    { accessorKey: 'total_working_days', header: 'Working Days', cell: ({ getValue }) => (getValue<number>() ?? 0) },
    { accessorKey: 'present_days', header: 'Present', cell: ({ getValue }) => <span className="text-green-600 font-medium">{getValue<number>() ?? 0}</span> },
    { accessorKey: 'absent_days', header: 'Absent', cell: ({ getValue }) => <span className="text-red-600 font-medium">{getValue<number>() ?? 0}</span> },
  ], []);

  const actions: ActionConfig<CollegeStudentAttendanceRead>[] = useMemo(() => [
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
  ], []);

  return (
    <>
      <CardContent className="p-0">
        {/* Unified Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/30 rounded-lg border mb-6">
          {/* Required Filters */}
          <div className="flex items-center gap-2">
            <label htmlFor="college-attendance-class" className="text-sm font-medium">Class:</label>
            <CollegeClassDropdown
              id="college-attendance-class"
              value={selectedClassId}
              onChange={(value: number | null) => {
                setSelectedClassId(value);
                setSelectedGroupId(null); // Reset group when class changes
                setPage(1);
              }}
              placeholder="Select class"
              className="w-40 bg-background"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="college-attendance-group" className="text-sm font-medium">Group:</label>
            <CollegeGroupDropdown
              id="college-attendance-group"
              classId={selectedClassId || 0}
               value={selectedGroupId}
               onChange={(value: number | null) => { setSelectedGroupId(value); setPage(1); }}
              disabled={!selectedClassId}
              placeholder={selectedClassId ? "Select group" : "Select class first"}
              className="w-40 bg-background"
              emptyValue
              emptyValueLabel={selectedClassId ? "Select group" : "Select class first"}
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
            <MonthYearFilter
              month={selectedMonth}
              year={selectedYear}
               onMonthChange={(m) => { setSelectedMonth(m); setPage(1); }}
               onYearChange={(y) => { setSelectedYear(y); setPage(1); }}
              monthId="college-attendance-month"
              yearId="college-attendance-year"
              showLabels={false}
              className="flex-1 items-center"
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
                  Please select a class, group, month, and year from the filters above to view attendance records.
                </p>
              </div>
            </div>
          </Card>
        ) : !selectedGroupId ? (
          <Card className="p-8 text-center border-dashed shadow-none bg-muted/10">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Select a Group
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Please select a group from the dropdown above to view attendance records.
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
                 export={{ enabled: true, filename: "college_attendance_report" }}
                 pagination="server"
                 totalCount={totalCount}
                 currentPage={page}
                 pageSize={pageSize}
                 pageSizeOptions={[10, 25, 50, 100]}
                 onPageChange={setPage}
                 onPageSizeChange={(newSize) => {
                   setPageSize(newSize);
                   setPage(1);
                 }}
               />
        )}
      </CardContent>
    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription className="sr-only">View detailed attendance information for the selected student</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {viewQuery.isLoading ? (
            <div className="text-sm text-center text-muted-foreground">Loading details...</div>
          ) : viewQuery.isError ? (
            <div className="text-sm text-center text-red-600">Failed to load attendance</div>
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
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <div className="text-xs text-muted-foreground">Working</div>
                    <div className="font-bold">{viewQuery.data.total_working_days ?? 0}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="text-xs text-green-700">Present</div>
                    <div className="font-bold text-green-700">{viewQuery.data.present_days ?? 0}</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-center">
                    <div className="text-xs text-red-700">Absent</div>
                    <div className="font-bold text-red-700">{viewQuery.data.absent_days ?? 0}</div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-1 mt-2">
                  <span className="text-muted-foreground">Month/Year</span>
                  <span className="text-right">{viewQuery.data.attendance_month ? `${viewQuery.data.attendance_month}` : '-'} / {viewQuery.data.attendance_year ? `${viewQuery.data.attendance_year}` : '-'}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                  <span className="text-muted-foreground">Remarks</span>
                  <p className="text-sm bg-muted/50 p-2 rounded min-h-[40px] italic">
                    {viewQuery.data.remarks || 'No remarks provided.'}
                  </p>
              </div>
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
          <DialogDescription>Update absent days and remarks.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college-attendance-edit-absent">Absent Days</Label>
            <Input id="college-attendance-edit-absent" type="number" value={editAbsent} onChange={(e) => setEditAbsent(e.target.value)} autoComplete="off" />
             <p className="text-xs text-muted-foreground">
                Total Working Days: {editingRow?.total_working_days || 0}
              </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="college-attendance-edit-remarks">Remarks</Label>
            <Input id="college-attendance-edit-remarks" value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} autoComplete="off" placeholder="Optional remarks" />
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
    </>
  );
}
