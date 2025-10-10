export const collegeKeys = {
  root: ["college"] as const,
  students: {
    root: () => [...collegeKeys.root, "students"] as const,
    list: (params?: { page?: number; pageSize?: number }) =>
      [...collegeKeys.students.root(), "list", params ?? {}] as const,
    detail: (studentId: number) => [...collegeKeys.students.root(), "detail", studentId] as const,
  },
  enrollments: {
    root: () => [...collegeKeys.root, "enrollments"] as const,
    list: (params?: { page?: number; pageSize?: number; class_id?: number; group_id?: number; course_id?: number }) =>
      [...collegeKeys.enrollments.root(), "list", params ?? {}] as const,
    detail: (enrollmentId: number) => [...collegeKeys.enrollments.root(), "detail", enrollmentId] as const,
    byAdmission: (admissionNo: string) => [...collegeKeys.enrollments.root(), "by-admission", admissionNo] as const,
  },
  classes: {
    root: () => [...collegeKeys.root, "classes"] as const,
    list: () => [...collegeKeys.classes.root(), "list"] as const,
    listSlim: () => [...collegeKeys.classes.root(), "list-slim"] as const,
    detail: (classId: number) => [...collegeKeys.classes.root(), "detail", classId] as const,
  },
  groups: {
    root: () => [...collegeKeys.root, "groups"] as const,
    list: () => [...collegeKeys.groups.root(), "list"] as const,
    listSlim: () => [...collegeKeys.groups.root(), "list-slim"] as const,
    detail: (groupId: number) => [...collegeKeys.groups.root(), "detail", groupId] as const,
  },
  courses: {
    root: () => [...collegeKeys.root, "courses"] as const,
    list: () => [...collegeKeys.courses.root(), "list"] as const,
    listSlim: () => [...collegeKeys.courses.root(), "list-slim"] as const,
    detail: (courseId: number) => [...collegeKeys.courses.root(), "detail", courseId] as const,
  },
  subjects: {
    root: () => [...collegeKeys.root, "subjects"] as const,
    list: () => [...collegeKeys.subjects.root(), "list"] as const,
    listSlim: () => [...collegeKeys.subjects.root(), "list-slim"] as const,
    detail: (subjectId: number) => [...collegeKeys.subjects.root(), "detail", subjectId] as const,
  },
  exams: {
    root: () => [...collegeKeys.root, "exams"] as const,
    list: () => [...collegeKeys.exams.root(), "list"] as const,
    detail: (id: number) => [...collegeKeys.exams.root(), "detail", id] as const,
  },
  tests: {
    root: () => [...collegeKeys.root, "tests"] as const,
    list: () => [...collegeKeys.tests.root(), "list"] as const,
    detail: (id: number) => [...collegeKeys.tests.root(), "detail", id] as const,
  },
  reservations: {
    root: () => [...collegeKeys.root, "reservations"] as const,
    list: (params?: { group_id?: number; course_id?: number; page?: number; pageSize?: number }) => [...collegeKeys.reservations.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.reservations.root(), "detail", id] as const,
  },
  attendance: {
    root: () => [...collegeKeys.root, "attendance"] as const,
    list: (params?: { page?: number; pageSize?: number; admission_no?: string }) => [...collegeKeys.attendance.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.attendance.root(), "detail", id] as const,
    byAdmission: (admissionNo: string) => [...collegeKeys.attendance.root(), "by-admission", admissionNo] as const,
  },
  examMarks: {
    root: () => [...collegeKeys.root, "exam-marks"] as const,
    list: (params?: { class_id?: number; group_id?: number; course_id?: number; exam_id?: number; page?: number; pageSize?: number }) => [...collegeKeys.examMarks.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.examMarks.root(), "detail", id] as const,
  },
  testMarks: {
    root: () => [...collegeKeys.root, "test-marks"] as const,
    list: (params?: { class_id?: number; group_id?: number; course_id?: number; test_id?: number; page?: number; pageSize?: number }) => [...collegeKeys.testMarks.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.testMarks.root(), "detail", id] as const,
  },
  tuition: {
    root: () => [...collegeKeys.root, "tuition-balances"] as const,
    list: (params?: { page?: number; pageSize?: number }) => [...collegeKeys.tuition.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.tuition.root(), "detail", id] as const,
    byAdmission: (admissionNo: string) => [...collegeKeys.tuition.root(), "by-admission", admissionNo] as const,
    unpaidTerms: (params?: { page?: number; pageSize?: number }) => [...collegeKeys.tuition.root(), "unpaid-terms", params ?? {}] as const,
  },
  transport: {
    root: () => [...collegeKeys.root, "transport-balances"] as const,
    list: (params?: { page?: number; pageSize?: number }) => [...collegeKeys.transport.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.transport.root(), "detail", id] as const,
  },
  income: {
    root: () => [...collegeKeys.root, "income"] as const,
    list: (params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string }) => [...collegeKeys.income.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.income.root(), "detail", id] as const,
  },
  expenditure: {
    root: () => [...collegeKeys.root, "expenditure"] as const,
    list: (params?: { start_date?: string; end_date?: string }) => [...collegeKeys.expenditure.root(), "list", params ?? {}] as const,
    detail: (id: number) => [...collegeKeys.expenditure.root(), "detail", id] as const,
  },
  studentTransport: {
    root: () => [...collegeKeys.root, "student-transport-assignments"] as const,
    list: () => [...collegeKeys.studentTransport.root(), "list"] as const,
    detail: (id: number) => [...collegeKeys.studentTransport.root(), "detail", id] as const,
  },
  teacherGroupSubjects: {
    root: () => [...collegeKeys.root, "teacher-group-subjects"] as const,
    list: (params?: { class_id?: number; group_id?: number }) => [...collegeKeys.teacherGroupSubjects.root(), "list", params ?? {}] as const,
    byTeacher: (teacherId: number) => [...collegeKeys.teacherGroupSubjects.root(), "by-teacher", teacherId] as const,
  },
  teacherCourseSubjects: {
    root: () => [...collegeKeys.root, "teacher-course-subjects"] as const,
    list: () => [...collegeKeys.teacherCourseSubjects.root(), "list"] as const,
  },
};


