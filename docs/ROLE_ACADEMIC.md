# Academic Role - Complete Feature & Permission Guide

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Academic (Academic & Student Management)  
**System:** Velonex ERP - School & College Management

> **Note:** This document reflects the current permission system implementation. All permissions are centrally managed in `client/src/lib/permissions/config.ts` for easy maintenance and updates.

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

| Module                 | Access Level | Create | Read | Update | Delete | Special Permissions                                         |
| ---------------------- | ------------ | ------ | ---- | ------ | ------ | ----------------------------------------------------------- |
| **School Modules**     |
| Admissions             | Limited      | ❌     | ✅   | ❌     | ❌     | **Only Student Admissions tab** (no Confirmed Reservations) |
| Students               | Full         | ❌     | ✅   | ✅     | ❌     | Tabs: Section Mapping, Enrollments, Transport (view only)   |
| Academic               | Limited      | ⚠️     | ✅   | ⚠️     | ❌     | **See detailed restrictions below**                         |
| Attendance             | Full         | ✅     | ✅   | ✅     | ❌     | Create, edit (before lock), all permissions                 |
| Marks                  | Limited      | ✅     | ✅   | ✅     | ❌     | **Only Marks, Tests, Student Views tabs** (no Reports)      |
| Announcements          | Full         | ✅     | ✅   | ✅     | ✅     | Create, edit, delete                                        |
| **College Modules**    |
| Admissions             | Limited      | ❌     | ✅   | ❌     | ❌     | Same as School                                              |
| Students               | Full         | ❌     | ✅   | ✅     | ❌     | Same as School                                              |
| Academic               | Limited      | ⚠️     | ✅   | ⚠️     | ❌     | Same as School + Groups/Courses                             |
| Attendance             | Full         | ✅     | ✅   | ✅     | ❌     | Same as School                                              |
| Marks                  | Limited      | ✅     | ✅   | ✅     | ❌     | Same as School                                              |
| Announcements          | Full         | ✅     | ✅   | ✅     | ✅     | Same as School                                              |
| **Restricted Modules** |
| Reservations           | ❌           | ❌     | ❌   | ❌     | ❌     | No access (Confirmed Reservations tab hidden)               |
| Fees                   | ❌           | ❌     | ❌   | ❌     | ❌     | No access                                                   |
| Financial Reports      | ❌           | ❌     | ❌   | ❌     | ❌     | No access                                                   |
| Income & Expenditure   | ❌           | ❌     | ❌   | ❌     | ❌     | No access                                                   |
| Employee Management    | View Only    | ❌     | ✅   | ❌     | ❌     | View employees only (no edit/delete)                        |
| Payroll                | ❌           | ❌     | ❌   | ❌     | ❌     | No access                                                   |
| Transport Management   | ❌           | ❌     | ❌   | ❌     | ❌     | No access (except student transport view)                   |
| User Management        | ❌           | ❌     | ❌   | ❌     | ❌     | No access                                                   |
| Audit Log              | View Only    | ❌     | ✅   | ❌     | ❌     | View own activities only                                    |

---

## ✨ Available Features

### 1. Admissions Management

#### 1.1 Student Admissions

**Features:**

- View all student admissions
- Search by admission number, name, mobile
- Filter by class, section, status
- View admission details
- View student information
- Export admission list

**Access:** View-only access

**Available Tabs:**

- **Student Admissions Tab:** View all student admissions (full access)

**Restrictions:**

- ⚠️ **Confirmed Reservations tab is hidden** (Admin/Accountant only)
- Cannot create admissions (Accountant creates via conversion)
- Cannot edit admission details
- Cannot delete admissions
- Cannot access reservation management

---

### 2. Student Management

#### 2.1 View Students

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

**Available Tabs:**

- **Section Mapping Tab:** Assign sections to students
- **Enrollments Tab:** View all student enrollments
- **Transport Tab:** View student transport assignments (view only)

**Restrictions:**

- Cannot create students (Accountant creates via admission)
- Cannot delete students
- Cannot edit personal details (name, Aadhar)
- Cannot edit/delete transport assignments (view only, no Edit/Delete buttons)

