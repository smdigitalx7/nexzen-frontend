# School API Endpoints

Base prefix: `/api/v1/school`

Note: Dynamic segments are shown in `{curly}` braces.

## Classes (`/api/v1/school/classes`)
- GET `/api/v1/school/classes` — list classes
- POST `/api/v1/school/classes` — create class
- GET `/api/v1/school/classes/{class_id}/subjects` — get classes with subjects
- DELETE `/api/v1/school/classes/{class_id}/subject/{subject_id}` — delete class subject relation
- GET `/api/v1/school/classes/{id}` — get class by id
- PUT `/api/v1/school/classes/{id}` — update class

## Sections (`/api/v1/school/classes/{class_id}/sections`)
- GET `/api/v1/school/classes/{class_id}/sections` — list sections for class
- POST `/api/v1/school/classes/{class_id}/sections` — create section
- GET `/api/v1/school/classes/{class_id}/sections/{id}` — get section
- PUT `/api/v1/school/classes/{class_id}/sections/{id}` — update section

## Subjects (`/api/v1/school/subjects`)
- GET `/api/v1/school/subjects` — list subjects
- POST `/api/v1/school/subjects` — create subject
- GET `/api/v1/school/subjects/{id}` — get subject
- PUT `/api/v1/school/subjects/{id}` — update subject
- DELETE `/api/v1/school/subjects/{id}` — delete subject
- GET `/api/v1/school/subjects/{subject_id}/classes` — list classes for subject
- DELETE `/api/v1/school/subjects/{subject_id}/classes/{class_id}` — remove class from subject

## Class-Subjects (`/api/v1/school/class-subjects`)
- GET `/api/v1/school/class-subjects` — list class-subject mappings
- POST `/api/v1/school/class-subjects` — create class-subject mapping

## Teacher Class Subjects (`/api/v1/school/teacher-class-subjects`)
- GET `/api/v1/school/teacher-class-subjects` — list mappings
- POST `/api/v1/school/teacher-class-subjects` — create mapping
- DELETE `/api/v1/school/teacher-class-subjects/{teacher_id}/{class_id}/{subject_id}` — delete mapping

## Tuition Fee Structures (`/api/v1/school/tuition-fee-structures`)
- GET `/api/v1/school/tuition-fee-structures` — list structures
- POST `/api/v1/school/tuition-fee-structures` — create
- GET `/api/v1/school/tuition-fee-structures/{fee_structure_id}` — get structure
- PUT `/api/v1/school/tuition-fee-structures/{fee_structure_id}` — update
- GET `/api/v1/school/tuition-fee-structures/class/{class_id}` — get by class

## Exams (`/api/v1/school/exams`)
- GET `/api/v1/school/exams` — list exams
- POST `/api/v1/school/exams` — create exam
- GET `/api/v1/school/exams/{exam_id}` — get exam
- PUT `/api/v1/school/exams/{exam_id}` — update exam

## Tests (`/api/v1/school/tests`)
- GET `/api/v1/school/tests` — list tests
- POST `/api/v1/school/tests` — create test
- GET `/api/v1/school/tests/{test_id}` — get test
- PUT `/api/v1/school/tests/{test_id}` — update test
- DELETE `/api/v1/school/tests/{test_id}` — delete test

## Reservations (`/api/v1/school/reservations`)
- POST `/api/v1/school/reservations` — create reservation
- GET `/api/v1/school/reservations` — Get All Reservations
- GET `/api/v1/school/reservations/dashboard` - Get Reservation Dashboard
- GET `/api/v1/school/reservations/recent` - Get Recent Reservation
- GET `/api/v1/school/reservations/{reservation_id}` — get reservation by id
- PUT `/api/v1/school/reservations/{reservation_id}` — update reservation
- DELETE `/api/v1/school/reservations/{reservation_id}` — delete reservation
- PUT `/api/v1/school/reservations/{reservation_id}/consession` - Update Reservation Consession
- PUT `/api/v1/school/reservations/{reservation_id}/status` — update Reservation status

## Students (`/api/v1/school/students`)
- GET `/api/v1/school/students` — list students
- POST `/api/v1/school/students` — create student
- GET `/api/v1/school/students/{student_id}` — get student
- PUT `/api/v1/school/students/{student_id}` — update student
- GET `/api/v1/school/students/admission-no/{admission_no}` — get by admission no


## Enrollments (`/api/v1/school/enrollments`)
- GET `/api/v1/school/enrollments` — list enrollments (paginated)
- POST `/api/v1/school/enrollments` — create enrollment
- GET `/api/v1/school/enrollments/{enrollment_id}` — get enrollment
- DELETE `/api/v1/school/enrollments/{enrollment_id}` — delete enrollment
- PUT `/api/v1/school/enrollments/{enrollment_id}` — update enrollment
- GET `/api/v1/school/enrollments/by-admission/{admission_no}` — get by admission no

