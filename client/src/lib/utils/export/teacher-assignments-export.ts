import { exportToExcel, type ExcelExportColumn } from './excel-export-utils';

/**
 * Export teacher course subject assignments to Excel
 * Uses the reusable excel-export-utils
 */
export async function exportTeacherAssignmentsToExcel(
  hierarchicalAssignments: Array<{
    group_id?: number;
    group_name?: string;
    class_id?: number;
    class_name?: string;
    courses?: Array<{
      course_id: number;
      course_name: string;
      teachers: Array<{
        teacher_id: number;
        teacher_name: string;
        subjects: Array<{
          subject_id: number;
          subject_name: string;
          is_active?: boolean;
        }>;
      }>;
    }>;
    sections?: Array<{
      section_id: number;
      section_name: string;
      subjects: Array<{
        subject_id: number;
        subject_name: string;
        is_class_teacher?: boolean;
        is_active?: boolean;
      }>;
    }>;
  }>,
  filename: string = 'teacher_assignments',
  isCollege: boolean = true
) {
  // Flatten hierarchical data into flat array
  const flatData: Record<string, any>[] = [];

  hierarchicalAssignments.forEach((group) => {
    if (isCollege && group.courses) {
      // College structure: Group -> Course -> Teacher -> Subject
      group.courses.forEach((course) => {
        course.teachers.forEach((teacher) => {
          teacher.subjects.forEach((subject) => {
            flatData.push({
              group: group.group_name || 'N/A',
              course: course.course_name || 'N/A',
              teacher: teacher.teacher_name || 'N/A',
              subject: subject.subject_name || 'N/A',
              status: subject.is_active !== false ? 'Active' : 'Inactive',
            });
          });
        });
      });
    } else if (!isCollege && group.sections) {
      // School structure: Class -> Section -> Teacher -> Subject
      group.sections.forEach((section) => {
        section.subjects.forEach((subject) => {
          flatData.push({
            class: group.class_name || 'N/A',
            section: section.section_name || 'N/A',
            teacher: 'N/A', // Teacher name would need to be passed separately for school
            subject: subject.subject_name || 'N/A',
            classTeacher: subject.is_class_teacher ? 'Yes' : 'No',
            status: subject.is_active !== false ? 'Active' : 'Inactive',
          });
        });
      });
    }
  });

  // Define columns based on type
  const columns: ExcelExportColumn[] = isCollege
    ? [
        { header: 'Group', key: 'group', width: 20 },
        { header: 'Course', key: 'course', width: 25 },
        { header: 'Teacher', key: 'teacher', width: 25 },
        { header: 'Subject', key: 'subject', width: 25 },
        { header: 'Status', key: 'status', width: 12 },
      ]
    : [
        { header: 'Class', key: 'class', width: 15 },
        { header: 'Section', key: 'section', width: 15 },
        { header: 'Teacher', key: 'teacher', width: 25 },
        { header: 'Subject', key: 'subject', width: 25 },
        { header: 'Class Teacher', key: 'classTeacher', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
      ];

  // Use reusable export utility
  await exportToExcel(flatData, columns, {
    filename,
    sheetName: 'Teacher Assignments',
    title: 'Teacher Course Subject Assignments',
    includeMetadata: true,
  });
}

