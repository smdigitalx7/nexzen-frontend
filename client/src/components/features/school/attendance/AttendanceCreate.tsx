import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/components/shared/Dropdowns';
import { useBulkCreateSchoolAttendance } from '@/lib/hooks/school';
import { Calendar, Users, CalendarDays, FileCheck, Loader2 } from 'lucide-react';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AttendanceCreate() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const selectedDate = new Date();
  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();
  const bulkCreate = useBulkCreateSchoolAttendance();
  const { toast } = useToast();
  const [bulkMonth, setBulkMonth] = useState<number>(month);
  const [bulkYear, setBulkYear] = useState<number>(year);
  const [bulkWorkingDays, setBulkWorkingDays] = useState<number>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isLoading = bulkCreate.isPending;

  const handleCreate = async () => {
    if (!selectedClassId) {
      toast({
        title: 'Error',
        description: 'Please select a class first',
        variant: 'destructive',
      });
      return;
    }
    try {
      await bulkCreate.mutateAsync({
        class_id: selectedClassId,
        section_id: selectedSectionId || null,
        attendance_month: bulkMonth,
        attendance_year: bulkYear,
        total_working_days: bulkWorkingDays,
      });
      // Reset form after successful creation
      setSelectedClassId(null);
      setSelectedSectionId(null);
      setBulkMonth(month);
      setBulkYear(year);
      setBulkWorkingDays(1);
      setConfirmOpen(false);
    } catch (err: any) {
      // Check for "No records created" error
      const errorDetail = err?.response?.data?.detail;
      if (errorDetail?.message && errorDetail.message.includes("No records created")) {
        const skippedCount = errorDetail.skipped_enrollment_ids?.length || 0;
        const totalRequested = errorDetail.total_requested || 0;
        
        // Show informational message (not an error)
        toast({
          title: 'No Records Created',
          description: `${errorDetail.message} ${skippedCount > 0 ? `(${skippedCount} out of ${totalRequested} enrollment${totalRequested !== 1 ? 's' : ''} already have attendance records for this month.)` : ''}`,
          variant: 'default',
        });
      }
      // Note: Other errors are handled by mutation hook's onError
      setConfirmOpen(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Create Attendance</CardTitle>
            <CardDescription className="mt-1">
              Initialize monthly attendance records for a class or section
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
            <strong>Note:</strong> Use this form to initialize monthly attendance records. After initialization, use the <strong>View</strong> tab to mark day-wise presence or adjust attendance counts.
          </p>
        </div>

        <div className="space-y-6">
          {/* Class & Section Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Class & Section</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select" className="text-sm font-medium">
                  Class <span className="text-destructive">*</span>
                </Label>
                <SchoolClassDropdown
                  value={selectedClassId}
                  onChange={(value) => {
                    setSelectedClassId(value);
                    setSelectedSectionId(null); // Reset section when class changes
                  }}
                  placeholder="Select class"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-select" className="text-sm font-medium">
                  Section <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <SchoolSectionDropdown
                  classId={selectedClassId || 0}
                  value={selectedSectionId}
                  onChange={(value) => setSelectedSectionId(value)}
                  disabled={!selectedClassId}
                  placeholder={selectedClassId ? "All Sections" : "Please select the class first"}
                  emptyValue
                  emptyValueLabel="All Sections"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Date & Working Days */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Period & Working Days</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month-select" className="text-sm font-medium">
                  Month <span className="text-destructive">*</span>
                </Label>
                <Select value={String(bulkMonth)} onValueChange={(v) => setBulkMonth(parseInt(v))}>
                  <SelectTrigger id="month-select" className="w-full">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select month" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {monthNames[m-1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-input" className="text-sm font-medium">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="year-input"
                  type="number"
                  value={bulkYear}
                  onChange={(e) => setBulkYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min={2000}
                  max={2100}
                  className="w-full"
                  placeholder="Enter year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="working-days-input" className="text-sm font-medium">
                  Total Working Days <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="working-days-input"
                  type="number"
                  value={bulkWorkingDays}
                  onChange={(e) => setBulkWorkingDays(parseInt(e.target.value) || 0)}
                  min={1}
                  max={31}
                  className="w-full"
                  placeholder="Enter working days"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button
              disabled={!selectedClassId || isLoading}
              onClick={() => setConfirmOpen(true)}
              className="min-w-[120px]"
              size="lg"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Create Attendance
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Attendance Creation</AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to create attendance records with the following details?
            </AlertDialogDescription>
            <div className="bg-muted rounded-lg p-3 space-y-1.5 text-sm mt-3">
              <div className="flex justify-between">
                <span className="font-medium">Month:</span>
                <span>{monthNames[bulkMonth - 1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Year:</span>
                <span>{bulkYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Working Days:</span>
                <span>{bulkWorkingDays}</span>
              </div>
              {selectedSectionId && (
                <div className="flex justify-between">
                  <span className="font-medium">Section:</span>
                  <span>Selected</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This will initialize attendance records for all students in the selected class{selectedSectionId ? ' and section' : ''}.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreate}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Confirm & Create'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

