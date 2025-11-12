import { ViewDialog } from '@/components/shared';
import type { ViewDialogSection, ViewDialogField, ViewDialogAction } from '@/components/shared/ViewDialog';
import { User, Calendar, GraduationCap } from 'lucide-react';
import type { SchoolEnrollmentWithStudentDetails } from '@/lib/types/school';
import { useSchoolStudent } from '@/lib/hooks/school';

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
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enrollment Details"
      subtitle={enrollment ? `Enrollment #${enrollment.enrollment_id}` : undefined}
      icon={<GraduationCap className="h-5 w-5" />}
      iconColor="blue"
      maxWidth="2xl"
      showCloseButton={false}
      actions={actions}
      className="compact"
      sections={enrollment ? [
        {
          title: "Student Information",
          icon: <User className="h-4 w-4" />,
          iconColor: "blue",
          className: "p-4 compact",
          fields: [
            { label: "Student Name", value: studentName, type: "text" },
            { label: "Admission No", value: admissionNo, type: "text" },
            { label: "Aadhar No", value: aadharNo, type: "text" },
            { label: "Gender", value: gender, type: "text" },
            { label: "Date of Birth", value: dob, type: "date" },
            { label: "Father/Guardian Name", value: fatherName, type: "text" },
            { label: "Mother/Guardian Name", value: motherName, type: "text" },
            { label: "Father Mobile", value: fatherMobile, type: "text" },
            { label: "Mother Mobile", value: motherMobile, type: "text" },
            { label: "Present Address", value: presentAddress, type: "text" },
            { label: "Permanent Address", value: permanentAddress, type: "text" },
            { label: "Admission Date", value: admissionDate, type: "date" },
            { label: "Status", value: statusBadge.label, type: "badge", badgeVariant: statusBadge.variant },
          ] as ViewDialogField[],
        },
        {
          title: "Enrollment Details",
          icon: <GraduationCap className="h-4 w-4" />,
          iconColor: "purple",
          className: "p-4 compact",
          fields: [
            { label: "Roll Number", value: enrollment.roll_number, type: "text" },
          ] as ViewDialogField[],
        },
        {
          title: "Academic Information",
          icon: <GraduationCap className="h-4 w-4" />,
          iconColor: "purple",
          className: "p-4 compact",
          fields: [
            { label: "Class", value: className, type: "text" },
            { label: "Section", value: sectionName, type: "text" },
            { 
              label: "Enrollment Status", 
              value: enrollment.is_active ? "Active" : "Inactive", 
              type: "badge",
              badgeVariant: enrollment.is_active ? "default" : "secondary"
            },
            { 
              label: "Promoted", 
              value: enrollment.promoted ? "Yes" : "No", 
              type: "badge",
              badgeVariant: enrollment.promoted ? "default" : "secondary"
            },
          ] as ViewDialogField[],
        },
        {
          title: "Dates",
          icon: <Calendar className="h-4 w-4" />,
          iconColor: "green",
          className: "p-4 compact",
          fields: [
            { label: "Enrollment Date", value: enrollment.enrollment_date, type: "date" },
          ] as ViewDialogField[],
        },
        {
          title: "Timestamps",
          icon: <Calendar className="h-4 w-4" />,
          iconColor: "gray",
          className: "p-4 compact",
          fields: [
            { label: "Created", value: enrollment.created_at, type: "date" },
            { label: "Last Updated", value: enrollment.updated_at || null, type: "date" },
          ] as ViewDialogField[],
        },
      ] as ViewDialogSection[] : []}
    >
      {(isLoading || isLoadingStudent) && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading enrollment and student details...</p>
          </div>
        </div>
      )}
      {!isLoading && !enrollment && (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load enrollment details.</p>
        </div>
      )}
    </ViewDialog>
  );
};

