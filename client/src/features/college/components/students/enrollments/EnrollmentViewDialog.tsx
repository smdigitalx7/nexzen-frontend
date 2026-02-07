import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/common/components/ui/sheet";
import { User, Calendar, GraduationCap } from 'lucide-react';
import type { CollegeEnrollmentWithStudentDetails, CollegeClassList, CollegeGroupList, CollegeCourseList } from '@/features/college/types';
import { useCollegeStudent } from '@/features/college/hooks';

// Utility function to get status badge variant and display name
const getStudentStatusBadge = (status: string | null | undefined) => {
  if (!status) return { variant: 'secondary' as const, label: 'N/A' };
  
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'ACTIVE':
      return { variant: 'success' as const, label: 'Active' };
    case 'INACTIVE':
      return { variant: 'secondary' as const, label: 'Inactive' };
    case 'ALUMNI':
      return { variant: 'info' as const, label: 'Alumni' };
    default:
      return { variant: 'secondary' as const, label: status };
  }
};

function getStatusBadgeClassName(
  variant: 'success' | 'info' | 'secondary'
): string {
  switch (variant) {
    case 'secondary':
      return 'border-transparent bg-secondary text-secondary-foreground';
    case 'success':
      return 'border-transparent bg-green-100 text-green-800';
    case 'info':
      return 'border-transparent bg-blue-100 text-blue-800';
    default:
      return 'border-transparent bg-primary text-primary-foreground';
  }
}

interface EnrollmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: CollegeEnrollmentWithStudentDetails | null;
  isLoading: boolean;
  classes: CollegeClassList[];
  groups: CollegeGroupList[];
  courses: CollegeCourseList[];
}

export const EnrollmentViewDialog = ({
  open,
  onOpenChange,
  enrollment,
  isLoading,
  classes,
  groups,
  courses,
}: EnrollmentViewDialogProps) => {
  // Fetch full student details using student_id from enrollment
  const { data: studentData, isLoading: isLoadingStudent } = useCollegeStudent(
    enrollment?.student_id || null
  );

  // Get class, group, and course names
  const className = enrollment 
    ? classes.find((cls) => cls.class_id === enrollment.class_id)?.class_name || enrollment.class_name || '-'
    : '-';
  const groupName = enrollment 
    ? groups.find((grp) => grp.group_id === enrollment.group_id)?.group_name || enrollment.group_name || '-'
    : '-';
  const courseName = enrollment?.course_id
    ? courses.find((crs) => crs.course_id === enrollment.course_id)?.course_name || enrollment.course_name || '-'
    : '-';

  const studentName = studentData?.student_name || enrollment?.student_name || '-';
  const admissionNo = studentData?.admission_no || enrollment?.admission_no || '-';
  const aadharNo = studentData?.aadhar_no || '-';
  const gender = studentData?.gender || '-';
  const dob = studentData?.dob || '-';
  const fatherName = (studentData as { father_or_guardian_name?: string | null; father_name?: string | null } | undefined)?.father_or_guardian_name
    || studentData?.father_name || '-';
  const motherName = (studentData as { mother_or_guardian_name?: string | null; mother_name?: string | null } | undefined)?.mother_or_guardian_name
    || studentData?.mother_name || '-';
  const fatherMobile = studentData?.father_or_guardian_mobile || '-';
  const motherMobile = studentData?.mother_or_guardian_mobile || '-';
  const presentAddress = studentData?.present_address || '-';
  const permanentAddress = studentData?.permanent_address || '-';
  const admissionDate = studentData?.admission_date || '-';
  const status = studentData?.status || '-';
  const statusBadge = getStudentStatusBadge(status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-[900px] sm:!w-[600px] !max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Enrollment Details
          </SheetTitle>
          <SheetDescription>
            {enrollment ? `Enrollment #${enrollment.enrollment_id}` : 'View enrollment details'}
          </SheetDescription>
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
                  <p className="text-sm font-medium break-words">{studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Admission No</p>
                  <p className="text-sm font-medium break-words">{admissionNo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Aadhar No</p>
                  <p className="text-sm font-medium break-words">{aadharNo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Gender</p>
                  <p className="text-sm font-medium break-words">{gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Date of Birth</p>
                  <p className="text-sm font-medium break-words">{dob ? new Date(dob).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Father/Guardian Name</p>
                  <p className="text-sm font-medium break-words">{fatherName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Mother/Guardian Name</p>
                  <p className="text-sm font-medium break-words">{motherName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Father Mobile</p>
                  <p className="text-sm font-medium break-words">{fatherMobile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Mother Mobile</p>
                  <p className="text-sm font-medium break-words">{motherMobile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Present Address</p>
                  <p className="text-sm font-medium break-words">{presentAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Permanent Address</p>
                  <p className="text-sm font-medium break-words">{permanentAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Admission Date</p>
                  <p className="text-sm font-medium break-words">{admissionDate ? new Date(admissionDate).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusBadgeClassName(statusBadge.variant)}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Enrollment Details */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">Enrollment Details</h4>
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
                  <p className="text-xs text-muted-foreground font-medium mb-1">Group</p>
                  <p className="text-sm font-medium break-words">{groupName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Course</p>
                  <p className="text-sm font-medium break-words">{enrollment.course_id ? courseName : 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Enrollment Status</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    enrollment.is_active ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-secondary text-secondary-foreground'
                  }`}>
                    {enrollment.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Promoted</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    enrollment.promoted ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-secondary text-secondary-foreground'
                  }`}>
                    {enrollment.promoted ? 'Yes' : 'No'}
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
                  <p className="text-xs text-muted-foreground font-medium mb-1">Enrollment Date</p>
                  <p className="text-sm font-medium break-words">{enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Created</p>
                  <p className="text-sm font-medium break-words">{new Date(enrollment.created_at).toLocaleDateString()}</p>
                </div>
                {enrollment.updated_at && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Last Updated</p>
                    <p className="text-sm font-medium break-words">{new Date(enrollment.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
