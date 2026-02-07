import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/common/components/ui/sheet";
import { Button } from '@/common/components/ui/button';
import { User, Calendar, GraduationCap, ArrowRightLeft } from 'lucide-react';
import type { SchoolEnrollmentWithStudentDetails, SchoolClassRead, SchoolSectionRead } from '@/features/school/types';
import { useSchoolStudent } from '@/features/school/hooks';
import { useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import { ChangeSectionDialog } from './ChangeSectionDialog';

// Utility function to get status badge variant and display name
const getStudentStatusBadge = (status: string | null | undefined) => {
  if (!status) return { variant: 'secondary' as const, label: 'N/A' };
  
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'ACTIVE':
      return { variant: 'success' as const, label: 'Active' };
    case 'INACTIVE':
      return { variant: 'secondary' as const, label: 'Inactive' };
    case 'DROPPED_OUT':
      return { variant: 'destructive' as const, label: 'Dropped Out' };
    case 'ABSCONDED':
      return { variant: 'warning' as const, label: 'Absconded' };
    default:
      return { variant: 'secondary' as const, label: status };
  }
};

function getStatusBadgeClassName(
  variant: 'success' | 'secondary' | 'destructive' | 'warning'
): string {
  switch (variant) {
    case 'secondary':
      return 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80';
    case 'destructive':
      return 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80';
    case 'success':
      return 'border-transparent bg-green-100 text-green-800';
    case 'warning':
      return 'border-transparent bg-amber-100 text-amber-800';
    default:
      return 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80';
  }
}

interface EnrollmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: SchoolEnrollmentWithStudentDetails | null;
  isLoading: boolean;
  classes: Pick<SchoolClassRead, 'class_id' | 'class_name'>[];
  sections: Pick<SchoolSectionRead, 'section_id' | 'section_name'>[];
  onSuccess?: () => void;
}

export const EnrollmentViewDialog = ({
  open,
  onOpenChange,
  enrollment,
  isLoading,
  classes,
  sections,
  onSuccess,
}: EnrollmentViewDialogProps) => {
  const [isChangeSectionOpen, setIsChangeSectionOpen] = useState(false);

  // Sections for the enrollment's class (for Change Section - API moves within same class)
  const { data: sectionsForClassData } = useSchoolSections(enrollment?.class_id ?? 0, {
    enabled: Boolean(open && enrollment?.class_id),
  });
  const sectionsForChangeSection = useMemo(
    () => sectionsForClassData?.items ?? sections,
    [sectionsForClassData?.items, sections]
  );

  // Fetch full student details using student_id from enrollment
  const { data: studentData, isLoading: isLoadingStudent } = useSchoolStudent(
    enrollment?.student_id || null
  );

  // Get class and section names
  const className = enrollment 
    ? classes.find((cls) => cls.class_id === enrollment.class_id)?.class_name || '-'
    : '-';
  const sectionName = enrollment 
    ? sections.find((sec) => sec.section_id === enrollment.section_id)?.section_name || '-'
    : '-';

  // Get status badge for view mode
  const status = studentData?.status || '-';
  const statusBadge = getStudentStatusBadge(status);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="!w-[900px] sm:!w-[600px] !max-w-[800px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Enrollment Details
                </SheetTitle>
                <SheetDescription>
                  {enrollment ? `Enrollment #${enrollment.enrollment_id}` : 'View enrollment details'}
                </SheetDescription>
              </div>
              {enrollment && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangeSectionOpen(true)}
                  className="gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Change Section
                </Button>
              )}
            </div>
          </SheetHeader>

        {(isLoading || isLoadingStudent) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-600">Loading details...</p>
            </div>
          </div>
        )}

        {!isLoading && !enrollment && !isLoadingStudent && (
          <div className="text-center py-12 text-red-500">
            <p>Failed to load enrollment details.</p>
          </div>
        )}

        {!isLoading && enrollment && (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <User className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Student Information</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Student Name</p>
                  <p className="text-sm font-medium break-words">{studentData?.student_name || enrollment?.student_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Admission No</p>
                  <p className="text-sm font-medium break-words">{studentData?.admission_no || enrollment?.admission_no || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Aadhar No</p>
                  <p className="text-sm font-medium break-words">{studentData?.aadhar_no || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Gender</p>
                  <p className="text-sm font-medium break-words">{studentData?.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Date of Birth</p>
                  <p className="text-sm font-medium break-words">{studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Father Name</p>
                  <p className="text-sm font-medium break-words">{(studentData as { father_or_guardian_name?: string | null; father_name?: string | null } | undefined)?.father_or_guardian_name || studentData?.father_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Mobile</p>
                  <p className="text-sm font-medium break-words">{studentData?.father_or_guardian_mobile || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusBadgeClassName(statusBadge.variant)}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Enrollment Info */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">Enrollment Info</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Roll Number</p>
                  <p className="text-sm font-medium break-words">{enrollment.roll_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Class</p>
                  <p className="text-sm font-medium break-words">{className}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Section</p>
                  <p className="text-sm font-medium break-words">{sectionName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Active</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                    enrollment.is_active ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}>
                    {enrollment.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h4 className="font-semibold text-sm">Timestamps</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Created</p>
                  <p className="text-sm font-medium break-words">{new Date(enrollment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Enrollment Date</p>
                  <p className="text-sm font-medium break-words">{enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </SheetContent>
      </Sheet>

      <ChangeSectionDialog
        open={isChangeSectionOpen}
        onOpenChange={setIsChangeSectionOpen}
        enrollment={enrollment}
        sections={sectionsForChangeSection}
        onSuccess={onSuccess}
      />
    </>
  );
};
