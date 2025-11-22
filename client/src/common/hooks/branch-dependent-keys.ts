/**
 * Branch-Dependent Query Keys
 * 
 * This file defines which query keys depend on branch context and need to be
 * invalidated when the user switches branches or academic years.
 * 
 * ✅ RECOMMENDED: Use these keys for selective invalidation instead of queryClient.clear()
 */

import type { QueryKey } from "@tanstack/react-query";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { collegeKeys } from "@/features/college/hooks/query-keys";

/**
 * Get all query keys that depend on branch context
 * These queries should be invalidated when branch or academic year changes
 */
export function getBranchDependentQueryKeys(): QueryKey[] {
  return [
    // School module queries
    schoolKeys.students.root(),
    schoolKeys.enrollments.root(),
    schoolKeys.reservations.root(),
    schoolKeys.admissions.root(),
    schoolKeys.attendance.root(),
    schoolKeys.tuition.root(),
    schoolKeys.transport.root(),
    schoolKeys.income.root(),
    schoolKeys.expenditure.root(),
    schoolKeys.examMarks.root(),
    schoolKeys.testMarks.root(),
    schoolKeys.exams.root(),
    schoolKeys.tests.root(),
    schoolKeys.classes.root(),
    schoolKeys.subjects.root(),
    schoolKeys.sections.root(),
    schoolKeys.classSubjects.root(),
    schoolKeys.teacherClassSubjects.root(),
    schoolKeys.studentMarks.root(),
    
    // College module queries
    collegeKeys.students.root(),
    collegeKeys.enrollments.root(),
    collegeKeys.reservations.root(),
    collegeKeys.admissions.root(),
    collegeKeys.attendance.root(),
    collegeKeys.tuition.root(),
    collegeKeys.transport.root(),
    collegeKeys.income.root(),
    collegeKeys.expenditure.root(),
    collegeKeys.examMarks.root(),
    collegeKeys.testMarks.root(),
    collegeKeys.exams.root(),
    collegeKeys.tests.root(),
    collegeKeys.classes.root(),
    collegeKeys.groups.root(),
    collegeKeys.courses.root(),
    collegeKeys.subjects.root(),
    collegeKeys.teacherGroupSubjects.root(),
    collegeKeys.teacherCourseSubjects.root(),
    collegeKeys.studentMarks.root(),
    collegeKeys.studentTransport.root(),
    
    // General module queries that depend on branch
    ["branches"],
    ["academic-years"],
    ["academic-year"],
  ];
}

/**
 * Get query keys that depend on academic year context
 * These queries should be invalidated when academic year changes
 */
export function getAcademicYearDependentQueryKeys(): QueryKey[] {
  return [
    // Academic year affects most data, so we use the same keys as branch
    ...getBranchDependentQueryKeys(),
  ];
}

