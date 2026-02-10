/**
 * Invalidation Maps for Query Key Invalidation
 * 
 * This file defines which queries should be invalidated when specific entities are mutated.
 * This ensures that all related data stays in sync and prevents stale data issues.
 * 
 * ✅ RECOMMENDED: Use these maps in mutation hooks to ensure comprehensive invalidation
 */

import type { QueryKey } from "@tanstack/react-query";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { collegeKeys } from "@/features/college/hooks/query-keys";

/**
 * Helper type for invalidation map entries
 * Can be a QueryKey array or a function that returns a QueryKey array
 */
type InvalidationKeys = readonly QueryKey[] | ((id: number) => readonly QueryKey[]);

/**
 * School module invalidation maps
 */
export const SCHOOL_INVALIDATION_MAPS = {
  student: {
    create: [
      schoolKeys.students.root(),
      schoolKeys.enrollments.root(), // Student name appears in enrollment data
      schoolKeys.reservations.root(), // Student name appears in reservations
      schoolKeys.admissions.root(), // New student affects admissions
    ],
    update: (studentId: number) => [
      schoolKeys.students.detail(studentId),
      schoolKeys.students.root(), // Invalidates all list queries
      schoolKeys.enrollments.root(), // Student name appears in enrollment data
      schoolKeys.attendance.root(), // Student name appears in attendance
      schoolKeys.reservations.root(), // Student name appears in reservations
      schoolKeys.admissions.root(), // Student update affects admissions
    ],
    delete: [
      schoolKeys.students.root(),
      schoolKeys.enrollments.root(), // Student deletion affects enrollment data
      schoolKeys.attendance.root(), // Student deletion affects attendance
      schoolKeys.reservations.root(), // Student deletion affects reservations
      schoolKeys.admissions.root(), // Student deletion affects admissions
    ],
  },
  reservation: {
    create: [
      schoolKeys.reservations.root(),
      schoolKeys.admissions.root(), // New reservation affects admissions
    ],
    update: (reservationId: number) => [
      schoolKeys.reservations.detail(reservationId),
      schoolKeys.reservations.root(),
      schoolKeys.admissions.root(), // Reservation update affects admissions
    ],
    delete: [
      schoolKeys.reservations.root(),
      schoolKeys.admissions.root(), // Reservation deletion affects admissions
    ],
  },
  enrollment: {
    create: [
      schoolKeys.enrollments.root(),
      schoolKeys.students.root(), // Enrollment affects student data
    ],
    update: (enrollmentId: number) => [
      schoolKeys.enrollments.detail(enrollmentId),
      schoolKeys.enrollments.root(),
      schoolKeys.students.root(), // Enrollment update affects student data
    ],
    delete: [
      schoolKeys.enrollments.root(),
      schoolKeys.students.root(), // Enrollment deletion affects student data
    ],
  },
  attendance: {
    create: [
      schoolKeys.attendance.root(),
      schoolKeys.students.root(), // Attendance affects student data
    ],
    update: (attendanceId: number) => [
      schoolKeys.attendance.detail(attendanceId),
      schoolKeys.attendance.root(),
      schoolKeys.students.root(), // Attendance update affects student data
    ],
    delete: [
      schoolKeys.attendance.root(),
      schoolKeys.students.root(), // Attendance deletion affects student data
    ],
  },
  fee: {
    payment: [
      schoolKeys.tuition.root(),
      schoolKeys.transport.root(),
      schoolKeys.income.root(), // Fee payment creates income record
      schoolKeys.students.root(), // Fee balance affects student data
      schoolKeys.enrollments.root(), // Fee balance affects enrollment data
    ],
    update: (balanceId: number) => [
      schoolKeys.tuition.detail(balanceId),
      schoolKeys.tuition.root(),
      schoolKeys.transport.detail(balanceId),
      schoolKeys.transport.root(),
      schoolKeys.students.root(),
      schoolKeys.enrollments.root(),
    ],
  },
  income: {
    create: [
      schoolKeys.income.root(),
      schoolKeys.reservations.root(), // Income affects reservation status
    ],
    update: (incomeId: number) => [
      schoolKeys.income.detail(incomeId),
      schoolKeys.income.root(),
      schoolKeys.reservations.root(), // Income update affects reservation status
    ],
    delete: [
      schoolKeys.income.root(),
      schoolKeys.reservations.root(), // Income deletion affects reservation status
    ],
  },
  expenditure: {
    create: [schoolKeys.expenditure.root()],
    update: (expenditureId: number) => [
      schoolKeys.expenditure.detail(expenditureId),
      schoolKeys.expenditure.root(),
    ],
    delete: [schoolKeys.expenditure.root()],
  },
} as const;