## Student Attendance (`/api/v1/school/student-attendance`)
- GET `/api/v1/school/student-attendance/students` — get all students
- GET `/api/v1/school/student-attendance/{attendance_id}` — get attendance
- PUT `/api/v1/school/student-attendance/{attendance_id}` — update
- DELETE `/api/v1/school/student-attendance/{attendance_id}` — delete
- POST `/api/v1/school/student-attendance` — create
- POST `/api/v1/school/student-attendance/bulk-create` — bulk create
- PUT `/api/v1/school/student-attendance/bulk-update` — bulk update

## Tuition Fee Balances (`/api/v1/school/tuition-fee-balances`)
- GET `/api/v1/school/tuition-fee-balances/dashboard` - Get Dashboard
- GET `/api/v1/school/tuition-fee-balances/` — list (paginated)
- GET `/api/v1/school/tuition-fee-balances/{balance_id}` — get balance by id
- PUT `/api/v1/school/tuition-fee-balances/{balance_id}/pay-term` — pay term
- PUT `/api/v1/school/tuition-fee-balances/{balance_id}/pay-book-fee` — pay book fee
- POST `/api/v1/school/tuition-fee-balances/bulk-create` — bulk create
- GET `/api/v1/school/tuition-fee-balances/reports/unpaid-terms` — unpaid terms report
- GET `/api/v1/school/tuition-fee-balances/by-admission/{admission_no}` — by admission no

## Transport Fee Balances (`/api/v1/school/transport-fee-balances`)
- GET `/api/v1/school/transport-fee-balances/dashboard` - Get Dashboard
- GET `/api/v1/school/transport-fee-balances` — list (paginated)
- GET `/api/v1/school/transport-fee-balances/{balance_id}` — get balance by id
- PUT `/api/v1/school/transport-fee-balances/{balance_id}/pay-term` — pay term
- POST `/api/v1/school/transport-fee-balances/bulk-create` — bulk create
- GET `/api/v1/school/transport-fee-balances/by-admission/{admission_no}` — by admission no

## Student Transport (`/api/v1/school/student-transport`)
- GET `/api/v1/school/student-transport-assignments/dashboard` - Get Dashboard
- GET `/api/v1/school/student-transport-assignments` — list route-wise
- POST `/api/v1/school/student-transport-assignments` — create assignment
- GET `/api/v1/school/student-transport-assignments/{transport_assignment_id}` — get assignment by id
- PUT `/api/v1/school/student-transport-assignments/{transport_assignment_id}` — update assignment
- GET `/api/v1/school/student-transport-assignments/by-admission/{admission_no}` — by admission no

## Income (`/api/v1/school/income`)
- GET `/api/v1/school/income/dashboard` - Get Dashboard
- GET `/api/v1/school/income/recent` - Get Recent Income
- GET `/api/v1/school/income` — list income entries
- GET `/api/v1/school/income/{income_id}` — get by income id
- PUT `/api/v1/school/income/{income_id}` — update by income id
- POST `/api/v1/school/income/by-admission/{admission_no}` — create by admission
- POST `/api/v1/school/income/by-reservation` — create by reservation

## Expenditure (`/api/v1/school/expenditure`)
- GET `/api/v1/school/expenditure/dashboard` - Get Dashboard
- GET `/api/v1/school/expenditure/recent` - Get Recent Expenditure
- GET `/api/v1/school/expenditure` — list entries
- POST `/api/v1/school/expenditure` — create entry
- GET `/api/v1/school/expenditure/{expenditure_id}` — get by expenditure id
- PUT `/api/v1/school/expenditure/{expenditure_id}` — update by expenditure id
- DELETE `/api/v1/school/expenditure/{expenditure_id}` — delete by expenditure id

## Exam Marks (`/api/v1/school/exam-marks`)
- GET `/api/v1/school/exam-marks` — list grouped
- POST `/api/v1/school/exam-marks` — create
- GET `/api/v1/school/exam-marks/{mark_id}` — get by mark id
- PUT `/api/v1/school/exam-marks/{mark_id}` — update
- DELETE `/api/v1/school/exam-marks/{mark_id}` — delete
- POST `/api/v1/school/exam-marks/bulk-create` — bulk create

## Test Marks (`/api/v1/school/test-marks`)
- GET `/api/v1/school/test-marks` — list grouped
- POST `/api/v1/school/test-marks` — create
- GET `/api/v1/school/test-marks/{test_mark_id}` — get by test mark id
- PUT `/api/v1/school/test-marks/{test_mark_id}` — update by test mark id
- DELETE `/api/v1/school/test-marks/{test_mark_id}` — delete by test mark id
- POST `/api/v1/school/test-marks/bulk-create` — bulk create
