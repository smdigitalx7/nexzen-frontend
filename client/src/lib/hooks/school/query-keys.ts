export const schoolKeys = {
  root: ["school"] as const,
  classes: {
    root: () => [...schoolKeys.root, "classes"] as const,
    list: () => [...schoolKeys.classes.root(), "list"] as const,
    listWithSubjects: () => [...schoolKeys.classes.root(), "with-subjects"] as const,
    detail: (classId: number) => [...schoolKeys.classes.root(), "detail", classId] as const,
  },
  sections: {
    root: () => [...schoolKeys.root, "sections"] as const,
    listByClass: (classId: number) => [...schoolKeys.sections.root(), "by-class", classId] as const,
    detail: (classId: number, sectionId: number) => [...schoolKeys.sections.root(), "detail", classId, sectionId] as const,
  },
  subjects: {
    root: () => [...schoolKeys.root, "subjects"] as const,
    list: () => [...schoolKeys.subjects.root(), "list"] as const,
    detail: (subjectId: number) => [...schoolKeys.subjects.root(), "detail", subjectId] as const,
  },
  classSubjects: {
    root: () => [...schoolKeys.root, "class-subjects"] as const,
    list: () => [...schoolKeys.classSubjects.root(), "list"] as const,
    byClass: (classId: number) => [...schoolKeys.classSubjects.root(), "by-class", classId] as const,
    bySubject: (subjectId: number) => [...schoolKeys.classSubjects.root(), "by-subject", subjectId] as const,
  },
  students: {
    root: () => [...schoolKeys.root, "students"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.students.root(), "list", params ?? {}] as const,
    detail: (studentId: number) => [...schoolKeys.students.root(), "detail", studentId] as const,
    byAdmission: (admissionNo: string) => [...schoolKeys.students.root(), "by-admission", admissionNo] as const,
  },
  enrollments: {
    root: () => [...schoolKeys.root, "enrollments"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.enrollments.root(), "list", params ?? {}] as const,
    detail: (enrollmentId: number) => [...schoolKeys.enrollments.root(), "detail", enrollmentId] as const,
  },
  attendance: {
    root: () => [...schoolKeys.root, "attendance"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.attendance.root(), "list", params ?? {}] as const,
    detail: (attendanceId: number) => [...schoolKeys.attendance.root(), "detail", attendanceId] as const,
    byAdmission: (admissionNo: string) => [...schoolKeys.attendance.root(), "by-admission", admissionNo] as const,
  },
  reservations: {
    root: () => [...schoolKeys.root, "reservations"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.reservations.root(), "list", params ?? {}] as const,
    detail: (reservationId: number) => [...schoolKeys.reservations.root(), "detail", reservationId] as const,
  },
  exams: {
    root: () => [...schoolKeys.root, "exams"] as const,
    list: () => [...schoolKeys.exams.root(), "list"] as const,
    detail: (examId: number) => [...schoolKeys.exams.root(), "detail", examId] as const,
  },
  tests: {
    root: () => [...schoolKeys.root, "tests"] as const,
    list: () => [...schoolKeys.tests.root(), "list"] as const,
    detail: (testId: number) => [...schoolKeys.tests.root(), "detail", testId] as const,
  },
  income: {
    root: () => [...schoolKeys.root, "income"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.income.root(), "list", params ?? {}] as const,
    detail: (incomeId: number) => [...schoolKeys.income.root(), "detail", incomeId] as const,
  },
  expenditure: {
    root: () => [...schoolKeys.root, "expenditure"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.expenditure.root(), "list", params ?? {}] as const,
    detail: (expenditureId: number) => [...schoolKeys.expenditure.root(), "detail", expenditureId] as const,
  },
  tuition: {
    root: () => [...schoolKeys.root, "tuition-balances"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.tuition.root(), "list", params ?? {}] as const,
    detail: (balanceId: number) => [...schoolKeys.tuition.root(), "detail", balanceId] as const,
  },
  transport: {
    root: () => [...schoolKeys.root, "transport-balances"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.transport.root(), "list", params ?? {}] as const,
    detail: (balanceId: number) => [...schoolKeys.transport.root(), "detail", balanceId] as const,
  },
  examMarks: {
    root: () => [...schoolKeys.root, "exam-marks"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.examMarks.root(), "list", params ?? {}] as const,
    detail: (markId: number) => [...schoolKeys.examMarks.root(), "detail", markId] as const,
  },
  testMarks: {
    root: () => [...schoolKeys.root, "test-marks"] as const,
    list: (params?: Record<string, unknown>) => [...schoolKeys.testMarks.root(), "list", params ?? {}] as const,
    detail: (markId: number) => [...schoolKeys.testMarks.root(), "detail", markId] as const,
  },
  teacherClassSubjects: {
    root: () => [...schoolKeys.root, "teacher-class-subjects"] as const,
    list: () => [...schoolKeys.teacherClassSubjects.root(), "list"] as const,
    hierarchical: () => [...schoolKeys.teacherClassSubjects.root(), "hierarchical"] as const,
    classTeachers: () => [...schoolKeys.teacherClassSubjects.root(), "class-teachers"] as const,
  },
  studentMarks: {
    root: () => [...schoolKeys.root, "student-marks"] as const,
    marksView: (enrollmentId: number) => [...schoolKeys.studentMarks.root(), "marks-view", enrollmentId] as const,
    performanceView: (enrollmentId: number) => [...schoolKeys.studentMarks.root(), "performance-view", enrollmentId] as const,
    examReport: (params?: Record<string, unknown>) => [...schoolKeys.studentMarks.root(), "exam-report", params ?? {}] as const,
    testReport: (params?: Record<string, unknown>) => [...schoolKeys.studentMarks.root(), "test-report", params ?? {}] as const,
  },
};