/**
 * College module invalidation maps
 */
export const COLLEGE_INVALIDATION_MAPS = {
  student: {
    create: [
      collegeKeys.students.root(),
      collegeKeys.enrollments.root(), // Student name appears in enrollment data
      collegeKeys.reservations.root(), // Student name appears in reservations
      collegeKeys.admissions.root(), // New student affects admissions
    ],
    update: (studentId: number) => [
      collegeKeys.students.detail(studentId),
      collegeKeys.students.root(), // Invalidates all list queries
      collegeKeys.enrollments.root(), // Student name appears in enrollment data
      collegeKeys.attendance.root(), // Student name appears in attendance
      collegeKeys.reservations.root(), // Student name appears in reservations
      collegeKeys.admissions.root(), // Student update affects admissions
    ],
    delete: [
      collegeKeys.students.root(),
      collegeKeys.enrollments.root(), // Student deletion affects enrollment data
      collegeKeys.attendance.root(), // Student deletion affects attendance
      collegeKeys.reservations.root(), // Student deletion affects reservations
      collegeKeys.admissions.root(), // Student deletion affects admissions
    ],
  },
  reservation: {
    create: [
      collegeKeys.reservations.root(),
      collegeKeys.admissions.root(), // New reservation affects admissions
    ],
    update: (reservationId: number) => [
      collegeKeys.reservations.detail(reservationId),
      collegeKeys.reservations.root(),
      collegeKeys.admissions.root(), // Reservation update affects admissions
    ],
    delete: [
      collegeKeys.reservations.root(),
      collegeKeys.admissions.root(), // Reservation deletion affects admissions
    ],
  },
  enrollment: {
    create: [
      collegeKeys.enrollments.root(),
      collegeKeys.students.root(), // Enrollment affects student data
    ],
    update: (enrollmentId: number) => [
      collegeKeys.enrollments.detail(enrollmentId),
      collegeKeys.enrollments.root(),
      collegeKeys.students.root(), // Enrollment update affects student data
    ],
    delete: [
      collegeKeys.enrollments.root(),
      collegeKeys.students.root(), // Enrollment deletion affects student data
    ],
  },
  attendance: {
    create: [
      collegeKeys.attendance.root(),
      collegeKeys.students.root(), // Attendance affects student data
    ],
    update: (attendanceId: number) => [
      collegeKeys.attendance.detail(attendanceId),
      collegeKeys.attendance.root(),
      collegeKeys.students.root(), // Attendance update affects student data
    ],
    delete: [
      collegeKeys.attendance.root(),
      collegeKeys.students.root(), // Attendance deletion affects student data
    ],
  },
  fee: {
    payment: [
      collegeKeys.tuition.root(),
      collegeKeys.transport.root(),
      collegeKeys.income.root(), // Fee payment creates income record
      collegeKeys.students.root(), // Fee balance affects student data
      collegeKeys.enrollments.root(), // Fee balance affects enrollment data
    ],
    update: (balanceId: number) => [
      collegeKeys.tuition.detail(balanceId),
      collegeKeys.tuition.root(),
      collegeKeys.transport.detail(balanceId),
      collegeKeys.transport.root(),
      collegeKeys.students.root(),
      collegeKeys.enrollments.root(),
    ],
  },
  income: {
    create: [
      collegeKeys.income.root(),
      collegeKeys.reservations.root(), // Income affects reservation status
    ],
    update: (incomeId: number) => [
      collegeKeys.income.detail(incomeId),
      collegeKeys.income.root(),
      collegeKeys.reservations.root(), // Income update affects reservation status
    ],
    delete: [
      collegeKeys.income.root(),
      collegeKeys.reservations.root(), // Income deletion affects reservation status
    ],
  },
  expenditure: {
    create: [collegeKeys.expenditure.root()],
    update: (expenditureId: number) => [
      collegeKeys.expenditure.detail(expenditureId),
      collegeKeys.expenditure.root(),
    ],
    delete: [collegeKeys.expenditure.root()],
  },
} as const;

/**
 * Helper function to resolve invalidation keys
 * Handles both QueryKey arrays and functions that return QueryKey arrays
 */
export function resolveInvalidationKeys(
  keys: InvalidationKeys,
  id?: number
): QueryKey[] {
  if (typeof keys === "function") {
    if (typeof id !== "number") return [];
    return [...keys(id)];
  }
  return [...keys];
}