---

#### 2.2 Section Mapping

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

#### 2.3 Change Student Section

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

#### 2.4 Student Profile

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

### 3. Academic Management

#### 3.1 Academic Year Management

**Features:**

- View academic years
- **Cannot create new academic year** (Admin-only)
- **Cannot edit academic year details** (Admin-only)
- **Cannot delete academic years** (Admin-only)
- View academic year history

**Access:** View-only access

**Restrictions:**

- ⚠️ **Add Academic Year button is hidden** (Admin-only)
- ⚠️ **Edit button is hidden** (Admin-only)
- ⚠️ **Delete button is hidden** (Admin-only)
- Can only view academic years

**Validations:**

- Year name must be unique (Admin-only)
- End date must be after start date (Admin-only)
- Cannot overlap with existing years (Admin-only)

---

#### 3.2 Class Management

**Features:**

- View all classes
- **Cannot create new class** (Admin-only)
- **Cannot edit class details** (Admin-only)
- View class-wise student count
- View class subjects

**Access:** View-only access (with restrictions)

**Restrictions:**

- ⚠️ **Add Class button is hidden** (Admin-only)
- ⚠️ **Edit button is hidden** (Admin-only)
- Cannot delete classes (Admin-only)
- Can only view classes and their details

**Validations:**

- Class name must be unique (Admin-only)
- Class order must be unique (Admin-only)
- Must be numeric (Admin-only)

---

#### 3.3 Subject Management

**Features:**

- View all subjects
- Create new subject
- Edit subject details
- **Cannot delete subjects** (Admin-only)
- View subject-wise marks

**Access:** Create and Edit access only (no Delete)

**Restrictions:**

- ⚠️ **Delete button is hidden** (Admin-only)
- Can add and edit subjects
- Cannot delete subjects (even if no marks)

**Validations:**

- Subject name must be unique
- Subject code must be unique (if provided)

---

#### 3.4 Section Management

**Features:**

- View all sections
- Create new section for class
- Edit section details
- **Cannot delete sections** (Admin-only)
- View section-wise student count

**Access:** Create and Edit access only (no Delete)

**Restrictions:**

- ⚠️ **Delete button is hidden** (Admin-only)
- Can add and edit sections
- Cannot delete sections (even if no students)

**Validations:**

- Section name must be unique within class
- Cannot exceed class capacity (if set)

---

#### 3.5 Exam Management

**Features:**

- View all exams
- **Cannot create new exam** (Admin-only)
- Edit exam details
- **Cannot delete exams** (Admin-only)
- View exam dates
- View maximum marks
- View exam-wise marks

**Access:** Edit access only (no Create/Delete)

**Restrictions:**

- ⚠️ **Add Exam button is hidden** (Admin-only)
- ⚠️ **Delete button is hidden** (Admin-only)
- Can edit existing exam details
- Cannot create or delete exams

**Validations:**

- Exam name must be unique (Admin-only for creation)
- End date must be after start date
- Must be within academic year

---

#### 3.6 Test Management

**Features:**

- View all tests
- Create new test
- Edit test details
- **Cannot delete tests** (Admin-only)
- Assign subjects to test
- Assign classes to test
- View test-wise marks

**Access:** Create and Edit access only (no Delete)

**Restrictions:**

- ⚠️ **Delete button is hidden** (Admin-only)
- Can create and edit tests
- Cannot delete tests (even if no marks)

**Validations:**

- Test date must be valid
- Must select at least one subject
- Must select at least one class

---

#### 3.7 Teacher Assignments

**Features:**

- View all teacher assignments
- View teacher-wise assignments
- View assignments by teacher, subject, class

**Available Subtabs:**

- **Teacher Assignments Subtab:** View subject assignments
- **Class Teachers Subtab:** View class teacher assignments

**Access:** View-only access (with restrictions)

**Restrictions - Teacher Assignments Subtab:**

- ⚠️ **Add Subject button is hidden** (Admin-only)
- ⚠️ **Delete Subject button is hidden** (Admin-only)
- Can only view teacher-subject assignments
- Cannot add or remove subject assignments

