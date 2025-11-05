import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCollegeClasses, useCollegeClassGroups, useBulkCreateCollegeAttendance, useCreateCollegeAttendance } from '@/lib/hooks/college';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceCreate() {
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
  const bulkCreate = useBulkCreateCollegeAttendance();
  const createSingle = useCreateCollegeAttendance();
  const { toast } = useToast();
  const [singleEnrollmentId, setSingleEnrollmentId] = useState<string>("");
  const [singleWorkingDays, setSingleWorkingDays] = useState<string>("1");
  const [singlePresentDays, setSinglePresentDays] = useState<string>("1");
  const [singleAbsentDays, setSingleAbsentDays] = useState<string>("0");
  const [singleRemarks, setSingleRemarks] = useState<string>("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState<number>(month || (new Date().getMonth() + 1));
  const [bulkYear, setBulkYear] = useState<number>(year || new Date().getFullYear());
  const [bulkWorkingDays, setBulkWorkingDays] = useState<number>(1);

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Create Attendance</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Initialize or update monthly attendance for a class</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setBulkMonth(month || (new Date().getMonth()+1)); setBulkYear(year || new Date().getFullYear()); setBulkWorkingDays(1); setBulkOpen(true); }}>Bulk Create Class Attendance</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={(v) => setSelectedClassId(parseInt(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c.class_id} value={String(c.class_id)}>{c.class_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGroupId ? String(selectedGroupId) : ''} onValueChange={(v) => setSelectedGroupId(parseInt(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                {(groups as any[]).map((g: any) => (
                  <SelectItem key={g.group_id} value={String(g.group_id)}>{g.group_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month ? String(month) : ''} onValueChange={(v) => { const m = parseInt(v); const d = selectedDate || new Date(); setSelectedDate(new Date(d.getFullYear(), m - 1, d.getDate())); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const enrollment_id = parseInt(singleEnrollmentId);
                if (!enrollment_id || Number.isNaN(enrollment_id)) {
                  toast({ title: 'Error', description: 'Enter valid enrollment ID', variant: 'destructive' });
                  return;
                }
                try {
                  await createSingle.mutateAsync({
                    enrollment_id,
                    attendance_month: month || (new Date().getMonth() + 1),
                    attendance_year: year || new Date().getFullYear(),
                    total_working_days: parseInt(singleWorkingDays) || 0,
                    present_days: parseInt(singlePresentDays) || 0,
                    absent_days: parseInt(singleAbsentDays) || 0,
                    remarks: singleRemarks || null,
                  } as any);
                  // Toast handled by mutation hook
                } catch {
                  // Error toast handled by mutation hook
                }
              }}
            >
              Create Attendance
            </Button>
          </div>
        </div>
        {/* Single Record Create */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Enrollment ID</label>
            <input className="w-full border rounded px-2 py-2 text-sm" value={singleEnrollmentId} onChange={(e) => setSingleEnrollmentId(e.target.value)} placeholder="e.g. 1001" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Working Days</label>
            <input className="w-full border rounded px-2 py-2 text-sm" type="number" value={singleWorkingDays} onChange={(e) => setSingleWorkingDays(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Present</label>
            <input className="w-full border rounded px-2 py-2 text-sm" type="number" value={singlePresentDays} onChange={(e) => setSinglePresentDays(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Absent</label>
            <input className="w-full border rounded px-2 py-2 text-sm" type="number" value={singleAbsentDays} onChange={(e) => setSingleAbsentDays(e.target.value)} />
          </div>
          <div className="flex items-end" />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Remarks (optional)</label>
          <input className="w-full border rounded px-2 py-2 text-sm" value={singleRemarks} onChange={(e) => setSingleRemarks(e.target.value)} placeholder="Note" />
        </div>
        <div className="text-sm text-slate-600">Use Bulk Create to initialize monthly class records, Create Attendance to add a single record, then use View to mark day-wise presence or adjust counts.</div>
      </CardContent>
    </Card>
    <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Create Class Attendance</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Class</label>
              <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={(v) => { const id = parseInt(v); setSelectedClassId(id); setSelectedGroupId(undefined); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c.class_id} value={String(c.class_id)}>{c.class_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Group</label>
              <Select value={selectedGroupId ? String(selectedGroupId) : ''} onValueChange={(v) => setSelectedGroupId(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {(groups as any[]).map((g: any) => (
                    <SelectItem key={g.group_id} value={String(g.group_id)}>{g.group_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Month</label>
              <Select value={String(bulkMonth)} onValueChange={(v) => setBulkMonth(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>{monthNames[m-1]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Year</label>
              <Input type="number" value={bulkYear} onChange={(e) => setBulkYear(parseInt(e.target.value) || new Date().getFullYear())} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Total Working Days</label>
            <Input type="number" value={bulkWorkingDays} onChange={(e) => setBulkWorkingDays(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button disabled={!selectedClassId || !selectedGroupId} onClick={async () => {
            if (!selectedClassId || !selectedGroupId) { toast({ title: 'Error', description: 'Select class and group first', variant: 'destructive' }); return; }
            try {
              await bulkCreate.mutateAsync({
                class_id: selectedClassId,
                group_id: selectedGroupId,
                attendance_month: bulkMonth,
                attendance_year: bulkYear,
                total_working_days: bulkWorkingDays,
              });
              setBulkOpen(false);
              // Toast handled by mutation hook
            } catch (err: any) {
              // Error toast handled by mutation hook
            }
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}


