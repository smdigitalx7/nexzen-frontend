# Academic Role - Complete Feature & Permission Guide

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Role:** Academic (Academic & Student Management)  
**System:** Velonex ERP - School & College Management

---

## 📋 Table of Contents

1. [Role Overview](#role-overview)
2. [Access Level & Permissions](#access-level--permissions)
3. [Available Features](#available-features)
4. [CRUD Operations & Access Controls](#crud-operations--access-controls)
5. [Validations & Business Rules](#validations--business-rules)
6. [Restrictions & Limitations](#restrictions--limitations)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Best Practices](#best-practices)

---

## 🎯 Role Overview

### Role Definition

**Academic Role** is responsible for **Academic Management and Student Academic Activities**. Academic users handle section mapping, attendance, marks entry, student profiles, and teacher assignments.

### Primary Responsibilities

- Section mapping for students
- Monthly attendance entry and management
- Exam and test marks entry
- Student profile management
- Teacher assignments to subjects
- Academic structure management (classes, subjects, sections, exams)
- Student performance tracking
- Announcements creation and management

### Access Level

**Level:** Academic & Student Management Access  
**Scope:** School/College modules (academic and student management only)  
**Restrictions:** Cannot access financial modules, reservations, admissions, employee management

---

## 🔐 Access Level & Permissions

### Module Access Matrix

| Module | Access Level | Create | Read | Update | Delete | Special Permissions |
|--------|-------------|--------|------|--------|--------|-------------------|
| **School Modules** |
| Students | Full | ❌ | ✅ | ✅ | ❌ | View, edit section, view profiles |
| Academic | Full | ✅ | ✅ | ✅ | ✅ | Manage academic structure |
| Attendance | Full | ✅ | ✅ | ✅ | ❌ | Create, edit (before lock) |
| Marks | Full | ✅ | ✅ | ✅ | ❌ | Create, edit (before lock) |
| Announcements | Full | ✅ | ✅ | ✅ | ✅ | Create, edit, delete |
| **College Modules** |
| Students | Full | ❌ | ✅ | ✅ | ❌ | Same as School |
| Academic | Full | ✅ | ✅ | ✅ | ✅ | Same as School + Groups/Courses |
| Attendance | Full | ✅ | ✅ | ✅ | ❌ | Same as School |
| Marks | Full | ✅ | ✅ | ✅ | ❌ | Same as School |
| Announcements | Full | ✅ | ✅ | ✅ | ✅ | Same as School |
| **Restricted Modules** |
| Reservations | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Admissions | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Fees | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Financial Reports | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Income & Expenditure | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Employee Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Payroll | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Transport Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| User Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Audit Log | View Only | ❌ | ✅ | ❌ | ❌ | View own activities only |

---

## ✨ Available Features

### 1. Student Management

#### 1.1 View Students

**Features:**
- View all students
- Search by name, admission number, mobile, class
- Filter by class, section, academic year
- View student profiles
- View student academic history
- View student attendance summary
- View student marks summary
- Export student list

**Access:** Full Read access

**Restrictions:**
- Cannot create students (Accountant creates via admission)
- Cannot delete students
- Cannot edit personal details (name, Aadhar)

---

#### 1.2 Section Mapping

**Features:**
- View students without sections
- Select class from dropdown
- Select multiple students
- Assign section to students
- Bulk section assignment
- Change student section (mid-year)
- View section-wise student list

**Access:** Full Update access (section assignment)

**Workflow:**
1. Navigate to Students → Section Mapping
2. Select class
3. Select students (individual or bulk)
4. Select section
5. Assign section
6. Confirmation message

**Validations:**
- Section must exist for selected class
- Student must be enrolled in class
- Cannot assign to different class section

---

#### 1.3 Change Student Section

**Features:**
- Select student from list
- View current section
- Select new section
- Enter reason (optional)
- Confirm section change
- Change is logged in audit trail

**Access:** Full Update access

**Restrictions:**
- Can only change to sections in same class
- Cannot change if student has active exams (validation)
- Change is logged for audit

---

#### 1.4 Student Profile

**Features:**
- View complete student profile
- View personal details
- View academic information (class, section)
- View attendance summary
- View marks summary (semwise, total)
- View fee balance (view only, cannot collect)
- View transport details
- View academic history

**Access:** Full Read access

**Restrictions:**
- Cannot edit personal details
- Cannot edit fee information
- Cannot edit transport details
- View only for financial data

---

### 2. Academic Management

#### 2.1 Academic Year Management

**Features:**
- View academic years
- Create new academic year
- Edit academic year details
- Set active academic year
- View academic year history

**Access:** Full CRUD access

**Validations:**
- Year name must be unique
- End date must be after start date
- Cannot overlap with existing years

---

#### 2.2 Class Management

**Features:**
- View all classes
- Create new class
- Edit class details
- Deactivate class (cannot delete with students)
- View class-wise student count

**Access:** Full CRUD access (with restrictions)

**Validations:**
- Class name must be unique
- Class order must be unique
- Must be numeric

**Restrictions:**
- Cannot delete class with students
- Cannot delete class with subjects
- Must deactivate instead

---

#### 2.3 Subject Management

**Features:**
- View all subjects
- Create new subject
- Edit subject details
- Delete subject (if no marks)
- View subject-wise marks

**Access:** Full CRUD access (with restrictions)

**Validations:**
- Subject name must be unique
- Subject code must be unique (if provided)

**Restrictions:**
- Cannot delete subject with marks
- Cannot delete subject assigned to classes

---

#### 2.4 Section Management

**Features:**
- View all sections
- Create new section for class
- Edit section details
- Delete section (if no students)
- View section-wise student count

**Access:** Full CRUD access (with restrictions)

**Validations:**
- Section name must be unique within class
- Cannot exceed class capacity (if set)

**Restrictions:**
- Cannot delete section with students
- Must reassign students before deletion

---

#### 2.5 Exam Management

**Features:**
- View all exams
- Create new exam
- Edit exam details
- Delete exam (if no marks)
- Set exam dates
- Set maximum marks
- View exam-wise marks

**Access:** Full CRUD access (with restrictions)

**Validations:**
- Exam name must be unique
- End date must be after start date
- Must be within academic year

**Restrictions:**
- Cannot delete exam with marks
- Cannot edit exam dates after marks entry starts

---

#### 2.6 Test Management

**Features:**
- View all tests
- Create new test
- Edit test details
- Delete test (if no marks)
- Assign subjects to test
- Assign classes to test
- View test-wise marks

**Access:** Full CRUD access (with restrictions)

**Validations:**
- Test date must be valid
- Must select at least one subject
- Must select at least one class

**Restrictions:**
- Cannot delete test with marks
- Cannot edit test date after marks entry

---

#### 2.7 Teacher Assignments

**Features:**
- View all teacher assignments
- Assign teachers to subjects
- Assign teachers to classes
- Assign teachers to sections (optional)
- View teacher-wise assignments
- Edit teacher assignments
- Delete teacher assignments

**Access:** Full CRUD access

**Features:**
- One teacher can teach multiple subjects
- One teacher can teach multiple classes
- Can assign section-specific teachers
- View assignments by teacher, subject, class

**College-Specific:**
- Assign teachers to Course + Group + Subject
- One teacher can teach multiple Groups
- One teacher can teach multiple Courses

---

### 3. Attendance Management

#### 3.1 Monthly Attendance Entry

**Features:**
- Create monthly attendance
- Select class and section
- Select month and year
- Enter attendance for each student
- Enter present days
- Enter absent days
- Enter leave days
- Bulk entry options (mark all present/absent)
- Calculate totals automatically
- Save attendance (locks for month)

**Access:** Full Create and Update access (before lock)

**Workflow:**
1. Navigate to Attendance → Create
2. Select academic year, class, section
3. Select month and year
4. View student list
5. Enter attendance (present, absent, leave)
6. System calculates totals
7. Save attendance (locks for month)

**Validations:**
- Present + Absent + Leave = Total Working Days
- Cannot exceed total working days
- Cannot be negative
- Must be numeric

**Restrictions:**
- ⚠️ **Cannot edit after saving** (locked for month)
- ⚠️ **Cannot edit previous months**
- Admin can override locks

---

#### 3.2 View Attendance

**Features:**
- View all attendance records
- View by student
- View by class
- View by month
- View by date range
- View attendance percentage
- Export attendance reports

**Access:** Full Read access

---

#### 3.3 Attendance Statistics

**Features:**
- View overall attendance rate
- View class-wise attendance
- View monthly trends
- View low attendance alerts
- View attendance reports

**Access:** Full Read access

---

### 4. Marks Management

#### 4.1 Exam Marks Entry

**Features:**
- Create exam marks entry
- Select exam from dropdown
- Select class and section
- View student list
- Enter marks for each student and subject
- Enter marks obtained
- Maximum marks (auto-filled)
- Grade (auto-calculated)
- Bulk entry option
- Save marks (locks marks)

**Access:** Full Create and Update access (before lock)

**Workflow:**
1. Navigate to Marks → Exam Marks
2. Select exam
3. Select class and section
4. View student list with subjects
5. Enter marks for each student and subject
6. System validates marks
7. Save marks (locks marks)

**Validations:**
- Marks cannot exceed maximum
- Marks cannot be negative
- All required subjects must have marks
- Must be numeric (decimal allowed if configured)

**Restrictions:**
- ⚠️ **Cannot edit after saving** (locked)
- ⚠️ **Cannot edit previous exam marks**
- Admin can override locks

---

#### 4.2 Test Marks Entry

**Features:**
- Create test marks entry
- Select test from dropdown
- Select class and section
- Enter marks for students
- Similar workflow to exam marks

**Access:** Full Create and Update access (before lock)

**Restrictions:**
- Same as exam marks (locked after save)

---

#### 4.3 View Marks

**Features:**
- View all marks
- View by student
- View by exam/test
- View by class
- View by subject
- Export marks reports

**Access:** Full Read access

---

#### 4.4 Marks Reports

**Features:**
- Student Performance Report
- Semwise Report (Sem-1: FA1, FA2, SA1; Sem-2: FA3, FA4, SA2)
- Total Exams Report (combined Sem1 and Sem2)
- Subject-wise Report
- Class-wise Report
- Export to PDF/Excel

**Access:** Full Read and Export access

---

### 5. Announcements

#### 5.1 Create Announcements

**Features:**
- Create new announcement
- Enter title and message
- Select announcement type (Holiday, Transport Issue, General, Exam/Test)
- Select target audience (All classes, Specific class, Specific route)
- Set priority (High, Medium, Low)
- Set start date and end date
- Publish announcement

**Access:** Full Create access

**Validations:**
- Title is required
- Message is required
- Type is required
- Start date is required
- Target audience is required

---

#### 5.2 View Announcements

**Features:**
- View all announcements
- Filter by type, date, class
- Search by title
- View announcement details
- View target audience

**Access:** Full Read access

---

#### 5.3 Edit Announcements

**Features:**
- Edit announcement details
- Edit title, message, dates
- Change target audience
- Update priority

**Access:** Limited Update access

**Restrictions:**
- ⚠️ **Cannot edit after start date**
- ⚠️ **Cannot edit active announcements**
- Can edit before start date only

---

#### 5.4 Delete Announcements

**Features:**
- Delete announcements
- Remove from system

**Access:** Limited Delete access

**Restrictions:**
- ⚠️ **Cannot delete if started**
- ⚠️ **Cannot delete active announcements**
- Can delete before start date only
- Admin can delete any

---

## 🔒 CRUD Operations & Access Controls

### Create Operations

**Allowed:**
- ✅ Create academic years, classes, subjects, sections
- ✅ Create exams and tests
- ✅ Create attendance entries
- ✅ Create marks entries
- ✅ Create teacher assignments
- ✅ Create announcements

**Restrictions:**
- ❌ Cannot create students (Accountant creates via admission)
- ❌ Cannot create reservations
- ❌ Cannot create admissions
- ❌ Cannot create fee transactions
- ❌ Cannot create employees

---

### Read Operations

**Allowed:**
- ✅ Read all student data
- ✅ Read all academic data
- ✅ Read all attendance records
- ✅ Read all marks records
- ✅ Read student profiles
- ✅ Read academic reports
- ✅ Read own audit logs

**Restrictions:**
- ❌ Cannot read financial data (fees, payments)
- ❌ Cannot read reservations/admissions
- ❌ Cannot read employee data
- ❌ Cannot read transport data
- ❌ Cannot read other users' audit logs

---

### Update Operations

**Allowed:**
- ✅ Update student sections
- ✅ Update academic settings (classes, subjects, sections, exams)
- ✅ Update attendance (before lock)
- ✅ Update marks (before lock)
- ✅ Update teacher assignments
- ✅ Update announcements (before start date)

**Restrictions:**
- ❌ Cannot update student personal details (name, Aadhar)
- ❌ Cannot update locked attendance (Admin can)
- ❌ Cannot update locked marks (Admin can)
- ❌ Cannot update financial data
- ❌ Cannot update reservations/admissions

**Special Restrictions:**
- ⚠️ **Cannot edit attendance after saving** (locked for month)
- ⚠️ **Cannot edit marks after saving** (locked)
- ⚠️ **Cannot edit announcements after start date**

---

### Delete Operations

**Allowed:**
- ✅ Delete academic settings (if no dependencies)
- ✅ Delete exams/tests (if no marks)
- ✅ Delete teacher assignments
- ✅ Delete announcements (if not started)

**Restrictions:**
- ❌ Cannot delete students
- ❌ Cannot delete classes with students
- ❌ Cannot delete subjects with marks
- ❌ Cannot delete exams/tests with marks
- ❌ Cannot delete attendance records (locked)
- ❌ Cannot delete marks records (locked)
- ❌ Cannot delete announcements after start

---

## ✅ Validations & Business Rules

### Section Mapping Validations

1. **Section Assignment:**
   - Section must exist for selected class
   - Student must be enrolled in class
   - Cannot assign to different class section
   - Section capacity (if set)

2. **Section Change:**
   - Can only change to sections in same class
   - Cannot change if student has active exams
   - Change is logged in audit trail

---

### Attendance Validations

1. **Input Requirements:**
   - Present days: Numeric, cannot exceed total working days
   - Absent days: Numeric, cannot exceed total working days
   - Leave days: Numeric, cannot exceed total working days
   - Cannot be negative

2. **Total Validation:**
   - Present + Absent + Leave = Total Working Days
   - System validates automatically
   - Cannot save if totals don't match

3. **Business Rules:**
   - Once saved, attendance is locked for the month
   - Cannot edit without Admin permission
   - Previous months cannot be edited
   - Working days calculated from calendar

---

### Marks Validations

1. **Input Requirements:**
   - Marks obtained: Numeric, cannot exceed maximum
   - Cannot be negative
   - Decimal values allowed (if configured)
   - All required subjects must have marks

2. **Maximum Marks:**
   - Set during exam/test creation
   - Cannot be changed after marks entry starts
   - Auto-filled in marks entry form

3. **Grade Calculation:**
   - Automatic based on percentage
   - Grade boundaries configurable
   - Calculated per subject and overall

4. **Business Rules:**
   - Once saved, marks are locked
   - Cannot edit without Admin permission
   - Historical marks preserved
   - All subjects must have marks before save

---

### Academic Structure Validations

1. **Class Management:**
   - Class name must be unique
   - Class order must be unique
   - Must be numeric
   - Cannot delete with students/subjects

2. **Subject Management:**
   - Subject name must be unique
   - Subject code must be unique (if provided)
   - Cannot delete with marks

3. **Section Management:**
   - Section name must be unique within class
   - Cannot exceed class capacity (if set)
   - Cannot delete with students

4. **Exam/Test Management:**
   - Exam name must be unique
   - Dates must be within academic year
   - End date must be after start date
   - Cannot delete with marks

---

### Announcement Validations

1. **Required Fields:**
   - Title: Required
   - Message: Required
   - Type: Required
   - Start date: Required
   - Target audience: Required

2. **Business Rules:**
   - Cannot edit after start date
   - Cannot delete if started
   - Historical announcements preserved
   - SMS integration (in development)

---

## 🚫 Restrictions & Limitations

### Access Restrictions

1. **Cannot Access:**
   - Financial modules (Reservations, Admissions, Fees, Financial Reports)
   - Employee Management
   - Payroll Management
   - Transport Management
   - User Management
   - Full Audit Log (only own activities)

2. **Limited Access:**
   - Students: Cannot create/delete, can edit section only
   - Announcements: Cannot edit/delete after start date

---

### Functional Restrictions

1. **Attendance Management:**
   - ⚠️ **Cannot edit after saving** (locked for month)
   - ⚠️ **Cannot edit previous months**
   - Admin can override locks
   - Must contact Admin for corrections

2. **Marks Management:**
   - ⚠️ **Cannot edit after saving** (locked)
   - ⚠️ **Cannot edit previous exam marks**
   - Admin can override locks
   - Must contact Admin for corrections

3. **Student Management:**
   - Cannot create students (Accountant creates via admission)
   - Cannot delete students
   - Cannot edit personal details (name, Aadhar)
   - Can only edit section

4. **Announcement Management:**
   - Cannot edit after start date
   - Cannot delete if started
   - Admin can override

---

### Business Rule Restrictions

1. **Academic Structure:**
   - Cannot delete classes with students
   - Cannot delete subjects with marks
   - Cannot delete exams/tests with marks
   - Must deactivate instead

2. **Data Integrity:**
   - Cannot modify locked data
   - Historical data preserved
   - Audit trail maintained

---

## 📋 Acceptance Criteria

### Section Mapping

**AC1:** Academic can assign sections
- ✅ Select class from dropdown
- ✅ Select students (individual or bulk)
- ✅ Select section
- ✅ Section assigned successfully
- ✅ Students appear in section list

**AC2:** Academic can change section
- ✅ Select student
- ✅ Select new section (same class)
- ✅ Enter reason (optional)
- ✅ Section changed successfully
- ✅ Change logged in audit

---

### Attendance Entry

**AC1:** Academic can create attendance
- ✅ Select class, section, month
- ✅ Enter attendance for students
- ✅ Present + Absent + Leave = Total Working Days
- ✅ Attendance saved successfully
- ✅ Attendance locked for month

**AC2:** Academic cannot edit locked attendance
- ✅ Edit option not available
- ✅ Must contact Admin
- ✅ System enforces restriction

---

### Marks Entry

**AC1:** Academic can enter marks
- ✅ Select exam/test
- ✅ Select class, section
- ✅ Enter marks for all students and subjects
- ✅ Marks validated (cannot exceed maximum)
- ✅ Marks saved successfully
- ✅ Marks locked

**AC2:** Academic cannot edit locked marks
- ✅ Edit option not available
- ✅ Must contact Admin
- ✅ System enforces restriction

---

### Academic Management

**AC1:** Academic can manage academic structure
- ✅ Create classes, subjects, sections
- ✅ Create exams and tests
- ✅ Edit academic settings
- ✅ Cannot delete with dependencies

**AC2:** Academic can assign teachers
- ✅ Assign teacher to subject
- ✅ Assign teacher to class/section
- ✅ One teacher can teach multiple subjects
- ✅ Assignment saved successfully

---

## 💡 Best Practices

### Section Mapping Best Practices

1. **Before Assigning:**
   - Verify class selection
   - Check section capacity (if set)
   - Review student list
   - Ensure students are enrolled

2. **After Assigning:**
   - Refresh browser to verify
   - Check section-wise list
   - Verify all students assigned

3. **Mid-Year Changes:**
   - Enter reason for change
   - Verify new section capacity
   - Document change
   - Refresh to verify

---

### Attendance Best Practices

1. **Before Entry:**
   - Refresh browser
   - Verify class and section
   - Check month and year
   - Review student list

2. **During Entry:**
   - Enter accurately
   - Verify totals match
   - Use bulk entry if needed
   - Double-check before saving

3. **After Entry:**
   - Verify attendance is saved
   - Check totals are correct
   - Refresh to verify
   - Cannot edit after save (locked)

4. **If Error:**
   - Contact Admin to unlock
   - Do not attempt to edit locked attendance
   - Document correction needed

---

### Marks Entry Best Practices

1. **Before Entry:**
   - Refresh browser
   - Verify exam/test selection
   - Check class and section
   - Review student list and subjects

2. **During Entry:**
   - Enter marks accurately
   - Verify marks don't exceed maximum
   - Enter all required subjects
   - Double-check before saving

3. **After Entry:**
   - Verify marks are saved
   - Check grades are calculated
   - Refresh to verify
   - Cannot edit after save (locked)

4. **If Error:**
   - Contact Admin to unlock
   - Do not attempt to edit locked marks
   - Document correction needed

---

### Academic Management Best Practices

1. **Before Creating:**
   - Verify academic year is set
   - Check for duplicates
   - Review existing structure
   - Plan academic setup

2. **After Creating:**
   - Refresh browser to verify
   - Check data is saved correctly
   - Verify relationships
   - Test assignments

3. **Before Deleting:**
   - Check for dependencies
   - Verify no students/subjects/marks
   - Use deactivate instead
   - Document reason

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Cannot Edit Attendance:**
   - Attendance is locked (by design)
   - Contact Admin to unlock
   - Verify month is correct
   - Do not attempt to edit locked data

2. **Cannot Edit Marks:**
   - Marks are locked (by design)
   - Contact Admin to unlock
   - Verify exam is correct
   - Do not attempt to edit locked data

3. **Cannot Assign Section:**
   - Check section exists for class
   - Verify student is enrolled
   - Refresh browser
   - Check section capacity

4. **Cannot Delete Academic Setting:**
   - Check for dependencies
   - Verify no students/subjects/marks
   - Use deactivate instead
   - Review error message

---

## 📝 Document Information

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Role:** Academic  
**Status:** Production Documentation

---

**Related Documents:**
- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School Guide: `USER_GUIDE_02_SCHOOL.md`
- College Guide: `USER_GUIDE_03_COLLEGE.md`
- General Guide: `USER_GUIDE_04_GENERAL.md`
- Admin Role: `ROLE_ADMIN.md`
- Accountant Role: `ROLE_ACCOUNTANT.md`

