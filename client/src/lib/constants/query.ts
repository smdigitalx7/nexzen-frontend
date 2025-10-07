/**
 * Shared constants for React Query configuration
 */

// Query cache and stale time constants
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const QUERY_CACHE_TIME = 1000 * 60 * 10; // 10 minutes
export const QUERY_RETRY_ATTEMPTS = 3;
export const QUERY_RETRY_DELAY = 1000; // 1 second

// Query key prefixes for consistent organization
export const QUERY_KEYS = {
  // Academic
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  EXAMS: 'exams',
  TESTS: 'tests',
  ACADEMIC_YEARS: 'academic-years',
  
  // Students
  STUDENTS: 'students',
  ENROLLMENTS: 'enrollments',
  STUDENT_TRANSPORT: 'student-transport',
  
  // Employees
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  ADVANCES: 'advances',
  PAYROLLS: 'payrolls',
  
  // Financial
  INCOME: 'income',
  EXPENDITURE: 'expenditure',
  FEE_STRUCTURES: 'fee-structures',
  FEE_BALANCES: 'fee-balances',
  
  // System
  BRANCHES: 'branches',
  USERS: 'users',
  ROLES: 'roles',
  TRANSPORT: 'transport',
  
  // College
  GROUPS: 'groups',
  COURSES: 'courses',
  COMBINATIONS: 'combinations',
  SECTIONS: 'sections',
} as const;

// Common query configurations
export const DEFAULT_QUERY_CONFIG = {
  staleTime: QUERY_STALE_TIME,
  cacheTime: QUERY_CACHE_TIME,
  retry: QUERY_RETRY_ATTEMPTS,
  retryDelay: QUERY_RETRY_DELAY,
} as const;

// Mutation configurations
export const DEFAULT_MUTATION_CONFIG = {
  retry: 1,
  retryDelay: 1000,
} as const;
