import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import { useChangeEnrollmentSection } from '@/features/school/hooks';
import type { SchoolEnrollmentWithStudentDetails } from '@/features/school/types';
import type { SchoolSectionRead } from '@/features/school/types';

interface ChangeSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: SchoolEnrollmentWithStudentDetails | null;
  /** Sections for the enrollment's class (same class only - API moves within same class) */
  sections: Pick<SchoolSectionRead, 'section_id' | 'section_name'>[];
  onSuccess?: () => void;
}

export const ChangeSectionDialog = ({
  open,
  onOpenChange,
  enrollment,
  sections,
  onSuccess,
}: ChangeSectionDialogProps) => {
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [rollNumber, setRollNumber] = useState('');
  const changeSectionMutation = useChangeEnrollmentSection();

  const classId = enrollment?.class_id ?? 0;

  useEffect(() => {
    if (enrollment && open) {
      setSectionId(enrollment.section_id);
      setRollNumber(enrollment.roll_number ?? '');
    }
  }, [enrollment, open]);

  const handleSubmit = async () => {
    if (!enrollment || sectionId == null || sectionId === 0) return;
    const payload = {
      section_id: sectionId,
      ...(rollNumber.trim() ? { roll_number: rollNumber.trim() } : {}),
    };
    await changeSectionMutation.mutateAsync({
      enrollment_id: enrollment.enrollment_id,
      payload,
    });
    onOpenChange(false);
    onSuccess?.();
  };

  const isDisabled =
    !enrollment || sectionId == null || sectionId === 0 || changeSectionMutation.isPending;
  const isSameSection =
    enrollment &&
    sectionId === enrollment.section_id &&
    (rollNumber.trim() === (enrollment.roll_number ?? '').trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Section</DialogTitle>
          <DialogDescription>
            Move this student to another section within the same class. Optionally update the roll
            number. If roll number is left blank, the existing roll number is kept.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {enrollment && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="change-section-select">New Section *</Label>
                <SchoolSectionDropdown
                  classId={classId}
                  value={sectionId}
                  onChange={(v) => setSectionId(v ?? null)}
                  placeholder="Select section"
                  emptyValue={false}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="change-section-roll">Roll Number (optional)</Label>
                <Input
                  id="change-section-roll"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isDisabled || isSameSection}
          >
            {changeSectionMutation.isPending ? 'Updating...' : 'Update Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
