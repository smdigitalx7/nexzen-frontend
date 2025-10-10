# School API Endpoints

Base prefix: `/api/v1/college`

Note: Dynamic segments are shown in `{curly}` braces.

## Classes (`/api/v1/college/classes`)
- GET `/api/v1/college/classes` — list classes
- POST `/api/v1/college/classes` — create class
- GET `/api/v1/college/classes/list` — get classes list
- GET `/api/v1/college/classes/{class_id}/groups` — get classes with groups
- PUT `/api/v1/college/classes/{class_id}` — update class
- DELETE `/api/v1/college/classes/{class_id}/groups/{group_id}` — Remove Group From Class

## Groups (`/api/v1/college/groups`)
- GET `/api/v1/college/groups` — list groups
- POST `/api/v1/college/groups` — create groups
- GET `/api/v1/college/groups/list` — list group list
- GET `/api/v1/college/groups/{group_id}` — get groups by id
- PUT `/api/v1/college/groups/{group_id}` — update group
- DELETE `/api/v1/college/groups/{group_id}` — delete group
- GET `/api/v1/college/groups/{group_id}/courses` — get group with courses
- GET `/api/v1/college/groups/{group_id}/subjects` — get group with subjects
- DELETE `/api/v1/college/groups/{group_id}/subjects/{class_id}` — delete group subject relation

## Courses (`/api/v1/college/courses`)
- GET `/api/v1/college/courses` — get courses
- POST `/api/v1/college/courses` — create course
- GET `/api/v1/college/courses/list` — get courses list
- GET `/api/v1/college/courses/{course_id}` — get by courses id
- PUT `/api/v1/college/courses/{course_id}` — update by courses id
- DELETE `/api/v1/college/courses/{course_id}` — delete by courses id

## Subjects (`/api/v1/college/subjects`)
- GET `/api/v1/college/subjects` — get subjects
- POST `/api/v1/college/subjects` — create subjects
- GET `/api/v1/college/subjects/list` — get subject list
- GET `/api/v1/college/subjects/{subject_id}` — get by subject id
- PUT `/api/v1/college/subjects/{subject_id}` — update by subject id
- DELETE `/api/v1/college/subjects/{subject_id}` — delete by subject id

## Exams (`/api/v1/college/exams`)
- GET `/api/v1/college/exams` — list exams
- POST `/api/v1/college/exams` — create exam
- GET `/api/v1/college/exams/{exam_id}` — get exam
- PUT `/api/v1/college/exams/{exam_id}` — update exam
- DELETE `/api/v1/college/exams/{exam_id}` — delete exam

## Tests (`/api/v1/college/tests`)
- GET `/api/v1/college/tests` — list tests
- POST `/api/v1/college/tests` — create test
- GET `/api/v1/college/tests/{test_id}` — get test
- PUT `/api/v1/college/tests/{test_id}` — update test
- DELETE `/api/v1/college/tests/{test_id}` — delete test

## Teacher Group Subjects (`/api/v1/college/teacher-class-groups`)
- GET `/api/v1/college/teacher-group-subjects` - Get All
- POST `/api/v1/college/teacher-group-subjects` - Create
- GET `/api/v1/college/teacher-group-subjects/teacher/{teacher_id}` - Get By Teacher Id
- DELETE `/api/v1/college/teacher-group-subjects/teacher/{teacher_id}` - Delete By Teacher
- DELETE `/api/v1/college/teacher-group-subjects/teacher/{teacher_id}/groups/{group_id}/subjects/{subject_id}` - Delete Relation

## Teacher Course Subjects (`/api/v1/college/teacher-class-groups`)
- GET `/api/v1/college/teacher-course-subjects` - Get All
- POST `/api/v1/college/teacher-course-subjects` - Create
- GET `/api/v1/college/teacher-course-subjects/teacher/{teacher_id}` - Get By Teacher Id
- DELETE `/api/v1/college/teacher-course-subjects/teacher/{teacher_id}` - Delete By Teacher
- DELETE `/api/v1/college/teacher-course-subjects/teacher/{teacher_id}/courses/{course_id}/subjects/{subject_id}` - Delete Relation

## Reservations (`/api/v1/college/reservations`)
- GET `/api/v1/college/reservations/dashboard` - Get Reservation Dashboard
- GET `/api/v1/college/reservations/recent` - Get Recent Reservation
- GET `/api/v1/college/reservations` — Get All Reservations
- POST `/api/v1/college/reservations` — create reservation
- GET `/api/v1/college/reservations/{reservation_id}` — get reservation by id
- PUT `/api/v1/college/reservations/{reservation_id}` — update reservation
- DELETE `/api/v1/college/reservations/{reservation_id}` — delete reservation
- PUT `/api/v1/college/reservations/{reservation_id}/status` — update Reservation status
- PUT `/api/v1/college/reservations/{reservation_id}/consession` - Update Reservation Consessions


## Students (`/api/v1/college/students`)
- GET `/api/v1/college/students` — list students
- POST `/api/v1/college/students` — create student
- GET `/api/v1/college/students/{student_id}` — get student by id
- PUT `/api/v1/college/students/{student_id}` — update student
- DELETE `/api/v1/college/students/{student_id}` — delete student
- GET `/api/v1/college/students/admission-no/{admission_no}` — get by admission no

