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
import { Label } from '@/common/components/ui/label';
import { SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import { useChangeEnrollmentSection } from '@/features/school/hooks';
import type { SchoolEnrollmentWithStudentDetails, SchoolSectionRead } from '@/features/school/types';

/** When opened from EnrollmentsTab view dialog */
interface ChangeSectionDialogWithEnrollmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: SchoolEnrollmentWithStudentDetails | null;
  sections: Pick<SchoolSectionRead, 'section_id' | 'section_name'>[];
  onSuccess?: () => void;
  /** Not used when enrollment is provided */
  enrollmentId?: never;
  classId?: never;
  currentSectionId?: never;
  studentName?: never;
}

/** When opened from SectionMappingTab row action */
interface ChangeSectionDialogMinimalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment?: null;
  enrollmentId: number;
  classId: number;
  currentSectionId: number | null;
  studentName?: string;
  sections: Pick<SchoolSectionRead, 'section_id' | 'section_name'>[];
  onSuccess?: () => void;
}

export type ChangeSectionDialogProps = ChangeSectionDialogWithEnrollmentProps | ChangeSectionDialogMinimalProps;

function isMinimalProps(
  p: ChangeSectionDialogProps
): p is ChangeSectionDialogMinimalProps {
  return 'enrollmentId' in p && typeof (p as ChangeSectionDialogMinimalProps).enrollmentId === 'number';
}

export const ChangeSectionDialog = (props: ChangeSectionDialogProps) => {
  const { open, onOpenChange, onSuccess } = props;
  const minimal = isMinimalProps(props);
  const enrollment = minimal ? null : props.enrollment;
  const enrollmentId = minimal ? props.enrollmentId : (enrollment?.enrollment_id ?? 0);
  const classId = minimal ? props.classId : (enrollment?.class_id ?? 0);
  const initialSectionId = minimal ? props.currentSectionId : (enrollment?.section_id ?? null);
  const studentName = minimal ? props.studentName : enrollment?.student_name;
  const currentRollNumber = minimal ? undefined : enrollment?.roll_number;

  const [sectionId, setSectionId] = useState<number | null>(initialSectionId);
  const changeSectionMutation = useChangeEnrollmentSection();

  useEffect(() => {
    if (open) {
      setSectionId(initialSectionId);
    }
  }, [open, initialSectionId]);

  const handleSubmit = async () => {
    if (enrollmentId <= 0 || sectionId == null || sectionId === 0) return;
    await changeSectionMutation.mutateAsync({
      enrollment_id: enrollmentId,
      section_id: sectionId,
      class_id: classId,
    });
    onOpenChange(false);
    onSuccess?.();
  };

  const isDisabled =
    sectionId == null || sectionId === 0 || changeSectionMutation.isPending;
  const isSameSection = sectionId === initialSectionId;

  const title = studentName ? `Change section: ${studentName}` : 'Change Section';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Move this student to another section within the same class. Roll number is kept unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          {currentRollNumber != null && (
            <p className="text-sm text-muted-foreground">
              Current roll number: <span className="font-medium">{currentRollNumber}</span>
            </p>
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
