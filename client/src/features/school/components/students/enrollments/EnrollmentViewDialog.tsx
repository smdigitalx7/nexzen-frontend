import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/common/components/ui/sheet";
import { User, Calendar, GraduationCap } from 'lucide-react';
import type { ViewDialogAction } from '@/common/components/shared/ViewDialog'; // Keep type if needed or remove
import type { SchoolEnrollmentWithStudentDetails } from '@/features/school/types';
import { useSchoolStudent } from '@/features/school/hooks';

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

interface EnrollmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: SchoolEnrollmentWithStudentDetails | null;
  isLoading: boolean;
  classes: any[];
  sections: any[];
}

export const EnrollmentViewDialog = ({
  open,
  onOpenChange,
  enrollment,
  isLoading,
  classes,
  sections,
}: EnrollmentViewDialogProps) => {
  // Fetch full student details using student_id from enrollment
  const { data: studentData, isLoading: isLoadingStudent } = useSchoolStudent(
    enrollment?.student_id || null
  );

  // Get class and section names
  const className = enrollment 
    ? classes.find((cls: any) => cls.class_id === enrollment.class_id)?.class_name || '-'
    : '-';
  const sectionName = enrollment 
    ? sections.find((sec: any) => sec.section_id === enrollment.section_id)?.section_name || '-'
    : '-';

  // Use student data from GET /students/{student_id} endpoint for student information
  // Note: API returns father_or_guardian_name and mother_or_guardian_name, but TypeScript types use father_name/mother_name
  const studentName = studentData?.student_name || enrollment?.student_name || '-';
  const admissionNo = studentData?.admission_no || enrollment?.admission_no || '-';
  const aadharNo = studentData?.aadhar_no || '-';
  const gender = studentData?.gender || '-';
  const dob = studentData?.dob || '-';
  const fatherName = (studentData as any)?.father_or_guardian_name || studentData?.father_name || '-';
  const motherName = (studentData as any)?.mother_or_guardian_name || studentData?.mother_name || '-';
  const fatherMobile = studentData?.father_or_guardian_mobile || '-';
  const motherMobile = studentData?.mother_or_guardian_mobile || '-';
  const presentAddress = studentData?.present_address || '-';
  const permanentAddress = studentData?.permanent_address || '-';
  const admissionDate = studentData?.admission_date || '-';
  const status = studentData?.status || '-';
  const statusBadge = getStudentStatusBadge(status);

    // Actions for the dialog
  const actions: ViewDialogAction[] = [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
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
            {/* Render Sections */}
            {[
              {
                title: "Student Information",
                icon: <User className="h-4 w-4" />,
                iconColor: "text-blue-600",
                fields: [
                  { label: "Student Name", value: studentData?.student_name || enrollment?.student_name || '-' },
                  { label: "Admission No", value: studentData?.admission_no || enrollment?.admission_no || '-' },
                  { label: "Aadhar No", value: studentData?.aadhar_no || '-' },
                  { label: "Gender", value: studentData?.gender || '-' },
                  { label: "Date of Birth", value: studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : '-' },
                  { label: "Father Name", value: (studentData as any)?.father_or_guardian_name || studentData?.father_name || '-' },
                  { label: "Mobile", value: studentData?.father_or_guardian_mobile || '-' },
                  { label: "Status", value: statusBadge.label, isBadge: true, badgeVariant: statusBadge.variant },
                ],
              },
              {
                title: "Enrollment Info",
                icon: <GraduationCap className="h-4 w-4" />,
                iconColor: "text-purple-600",
                fields: [
                  { label: "Roll Number", value: enrollment.roll_number },
                  { label: "Class", value: className },
                  { label: "Section", value: sectionName },
                  { label: "Active", value: enrollment.is_active ? "Yes" : "No", isBadge: true, badgeVariant: enrollment.is_active ? "default" : "secondary" },
                ],
              },
              {
                title: "Timestamps",
                icon: <Calendar className="h-4 w-4" />,
                iconColor: "text-gray-500",
                fields: [
                  { label: "Created", value: new Date(enrollment.created_at).toLocaleDateString() },
                  { label: "Enrollment Date", value: enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : '-' },
                ],
              }
            ].map((section, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <span className={section.iconColor}>{section.icon}</span>
                  <h4 className="font-semibold text-sm">{section.title}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field: any, fIdx) => (
                    <div key={fIdx}>
                      <p className="text-xs text-muted-foreground font-medium mb-1">{field.label}</p>
                      {field.isBadge ? (
                         <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                           field.badgeVariant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' :
                           field.badgeVariant === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' :
                           field.badgeVariant === 'success' ? 'border-transparent bg-green-100 text-green-800' :
                           'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
                         }`}>
                           {field.value}
                         </span>
                      ) : (
                        <p className="text-sm font-medium break-words">{field.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