**Restrictions - Class Teachers Subtab:**

- ⚠️ **Assign Class Teacher button is hidden** (Admin-only)
- ⚠️ **Delete button is hidden** (Admin-only)
- Can only view class teacher assignments
- Cannot assign or remove class teachers

**College-Specific:**

- View assignments to Course + Group + Subject
- View teacher assignments across Groups
- View teacher assignments across Courses

---

### 4. Attendance Management

#### 4.1 Monthly Attendance Entry

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

#### 4.2 View Attendance

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

#### 4.3 Attendance Statistics

**Features:**

- View overall attendance rate
- View class-wise attendance
- View monthly trends
- View low attendance alerts
- View attendance reports

**Access:** Full Read access

---

### 5. Marks Management

#### 5.1 Available Tabs

**Features:**

- **Marks Tab:** Exam marks entry and management
- **Tests Tab:** Test marks entry and management
- **Student Views Tab:** View individual student marks and performance
- **Reports Tab:** ⚠️ **Hidden** (Admin-only)

**Access:** Limited tab access

**Restrictions:**

- ⚠️ **Reports tab is hidden** (Admin-only)
- Can access Marks, Tests, and Student Views tabs only
- Cannot generate marks reports

---

#### 5.2 Exam Marks Entry

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

#### 5.3 Test Marks Entry

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

#### 5.4 View Marks

**Features:**

- View all marks
- View by student
- View by exam/test
- View by class
- View by subject
- Export marks reports

**Access:** Full Read access

---

#### 5.5 Student Views

**Features:**

- Student Marks View: Search and view individual student marks
- Student Performance View: View student performance analytics
- Search by admission number, name, class
- View marks by exam/test
- View performance trends

**Access:** Full Read access

**Restrictions:**

- ⚠️ **Reports tab is hidden** (Admin-only)
- Cannot generate marks reports
- Can only view individual student data

---

### 6. Announcements

#### 6.1 Create Announcements

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

#### 6.2 View Announcements

**Features:**

- View all announcements
- Filter by type, date, class
- Search by title
- View announcement details
- View target audience

**Access:** Full Read access

---

#### 6.3 Edit Announcements

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

#### 6.4 Delete Announcements

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

- ✅ Create subjects
- ✅ Create sections
- ✅ Create tests
- ✅ Create grades
- ✅ Create attendance entries
- ✅ Create marks entries
- ✅ Create announcements

**Restrictions:**

- ❌ **Cannot create academic years** (Admin-only)
- ❌ **Cannot create classes** (Admin-only)
- ❌ **Cannot create exams** (Admin-only)
- ❌ **Cannot create teacher assignments** (Admin-only)
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
- ✅ Update subjects (edit only)
- ✅ Update sections (edit only)
- ✅ Update exams (edit only, cannot create)
- ✅ Update tests (edit and create)
- ✅ Update grades (edit and create)
- ✅ Update attendance (before lock)
- ✅ Update marks (before lock)
- ✅ Update announcements (before start date)

**Restrictions:**

- ❌ **Cannot update academic years** (Admin-only)
- ❌ **Cannot update classes** (Admin-only)
- ❌ **Cannot update teacher assignments** (Admin-only)
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

- ✅ Delete announcements (if not started)

**Restrictions:**

- ❌ **Cannot delete academic years** (Admin-only)
- ❌ **Cannot delete classes** (Admin-only)
- ❌ **Cannot delete subjects** (Admin-only)
- ❌ **Cannot delete sections** (Admin-only)
- ❌ **Cannot delete exams** (Admin-only)
- ❌ **Cannot delete tests** (Admin-only)
- ❌ **Cannot delete grades** (Admin-only)
- ❌ **Cannot delete teacher assignments** (Admin-only)
- ❌ Cannot delete students
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
   - Class name must be unique (Admin-only)
   - Class order must be unique (Admin-only)
   - Must be numeric (Admin-only)
   - Cannot create/edit/delete (Admin-only)