## Student Enrollments (`/api/v1/college/student-enrollments`)
- GET `/api/v1/college/student-enrollments` — list enrollments (paginated)
- POST `/api/v1/college/student-enrollments` — create enrollment
- GET `/api/v1/college/student-enrollments/{enrollment_id}` — get enrollment
- PUT `/api/v1/college/student-enrollments/{enrollment_id}` — update enrollment
- DELETE `/api/v1/college/student-enrollments/{enrollment_id}` — delete enrollment
- GET `/api/v1/college/student-enrollments/by-admission/{admission_no}` — get by admission no

## Student Attendance (`/api/v1/college/student-attendance`)
- GET `/api/v1/college/student-attendance/students` — get all students
- POST `/api/v1/college/student-attendance` — create
- GET `/api/v1/college/student-attendance/{attendance_id}` — get attendance by id
- PUT `/api/v1/college/student-attendance/{attendance_id}` — update
- DELETE `/api/v1/college/student-attendance/{attendance_id}` — delete
- GET `/api/v1/college/student-attendance/by-admission/{admission_no}` - get by admission no
- POST `/api/v1/college/student-attendance/bulk-create` — bulk create


## Student Transport Assignments (`/api/v1/college/student-transport-assignments`)
- GET `/api/v1/college/student-transport-assignments/dashboard` - Get Dashboard
- GET `/api/v1/college/student-transport-assignments` — list route-wise
- POST `/api/v1/college/student-transport-assignments` — create assignment
- GET `/api/v1/college/student-transport-assignments/{transport_assignment_id}` — get assignment by id
- PUT `/api/v1/college/student-transport-assignments/{transport_assignment_id}` — update assignment
- DELETE `/api/v1/college/student-transport-assignments/{transport_assignment_id}` — delete assignment

## Tuition Fee Balances (`/api/v1/college/tuition-fee-balances`)
- GET `/api/v1/college/tuition-fee-balances/dashboard` - Get Dashboard
- GET `/api/v1/college/tuition-fee-balances` — list (paginated)
- POST `/api/v1/college/tuition-fee-balances` — Create
- GET `/api/v1/college/tuition-fee-balances/by-admission-no/{admission_no}` — by admission no
- GET `/api/v1/college/tuition-fee-balances/{balance_id}` — get balance by id
- PUT `/api/v1/college/tuition-fee-balances/{balance_id}` — update balance by id
- DELETE `/api/v1/college/tuition-fee-balances/{balance_id}` — delete balance by id
- POST `/api/v1/college/tuition-fee-balances/bulk-create` — bulk create
- GET `/api/v1/college/tuition-fee-balances/reports/unpaid-terms/` — unpaid terms report
- PUT `/api/v1/college/tuition-fee-balances/{balance_id}/term-payment` — Update term payment
- PUT `/api/v1/college/tuition-fee-balances/{balance_id}/book-payment` — Update book payment


## Transport Fee Balances (`/api/v1/college/transport-fee-balances`)
- GET `/api/v1/college/transport-fee-balances/dashboard` - Get Dashboard
- GET `/api/v1/college/transport-fee-balances` — list (paginated)
- POST `/api/v1/college/transport-fee-balances` — create transport fee balance
- GET `/api/v1/college/transport-fee-balances/{balance_id}` — get balance by id
- PUT `/api/v1/college/transport-fee-balances/{balance_id}` — update balance by id
- DELETE `/api/v1/college/transport-fee-balances/{balance_id}` — delete balance by id
- POST `/api/v1/college/transport-fee-balances/bulk-create` — bulk create
- PUT `/api/v1/college/transport-fee-balances/{balance_id}/term-payment` — update term payment

## Income (`/api/v1/college/income`)
- GET `/api/v1/college/income/dashboard` - Get Dashboard
- GET `/api/v1/college/income/recent` - Get Recent Income
- GET `/api/v1/college/income` — list income entries
- GET `/api/v1/college/income/{income_id}` — get by income id
- PUT `/api/v1/college/income/{income_id}` — update by income id
- POST `/api/v1/college/income/by-admission/{admission_no}` — create by admission
- POST `/api/v1/college/income/by-reservation` — create by reservation

## Expenditure (`/api/v1/college/expenditure`)
- GET `/api/v1/college/expenditure/dashboard` - Get Dashboard
- GET `/api/v1/college/expenditure/recent` - Get Recent Expenditure
- GET `/api/v1/college/expenditure` — list entries
- POST `/api/v1/college/expenditure` — create entry
- GET `/api/v1/college/expenditure/{expenditure_id}` — get by expenditure id
- PUT `/api/v1/college/expenditure/{expenditure_id}` — update by expenditure id
- DELETE `/api/v1/college/expenditure/{expenditure_id}` — delete by expenditure id

## Exam Marks (`/api/v1/college/exam-marks`)
- GET `/api/v1/college/exam-marks` — list grouped
- POST `/api/v1/college/exam-marks` — create
- GET `/api/v1/college/exam-marks/{mark_id}` — get by mark id
- PUT `/api/v1/college/exam-marks/{mark_id}` — update
- DELETE `/api/v1/college/exam-marks/{mark_id}` — delete
- POST `/api/v1/college/exam-marks/bulk-create` — bulk create

## Test Marks (`/api/v1/college/test-marks`)
- GET `/api/v1/college/test-marks` — list grouped
- POST `/api/v1/college/test-marks` — create
- GET `/api/v1/college/test-marks/{test_mark_id}` — get by test mark id
- PUT `/api/v1/college/test-marks/{test_mark_id}` — update by test mark id
- DELETE `/api/v1/college/test-marks/{test_mark_id}` — delete by test mark id
- POST `/api/v1/college/test-marks/bulk-create` — bulk create
