export * from "./admissions";
export * from "./classes";
export * from "./sections";
export * from "./subjects";
export * from "./class-subjects";
export * from "./students";
export * from "./enrollments";
export * from "./attendance";
export * from "./tuition-fee-balances";
export * from "./transport-fee-balances";
export * from "./income";
export * from "./expenditure";
export * from "./reservations";
export * from "./exams";
export * from "./tests";
export * from "./tuition-fee-structure";
export * from "./teacher-class-subjects";
export * from "./student-transport-assignments";
export * from "./marks";
// Avoid duplicate exports with `./marks` (which already exports core mark types).
// Re-export only the extra bulk types that are defined in these files.
export type {
  BulkMultipleStudentsSubject,
  BulkMultipleStudentsStudent,
  CreateBulkMultipleStudentsRequest,
  BulkMultipleStudentsResponse,
} from "./exam-marks";
export type {
  CreateBulkMultipleStudentsTestRequest,
  BulkMultipleStudentsTestResponse,
} from "./test-marks";
export * from "./transport";
export * from "./full-student-view";
export * from "./promotion";