2. **Subject Management:**
   - Subject name must be unique
   - Subject code must be unique (if provided)
   - Can create and edit
   - Cannot delete (Admin-only)

3. **Section Management:**
   - Section name must be unique within class
   - Cannot exceed class capacity (if set)
   - Can create and edit
   - Cannot delete (Admin-only)

4. **Exam Management:**
   - Exam name must be unique (Admin-only for creation)
   - Dates must be within academic year
   - End date must be after start date
   - Can edit existing exams
   - Cannot create or delete (Admin-only)

5. **Test Management:**
   - Test date must be valid
   - Must select at least one subject
   - Must select at least one class
   - Can create and edit
   - Cannot delete (Admin-only)

6. **Grades Management:**
   - Grade boundaries must be valid
   - Min percentage < Max percentage
   - Can create and edit
   - Cannot delete (Admin-only)

7. **Academic Year Management:**
   - Year name must be unique (Admin-only)
   - End date must be after start date (Admin-only)
   - Cannot create/edit/delete (Admin-only)

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
   - Reservations module (Confirmed Reservations tab hidden)
   - Fees module
   - Financial Reports module
   - Income & Expenditure module
   - Employee Management (view only, no edit/delete)
   - Payroll Management
   - Transport Management (except student transport view)
   - User Management
   - Full Audit Log (only own activities)

2. **Limited Access:**
   - **Admissions:** Only Student Admissions tab (Confirmed Reservations hidden)
   - **Students:** Can edit section, view enrollments and transport (view only)
   - **Academic:** Many buttons hidden (see detailed restrictions above)
   - **Marks:** Only Marks, Tests, Student Views tabs (Reports tab hidden)
   - Announcements: Cannot edit/delete after start date

---

### Functional Restrictions

1. **Admissions Management:**
   - ⚠️ **Confirmed Reservations tab is hidden** (Admin/Accountant only)
   - Can only view Student Admissions
   - Cannot create/edit/delete admissions

2. **Academic Management:**
   - ⚠️ **Classes Tab:** No Add Class button, No Edit button
   - ⚠️ **Subjects Tab:** No Delete button (can Add and Edit)
   - ⚠️ **Sections Tab:** No Delete button (can Add and Edit)
   - ⚠️ **Exams Tab:** No Add Exam button, No Delete button (can Edit)
   - ⚠️ **Tests Tab:** No Delete button (can Add and Edit)
   - ⚠️ **Grades Tab:** No Delete button (can Add and Edit)
   - ⚠️ **Academic Years Tab:** No Add/Edit/Delete buttons (view only)
   - ⚠️ **Teachers Tab - Teacher Assignments:** No Add Subject button, No Delete Subject button
   - ⚠️ **Teachers Tab - Class Teachers:** No Assign Class Teacher button, No Delete button

3. **Marks Management:**
   - ⚠️ **Reports tab is hidden** (Admin-only)
   - Can only access Marks, Tests, and Student Views tabs
   - ⚠️ **Cannot edit after saving** (locked)
   - ⚠️ **Cannot edit previous exam marks**
   - Admin can override locks
   - Must contact Admin for corrections

4. **Attendance Management:**
   - ⚠️ **Cannot edit after saving** (locked for month)
   - ⚠️ **Cannot edit previous months**
   - Admin can override locks
   - Must contact Admin for corrections

5. **Student Management:**
   - Cannot create students (Accountant creates via admission)
   - Cannot delete students
   - Cannot edit personal details (name, Aadhar)
   - Can only edit section
   - Cannot edit/delete transport assignments (view only)

6. **Announcement Management:**
   - Cannot edit after start date
   - Cannot delete if started
   - Admin can override

---

### Business Rule Restrictions

1. **Academic Structure:**
   - Cannot create/edit/delete classes (Admin-only)
   - Cannot delete subjects (Admin-only, can create/edit)
   - Cannot delete sections (Admin-only, can create/edit)
   - Cannot create/delete exams (Admin-only, can edit)
   - Cannot delete tests (Admin-only, can create/edit)
   - Cannot delete grades (Admin-only, can create/edit)
   - Cannot create/edit/delete academic years (Admin-only)
   - Cannot create/delete teacher assignments (Admin-only)

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

