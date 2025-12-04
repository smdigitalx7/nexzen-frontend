import { useState, useEffect, useMemo } from "react";
import { Calendar, Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Badge } from "@/common/components/ui/badge";
import { useToast } from "@/common/hooks/use-toast";
import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog";
import { useAcademicYears } from "@/features/general/hooks/useAcademicYear";
import {
  useExamSchedules,
  useCreateExamSchedule,
  useUpdateExamSchedule,
  useDeleteExamSchedule,
} from "@/features/school/hooks";
import type { ExamScheduleCreate, ExamScheduleUpdate, ExamScheduleRead } from "@/features/school/types";
import { DatePicker } from "@/common/components/ui/date-picker";

interface ExamScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
  examName: string;
}

export const ExamScheduleDialog = ({
  open,
  onOpenChange,
  examId,
  examName,
}: ExamScheduleDialogProps) => {
  const { toast } = useToast();
  const { data: academicYears = [], isLoading: academicYearsLoading } = useAcademicYears({ enabled: open });
  const { data: schedules = [], isLoading: schedulesLoading, refetch } = useExamSchedules(examId);
  
  const createSchedule = useCreateExamSchedule();
  const deleteSchedule = useDeleteExamSchedule();
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamScheduleRead | null>(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
  const [examDate, setExamDate] = useState<string>("");
  const [editExamDate, setEditExamDate] = useState<string>("");
  
  // Update schedule hook - use a default value to avoid conditional hook calls
  const updateSchedule = useUpdateExamSchedule(examId, selectedSchedule?.academic_year_id || 0);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsAddScheduleOpen(false);
      setIsEditScheduleOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
      setSelectedAcademicYearId(null);
      setExamDate("");
      setEditExamDate("");
    }
  }, [open]);

  // Get academic years that don't have schedules yet
  const availableAcademicYears = useMemo(() => {
    const scheduledYearIds = new Set(schedules.map(s => s.academic_year_id));
    return academicYears.filter(ay => !scheduledYearIds.has(ay.academic_year_id));
  }, [academicYears, schedules]);

  const handleCreateSchedule = async () => {
    if (!selectedAcademicYearId || !examDate) {
      toast({
        title: "Error",
        description: "Please select academic year and exam date",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: ExamScheduleCreate = {
        exam_id: examId,
        academic_year_id: selectedAcademicYearId,
        exam_date: examDate,
      };
      await createSchedule.mutateAsync({ examId, payload });
      setIsAddScheduleOpen(false);
      setSelectedAcademicYearId(null);
      setExamDate("");
      refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule || !editExamDate) {
      toast({
        title: "Error",
        description: "Please select exam date",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: ExamScheduleUpdate = {
        exam_date: editExamDate,
      };
      await updateSchedule.mutateAsync(payload);
      setIsEditScheduleOpen(false);
      setSelectedSchedule(null);
      setEditExamDate("");
      refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteSchedule.mutateAsync({
        examId,
        academicYearId: selectedSchedule.academic_year_id,
      });
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
      refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleEditClick = (schedule: ExamScheduleRead) => {
    setSelectedSchedule(schedule);
    setEditExamDate(schedule.exam_date);
    setIsEditScheduleOpen(true);
  };

  const handleDeleteClick = (schedule: ExamScheduleRead) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  // Get academic year name by ID
  const getAcademicYearName = (academicYearId: number) => {
    const year = academicYears.find(ay => ay.academic_year_id === academicYearId);
    return year?.year_name || `Year ${academicYearId}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Exam Schedules - {examName}
            </DialogTitle>
            <DialogDescription>
              Manage exam schedules for different academic years. Each academic year can have a different exam date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Schedule Button */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {schedules.length} schedule(s) configured
              </p>
              <Button
                onClick={() => setIsAddScheduleOpen(true)}
                disabled={availableAcademicYears.length === 0 || academicYearsLoading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            {/* Schedules List */}
            {schedulesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50 text-slate-400 dark:text-slate-500" />
                <p className="text-slate-700 dark:text-slate-300">No schedules configured</p>
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Add a schedule to set exam dates for academic years</p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={`${schedule.exam_id}-${schedule.academic_year_id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{getAcademicYearName(schedule.academic_year_id)}</Badge>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {new Date(schedule.exam_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(schedule)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {availableAcademicYears.length === 0 && schedules.length > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                All academic years have schedules configured
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Add Exam Schedule</DialogTitle>
            <DialogDescription>
              Set exam date for an academic year
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year *</Label>
              <Select
                value={selectedAcademicYearId?.toString() || ""}
                onValueChange={(value) => setSelectedAcademicYearId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {availableAcademicYears.map((year) => (
                    <SelectItem key={year.academic_year_id} value={year.academic_year_id.toString()}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam_date">Exam Date *</Label>
              <DatePicker
                value={examDate}
                onChange={(date) => setExamDate(date || "")}
                placeholder="Select exam date"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateSchedule}
                disabled={!selectedAcademicYearId || !examDate || createSchedule.isPending}
              >
                {createSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Edit Exam Schedule</DialogTitle>
            <DialogDescription>
              Update exam date for {selectedSchedule && getAcademicYearName(selectedSchedule.academic_year_id)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                value={selectedSchedule ? getAcademicYearName(selectedSchedule.academic_year_id) : ""}
                disabled
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_exam_date">Exam Date *</Label>
              <DatePicker
                value={editExamDate}
                onChange={(date) => setEditExamDate(date || "")}
                placeholder="Select exam date"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSchedule}
                disabled={!editExamDate}
              >
                Update Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Exam Schedule"
        description={
          selectedSchedule
            ? `Are you sure you want to delete the schedule for ${getAcademicYearName(selectedSchedule.academic_year_id)}? This action cannot be undone.`
            : "Are you sure you want to delete this schedule?"
        }
        onConfirm={handleDeleteSchedule}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSchedule(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};

