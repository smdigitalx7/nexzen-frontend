import { ViewDialog } from '@/components/shared';
import type { ViewDialogSection, ViewDialogField } from '@/components/shared/ViewDialog';
import { User, Calendar, GraduationCap } from 'lucide-react';
import type { CollegeEnrollmentWithStudentDetails } from '@/lib/types/college';

interface EnrollmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: CollegeEnrollmentWithStudentDetails | null;
  isLoading: boolean;
  classes: any[];
  groups: any[];
  courses: any[];
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
  // Get class, group, and course names
  const className = enrollment 
    ? classes.find((cls: any) => cls.class_id === enrollment.class_id)?.class_name || enrollment.class_name || '-'
    : '-';
  const groupName = enrollment 
    ? groups.find((grp: any) => grp.group_id === enrollment.group_id)?.group_name || enrollment.group_name || '-'
    : '-';
  const courseName = enrollment?.course_id
    ? courses.find((crs: any) => crs.course_id === enrollment.course_id)?.course_name || enrollment.course_name || '-'
    : '-';

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enrollment Details"
      subtitle={enrollment ? `Enrollment #${enrollment.enrollment_id}` : undefined}
      icon={<GraduationCap className="h-5 w-5" />}
      iconColor="blue"
      maxWidth="2xl"
      sections={enrollment ? [
        {
          title: "Student Information",
          icon: <User className="h-4 w-4" />,
          iconColor: "blue",
          fields: [
            { label: "Student Name", value: enrollment.student_name, type: "text" },
            { label: "Admission No", value: enrollment.admission_no, type: "text" },
            { label: "Roll Number", value: enrollment.roll_number, type: "text" },
          ] as ViewDialogField[],
        },
        {
          title: "Enrollment Information",
          icon: <GraduationCap className="h-4 w-4" />,
          iconColor: "purple",
          fields: [
            { label: "Class", value: className, type: "text" },
            { label: "Group", value: groupName, type: "text" },
            { label: "Course", value: enrollment.course_id ? courseName : "Not Set", type: "text" },
            { 
              label: "Status", 
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
          fields: [
            { label: "Enrollment Date", value: enrollment.enrollment_date, type: "date" },
          ] as ViewDialogField[],
        },
        {
          title: "Timestamps",
          icon: <Calendar className="h-4 w-4" />,
          iconColor: "gray",
          fields: [
            { label: "Created", value: enrollment.created_at, type: "date" },
            { label: "Last Updated", value: enrollment.updated_at || null, type: "date" },
          ] as ViewDialogField[],
        },
      ] as ViewDialogSection[] : []}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading enrollment details...</p>
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