**AC2:** Academic can view marks tabs

- ✅ Marks tab visible
- ✅ Tests tab visible
- ✅ Student Views tab visible
- ❌ Reports tab hidden (Admin-only)

**AC3:** Academic cannot edit locked marks

- ✅ Edit option not available
- ✅ Must contact Admin
- ✅ System enforces restriction

---

### Academic Management

**AC1:** Academic can view academic structure

- ✅ View classes, subjects, sections
- ✅ View exams and tests
- ✅ View academic years
- ✅ Cannot create/edit/delete classes (Admin-only)
- ✅ Cannot create/edit/delete academic years (Admin-only)

**AC2:** Academic can manage subjects

- ✅ Create new subjects
- ✅ Edit subject details
- ❌ Cannot delete subjects (Admin-only)
- ✅ Subject saved successfully

**AC3:** Academic can manage sections

- ✅ Create new sections
- ✅ Edit section details
- ❌ Cannot delete sections (Admin-only)
- ✅ Section saved successfully

**AC4:** Academic can manage exams

- ❌ Cannot create exams (Admin-only)
- ✅ Edit exam details
- ❌ Cannot delete exams (Admin-only)

**AC5:** Academic can manage tests

- ✅ Create new tests
- ✅ Edit test details
- ❌ Cannot delete tests (Admin-only)
- ✅ Test saved successfully

**AC6:** Academic can manage grades

- ✅ Create new grades
- ✅ Edit grade details
- ❌ Cannot delete grades (Admin-only)
- ✅ Grade saved successfully

**AC7:** Academic can view teacher assignments

- ✅ View teacher-subject assignments
- ✅ View class teacher assignments
- ❌ Cannot add/delete teacher assignments (Admin-only)

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

1. **Before Creating (Subjects, Sections, Tests, Grades):**
   - Verify academic year is set
   - Check for duplicates
   - Review existing structure
   - Plan academic setup

2. **After Creating:**
   - Refresh browser to verify
   - Check data is saved correctly
   - Verify relationships
   - Test assignments

3. **Understanding Restrictions:**
   - Classes: View only (Admin creates/edits)
   - Academic Years: View only (Admin manages)
   - Exams: Can edit only (Admin creates/deletes)
   - Subjects/Sections/Tests/Grades: Can create/edit, cannot delete
   - Teacher Assignments: View only (Admin manages)
   - Contact Admin for any create/delete operations on restricted items

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
   - Delete buttons are hidden (Admin-only)
   - Cannot delete subjects, sections, tests, grades
   - Cannot delete classes, academic years, exams
   - Contact Admin for deletion
   - Review restrictions in documentation

5. **Cannot See Reports Tab:**
   - Reports tab is hidden (Admin-only)
   - Can only access Marks, Tests, Student Views tabs
   - Contact Admin for reports generation

---

## 📝 Document Information

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Academic  
**Status:** Production Documentation

### Permission System

All permissions are centrally configured in `client/src/lib/permissions/config.ts`. This ensures:

- Consistent permission enforcement across the application
- Easy maintenance and updates
- Type-safe permission checks
- Dynamic UI filtering based on user roles

**Key Restrictions for Academic:**

- ❌ Confirmed Reservations tab hidden (only Student Admissions visible)
- ❌ Reports tab hidden in Marks module (only Marks, Tests, Student Views)
- ❌ Many buttons hidden in Academic module (see detailed restrictions above)
- ❌ Cannot create/edit/delete classes, academic years, exams
- ❌ Cannot delete subjects, sections, tests, grades
- ❌ Cannot manage teacher assignments (view only)

---

**Related Documents:**

- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School Guide: `USER_GUIDE_02_SCHOOL.md`
- College Guide: `USER_GUIDE_03_COLLEGE.md`
- General Guide: `USER_GUIDE_04_GENERAL.md`
- Admin Role: `ROLE_ADMIN.md`
- Accountant Role: `ROLE_ACCOUNTANT.md`
