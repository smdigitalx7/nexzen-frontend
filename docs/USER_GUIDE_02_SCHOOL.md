# Velocity ERP System - School Module User Guide

## Complete Feature Workflows & Instructions

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** School Management System

---

## 📋 Table of Contents

1. [Reservations Management](#1-reservations-management)
2. [Admissions Management](#2-admissions-management)
3. [Student Management](#3-student-management)
4. [Academic Management](#4-academic-management)
5. [Attendance Management](#5-attendance-management)
6. [Marks Management](#6-marks-management)
7. [Fees Management](#7-fees-management)
8. [Financial Reports](#8-financial-reports)
9. [Announcements](#9-announcements)

---

## 1. Reservations Management

### Overview

Create and manage new student reservations. Reservations are the first step in the student admission process.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/school/reservations/new`

---

### 1.1 Creating a New Reservation

#### Workflow Steps

1. **Navigate to Reservations**
   - Click "Reservations" in sidebar
   - Click "New Reservation" button

2. **Fill Personal Details**
   - **Student Name** (Required): Full name of student
   - **Aadhar Number** (Required): 12-digit Aadhar number
   - **Gender** (Required): Select from dropdown (Male/Female/Other)
   - **Date of Birth** (Required): Select date from calendar
   - **Father/Guardian Name** (Required)
   - **Father/Guardian Aadhar No.** (Required): 12-digit Aadhar
   - **Father/Guardian Occupation** (Required)
   - **Mother/Guardian Name** (Required)
   - **Mother/Guardian Aadhar No.** (Required): 12-digit Aadhar
   - **Mother/Guardian Occupation** (Required)

3. **Fill Previous School Details**
   - **Name of School** (Optional)
   - **Village** (Optional)
   - **Class Studied** (Optional)

4. **Fill Contact Details**
   - **Present Address** (Required)
   - **Permanent Address** (Required)
   - **Father/Guardian Mobile No.** (Required): 10-digit mobile number
   - **Mother/Guardian Mobile No.** (Required): 10-digit mobile number

5. **Fill Academic Details**
   - **Class Admission** (Required): Select from dropdown
     - Auto-fetches fee structure for selected class
   - **Transport Required** (Required): Yes/No
     - If Yes: Select Bus Route and Distance Slab
   - **Application Fee** (Required): Enter amount

6. **Additional Information**
   - **Remarks** (Optional): Any additional notes
   - **Referred By** (Optional): If student was referred

7. **Save & Pay**
   - Click "Save and Pay" button
   - Select payment mode
   - Process payment
   - Receipt is generated automatically

---

### 1.2 Validations & Requirements

#### Input Validations

- **Aadhar Numbers:**
  - Must be exactly 12 digits
  - Numeric only
  - Cannot be duplicate for same student

- **Mobile Numbers:**
  - Must be exactly 10 digits
  - Numeric only
  - Must start with 6, 7, 8, or 9

- **Date of Birth:**
  - Must be valid date
  - Cannot be future date
  - Age validation based on class

- **Class Selection:**
  - Must select valid class
  - Fee structure must exist for class
  - Class must be active in current academic year

- **Fees:**
  - Application fee: Minimum amount required
  - Reservation fee: Minimum amount required
  - Cannot be negative
  - Cannot exceed maximum allowed

- **Transport:**
  - If transport required, must select route
  - Route must be active
  - Distance slab must be valid

---

### 1.3 Viewing Reservations

#### All Reservations Table

**Features:**

- Search by reservation number, student name, mobile
- Filter by status (Pending, Confirmed, Cancelled)
- Filter by class
- Filter by date range
- Sort by any column
- Export to Excel

**Columns:**

- Reservation Number (Auto-generated)
- Student Name
- Class
- Father/Guardian Name
- Mobile Number
- Reservation Date
- Status
- Actions (View, Edit, Convert to Admission)

---

### 1.4 Editing Reservations

#### Limitations

- **Can Edit:**
  - Contact details
  - Transport details
  - Fees (if not paid)
  - Remarks

- **Cannot Edit:**
  - Student name (after creation)
  - Aadhar numbers (after creation)
  - Reservation number (auto-generated)
  - Payment history

#### Workflow

1. Click "Edit" on reservation row
2. Modify allowed fields
3. Click "Save"
4. Changes are logged in audit trail

---

### 1.5 Converting Reservation to Admission

**Note:** This is done from Admissions module, not Reservations.

**Prerequisites:**

- Reservation status must be "Confirmed"
- Application fee must be paid
- Reservation fee must be paid

---

### 1.6 Printing Reservation Form

**Steps:**

1. Open reservation details
2. Click "Print" button
3. Select print format (PDF/Physical)
4. Print includes:
   - All student details
   - Payment information
   - Reservation number
   - Date and time

---

## 2. Admissions Management

### Overview

Convert confirmed reservations to admissions and manage student admissions.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/school/admissions`

---

### 2.1 Converting Reservation to Admission

#### Workflow Steps

1. **Navigate to Admissions**
   - Click "Admissions" in sidebar
   - Select "Confirmed Reservations" tab

2. **Search Reservation**
   - Search by reservation number
   - Or browse all confirmed reservations
   - Click on reservation to view details

3. **Review Reservation Data**
   - Verify all information
   - Check payment status
   - Review remarks

4. **Convert to Admission**
   - Click "Convert to Admission" button
   - Admission form opens with pre-filled data

5. **Fee Lock (If Applicable)**
   - Enter concession amount (if Admin approved and admin only give that concession)
   - Click "Lock Fee"
   - **Note:** Once locked, No one should able to unlock! (Please take care while giving )

6. **Edit Admission Details (If Needed)**
   - Can edit: Contact details, address, transport
   - Cannot edit: Student name, Aadhar numbers

7. **Generate Admission Number**
   - Format: NZN24250001
   - NZN = Nexzen School prefix
   - 24 = Last 2 digits of academic year start
   - 25 = Last 2 digits of academic year end
   - 0001 = Sequential number

8. **Save Admission**
   - Click "Save Admission"
   - Admission number is auto-generated
   - Student is now enrolled

---

### 2.2 Fee Payment During Admission

#### Payment Validation Rules

**Critical Rule:** Books fee must be paid first before tuition fee

**Workflow:**

1. System checks if books fee is paid
2. If not paid:
   - Tuition fee payment is disabled
   - Message displayed: "Please pay books fee first"
3. If books fee is paid:
   - Tuition fee payment is enabled
   - Can pay any term (1, 2, or 3)

**Payment Sequence:**

1. Books Fee (Must be first)
2. Term 1 Tuition Fee (40%)
3. Term 2 Tuition Fee (30%)
4. Term 3 Tuition Fee (30%)
5. Transport Fee Term 1
6. Transport Fee Term 2

**Term Payment Validation:**

- After Term 1 & 2 of tuition fee are paid, transport and other fees must be paid before Term 3
- System enforces this automatically

---

### 2.3 Viewing Admissions

#### Admissions List

**Features:**

- Search by admission number, student name, mobile
- Filter by class, section
- Filter by payment status
- Filter by date range
- Export to Excel

**Columns:**

- Admission Number
- Student Name
- Class
- Section
- Father/Guardian Name
- Mobile Number
- Admission Date
- Fee Status
- Actions

---

### 2.4 Editing Admissions

#### Limitations

- **Can Edit:**
  - Contact details (address, mobile)
  - Transport details
  - Section (Academic role can change)
  - Remarks

- **Cannot Edit:**
  - Student name
  - Aadhar numbers
  - Admission number
  - Locked fees (Admin only)
  - Payment history

---

### 2.5 Admission Form Print

**Includes:**

- All student details
- Admission number
- Class and section
- Fee structure
- Payment details
- Accountant name
- Date and signature

---

## 3. Student Management

### Overview

Manage enrolled students, view profiles, manage enrollments, and assign transport.

**Access:** Admin, Institute Admin, Academic, Accountant  
**Location:** `/school/students`

---

### 3.1 Student List

#### Features

- **Search:** By name, admission number, mobile, class
- **Filters:**
  - Class
  - Section
  - Academic year
  - Status (Active, Inactive, Dropped)
- **Sort:** By name, class, admission date
- **Export:** To Excel

---

### 3.2 Student Profile

#### Viewing Profile

**Information Displayed:**

- Personal details
- Contact information
- Academic information (class, section)
- Fee balance
- Payment history
- Attendance summary
- Marks summary
- Transport details

**Access:**

- Click on student name in list
- Or search and select student

---

### 3.3 Section Mapping

**Access:** Academic role  
**Location:** Students → Section Mapping tab

#### Workflow

1. **Select Class**
   - Choose class from dropdown
   - Students without sections are displayed

2. **Select Students**
   - Check individual students
   - Or "Select All" for bulk assignment

3. **Select Section**
   - Choose section from dropdown
   - Sections available for selected class

4. **Assign Section**
   - Click "Assign Section"
   - Students are assigned to section
   - Confirmation message displayed

#### Mid-Year Section Change

**Workflow:**

1. Select student from list
2. Click "Change Section"
3. Select new section
4. Enter reason (optional)
5. Confirm change
6. Change is logged in audit trail

**Limitations:**

- Can only change to sections in same class
- Cannot change if student has active exams
- Academic role only

---

### 3.4 Enrollments Management

#### Viewing Enrollments

**Information:**

- Enrollment ID
- Student details
- Class and section
- Enrollment date
- Status
- Academic year

#### Creating Enrollment

**Note:** Usually created automatically during admission

**Manual Creation:**

1. Click "New Enrollment"
2. Select student
3. Select class
4. Select academic year
5. Save

---

### 3.5 Transport Assignment

#### Assigning Transport

**Workflow:**

1. Select student
2. Go to Transport tab
3. Click "Assign Transport"
4. Select:
   - Bus route
   - Distance slab
   - Pickup point
5. Save assignment

#### Editing Transport

**Can Edit:**

- Bus route
- Distance slab
- Pickup point

**Cannot Edit:**

- If fees are paid for current term
- Historical transport records

---

### 3.6 Dropped Students

#### Viewing Dropped Students

**Categories:**

1. **Reservations Not Converted:**
   - Reservations that were not converted to admission
   - Shows reservation details and remarks

2. **Previous Year Dropouts:**
   - Students who studied last year but dropped this year
   - Shows previous enrollment details and remarks

**Features:**

- Search and filter
- View remarks
- Export list

---

## 4. Academic Management

### Overview

Manage academic structure: classes, subjects, sections, exams, tests, and teacher assignments.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/school/academic`

---

### 4.1 Academic Year Management

#### Creating Academic Year

**Workflow:**

1. Navigate to Academic → Academic Years
2. Click "New Academic Year"
3. Enter:
   - Year name (e.g., "2024-2025")
   - Start date
   - End date
4. Save

**Validations:**

- Year name must be unique
- End date must be after start date
- Cannot overlap with existing years

---

### 4.2 Class Management

#### Creating Class

**Workflow:**

1. Navigate to Academic → Classes
2. Click "Add Class"
3. Enter:
   - Class name (e.g., "1st Class", "2nd Class")
   - Class order/number
   - Description (optional)
4. Save

**Validations:**

- Class name must be unique
- Class order must be unique
- Must be numeric

**Limitations:**

- Cannot delete class with students
- Cannot delete class with subjects
- Can only deactivate

---

### 4.3 Subject Management

#### Creating Subject

**Workflow:**

1. Navigate to Academic → Subjects
2. Click "Add Subject"
3. Enter:
   - Subject name
   - Subject code (optional)
   - Description (optional)
4. Save

**Validations:**

- Subject name must be unique
- Subject code must be unique (if provided)

---

### 4.4 Section Management

#### Creating Section

**Workflow:**

1. Navigate to Academic → Sections
2. Select class
3. Click "Add Section"
4. Enter:
   - Section name (e.g., "A", "B", "C")
   - Capacity (optional)
5. Save

**Validations:**

- Section name must be unique within class
- Cannot exceed class capacity (if set)

---

### 4.5 Exam Management

#### Creating Exam

**Workflow:**

1. Navigate to Academic → Exams
2. Click "Add Exam"
3. Enter:
   - Exam name (e.g., "Quarterly Exam", "Annual Exam")
   - Exam type
   - Start date
   - End date
   - Description
4. Save

**Validations:**

- Exam name must be unique
- End date must be after start date
- Must be within academic year

#### Exam Types

- **Quarterly Exam:** Conducted quarterly
- **Half-Yearly Exam:** Mid-year exam
- **Annual Exam:** Year-end exam
- **Unit Test:** Periodic tests

---

### 4.6 Test Management

#### Creating Test

**Workflow:**

1. Navigate to Academic → Tests
2. Click "Add Test"
3. Enter:
   - Test name
   - Test date
   - Subjects (multiple)
   - Classes (multiple)
4. Save

**Validations:**

- Test date must be valid
- Must select at least one subject
- Must select at least one class

---

### 4.7 Teacher Assignments

#### Assigning Teachers

**Workflow:**

1. Navigate to Academic → Teacher Assignments
2. Select class
3. Click "Assign Teacher"
4. Select:
   - Teacher
   - Subject
   - Section (optional, for section-specific)
5. Save

**Features:**

- One teacher can teach multiple subjects
- One teacher can teach multiple classes
- Can assign section-specific teachers

#### Viewing Assignments

**Information:**

- Teacher name
- Subject
- Class
- Section
- Assignment date
- Status

---

## 5. Attendance Management

### Overview

Record and manage monthly attendance for students.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/school/attendance`

---

### 5.1 Monthly Attendance Entry

#### Workflow

1. **Navigate to Attendance**
   - Click "Attendance" in sidebar
   - Select "Create Attendance"

2. **Select Filters**
   - Academic Year (auto-selected)
   - Class
   - Section
   - Month
   - Year

3. **View Student List**
   - All students in selected class/section
   - Current attendance status
   - Previous month's attendance

4. **Enter Attendance**
   - For each student:
     - Present days
     - Absent days
     - Leave days
   - Or use bulk entry:
     - Mark all present
     - Mark all absent
     - Then modify individual entries

5. **Calculate Totals**
   - System calculates:
     - Total working days
     - Present percentage
     - Absent percentage

6. **Save Attendance**
   - Click "Save Attendance"
   - Confirmation message
   - Attendance is locked for the month

---

### 5.2 Validations

#### Input Requirements

- **Present Days:**
  - Must be numeric
  - Cannot exceed total working days
  - Cannot be negative

- **Absent Days:**
  - Must be numeric
  - Cannot exceed total working days
  - Cannot be negative

- **Leave Days:**
  - Must be numeric
  - Cannot exceed total working days
  - Cannot be negative

- **Total Validation:**
  - Present + Absent + Leave = Total Working Days
  - System validates automatically

#### Business Rules

- **Monthly Lock:**
  - Once saved, attendance is locked
  - Cannot edit without Admin permission
  - Previous months cannot be edited

- **Working Days:**
  - System calculates based on:
    - Month calendar
    - Holidays (if configured)
    - Weekends

---

### 5.3 Viewing Attendance

#### Attendance Reports

**Features:**

- View by student
- View by class
- View by month
- View by date range
- Export to Excel

**Information Displayed:**

- Student name
- Class and section
- Month
- Present days
- Absent days
- Leave days
- Percentage
- Status

---

### 5.4 Attendance Statistics

#### Dashboard Metrics

- **Overall Attendance Rate:** Percentage across all students
- **Class-wise Attendance:** Breakdown by class
- **Monthly Trends:** Attendance trends over months
- **Low Attendance Alerts:** Students below threshold

---

## 6. Marks Management

### Overview

Enter and manage exam and test marks for students.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/school/marks`

---

### 6.1 Exam Marks Entry

#### Workflow

1. **Navigate to Marks**
   - Click "Marks" in sidebar
   - Select "Exam Marks"

2. **Select Exam**
   - Choose exam from dropdown
   - Only active exams are shown

3. **Select Class & Section**
   - Choose class
   - Choose section (optional)

4. **View Student List**
   - All students in selected class/section
   - Subjects for the exam
   - Previous marks (if any)

5. **Enter Marks**
   - For each student and subject:
     - Enter marks obtained
     - Maximum marks (auto-filled from exam)
     - Grade (auto-calculated)
   - Or use bulk entry:
     - Enter marks for all students at once

6. **Validate Marks**
   - System checks:
     - Marks cannot exceed maximum
     - Marks cannot be negative
     - All required subjects must have marks

7. **Save Marks**
   - Click "Save Marks"
   - Confirmation message
   - Marks are locked

---

### 6.2 Test Marks Entry

#### Workflow

Similar to exam marks, but:

- Select test instead of exam
- Tests may have fewer subjects
- Tests are typically for specific subjects

---

### 6.3 Validations

#### Input Requirements

- **Marks Obtained:**
  - Must be numeric
  - Cannot exceed maximum marks
  - Cannot be negative
  - Decimal values allowed (if configured)

- **Maximum Marks:**
  - Set during exam/test creation
  - Cannot be changed after marks entry starts

- **Grade Calculation:**
  - Automatic based on percentage
  - Grade boundaries configurable

#### Business Rules

- **Marks Lock:**
  - Once saved, marks are locked
  - Cannot edit without Admin permission
  - Historical marks preserved

- **Complete Entry:**
  - All subjects must have marks
  - Cannot save partial marks
  - System validates before save

---

### 6.4 Marks Reports

#### Student Performance Report

**Semwise Report Format:**

- **Sem-1:**
  - FA1 (Formative Assessment 1)
  - FA2 (Formative Assessment 2)
  - SA1 (Summative Assessment 1)

- **Sem-2:**
  - FA3 (Formative Assessment 3)
  - FA4 (Formative Assessment 4)
  - SA2 (Summative Assessment 2)

**Total Exams Report:**

- Combined Sem1 and Sem2
- Overall percentage
- Grade
- Rank (if enabled)

#### Viewing Reports

1. Select student
2. Click "View Reports"
3. Choose report type:
   - Semwise report
   - Total exams report
   - Subject-wise report
4. Export to PDF/Excel

---

## 7. Fees Management

### Overview

Collect fees, manage fee balances, and track payments.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/school/fees`

---

### 7.1 Fee Collection

#### Workflow

1. **Navigate to Fees**
   - Click "Fees" in sidebar
   - Select "Collect Fee"

2. **Search Student**
   - Search by:
     - Admission number
     - Student name
     - Mobile number
     - Class
   - Select student from results

3. **View Fee Balance**
   - Tuition fee balance:
     - Term 1 (40%)
     - Term 2 (30%)
     - Term 3 (30%)
     - Books fee
   - Transport fee balance:
     - Term 1
     - Term 2
   - Total outstanding

4. **Select Fees to Collect**
   - Check boxes for:
     - Books fee
     - Term 1, 2, 3 (tuition)
     - Term 1, 2 (transport)
   - Or enter custom amount

5. **Select Payment Mode**
   - Cash
   - Cheque
   - Online Transfer
   - UPI
   - Other

6. **Enter Payment Details**
   - Payment amount (auto-calculated)
   - Payment date
   - Cheque number (if applicable)
   - Bank name (if applicable)
   - Remarks (optional)

7. **Process Payment**
   - Click "Process Payment"
   - Receipt is generated
   - Payment is recorded

---

### 7.2 Validations

#### Payment Validations

**Books Fee Validation:**

- Books fee must be paid before tuition fee
- System blocks tuition fee payment if books fee pending
- Validation is automatic

**Term Payment Validation:**

- After Term 1 & 2 are paid, transport and other fees must be paid before Term 3
- System enforces this sequence
- Cannot skip terms

**Amount Validation:**

- Payment amount cannot exceed outstanding
- Cannot be negative
- Minimum payment amount (if configured)

**Payment Mode:**

- Must select valid payment mode
- Cheque requires cheque number
- Online requires transaction ID (optional)

---

### 7.3 Fee Balance Tracking

#### Viewing Balances

**Features:**

- View by student
- View by class
- View outstanding fees
- Filter by payment status
- Export to Excel

**Information:**

- Student details
- Fee structure
- Paid amounts
- Outstanding amounts
- Due dates
- Payment history

---

### 7.4 Receipt Generation

#### Printing Receipt

**Steps:**

1. After payment, receipt is auto-generated
2. Click "Print Receipt"
3. Receipt includes:
   - Receipt number
   - Student details
   - Payment details
   - Amount paid
   - Payment mode
   - Date and time
   - Accountant name
   - Signature space

**Receipt Formats:**

- On-screen view
- PDF download
- Physical print

---

## 8. Financial Reports

### Overview

Comprehensive financial reporting and analytics.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/school/financial-reports`

---

### 8.1 Available Reports

#### Report Types

1. **New Reservations Report**
   - All reservations
   - Filter by date, class, status
   - Payment details

2. **Converted Admissions Report**
   - All admissions
   - Filter by date, class
   - Fee collection details

3. **Not Converted Reservations**
   - Reservations not converted
   - With remarks
   - Filter by date, class

4. **Fee Reporting**
   - Total fees collected
   - Class-wise breakdown
   - Term-wise breakdown
   - Outstanding fees

5. **Day-wise Finance Report**
   - Daily collections
   - Daily expenditures
   - Net balance per day

6. **Admission-wise Finance**
   - Fee collection per admission
   - Payment history
   - Outstanding per student

7. **Date Range Report**
   - Custom date range
   - All transactions
   - Summary and details

8. **Terms-wise Report**
   - Fee collection by term
   - Term 1, 2, 3 breakdown
   - Transport terms

---

### 8.2 Generating Reports

#### Workflow

1. **Navigate to Financial Reports**
   - Click "Financial Reports" in sidebar

2. **Select Report Type**
   - Choose from available reports

3. **Apply Filters**
   - Date range (required for most)
   - Class (optional)
   - Accountant (optional)
   - Payment mode (optional)
   - Status (optional)

4. **Generate Report**
   - Click "Generate Report"
   - Report is displayed

5. **Export Report**
   - Click "Export to Excel"
   - File is downloaded

---

### 8.3 Report Filters

#### Available Filters

- **Date Range:**
  - From date
  - To date
  - Preset ranges (Today, This Week, This Month, This Year)

- **Class:**
  - Single class
  - Multiple classes
  - All classes

- **Accountant:**
  - Filter by accountant who processed
  - Useful for tracking individual performance

- **Payment Mode:**
  - Cash
  - Cheque
  - Online
  - All modes

- **Status:**
  - Paid
  - Outstanding
  - Partial
  - All statuses

---

### 8.4 Financial Analytics

#### Dashboard Charts

- **Income Trend:** Monthly income graph
- **Expenditure Trend:** Monthly expenditure graph
- **Income by Category:** Pie chart breakdown
- **Payment Method Distribution:** Payment modes chart
- **Daily Transactions:** Day-wise line chart

---

## 9. Announcements

### Overview

Create and manage institutional announcements.

**Access:** Admin, Institute Admin, Academic, Accountant  
**Location:** `/school/announcements`

---

### 9.1 Creating Announcements

#### Workflow

1. **Navigate to Announcements**
   - Click "Announcements" in sidebar

2. **Click "New Announcement"**

3. **Fill Announcement Details**
   - **Title** (Required): Announcement title
   - **Type** (Required):
     - Holiday
     - Transport Issue
     - General
     - Exam/Test
   - **Message** (Required): Announcement content
   - **Target Audience:**
     - All classes
     - Specific class(es)
     - Specific route (for transport)
   - **Priority** (Optional): High, Medium, Low
   - **Start Date** (Required)
   - **End Date** (Optional)

4. **Save Announcement**
   - Click "Save"
   - Announcement is published

---

### 9.2 Announcement Types

#### Holiday Announcements

- School holidays
- Can be class-specific or all classes
- Includes holiday dates and reason

#### Transport Issue Announcements

- Route-specific issues
- Bus delays or cancellations
- Route changes
- Driver information

#### General Announcements

- General information
- Policy updates
- Event notifications

#### Exam/Test Announcements

- Exam schedules
- Test dates
- Result announcements

---

### 9.3 Viewing Announcements (Development in Progress)

#### Features

- **List View:**
  - All announcements
  - Filter by type, date, class
  - Search by title

- **Detail View:**
  - Full announcement content
  - Target audience
  - Dates
  - Created by

---

### 9.4 Limitations

- **Editing:**
  - Can edit before start date
  - Cannot edit after start date
  - Historical announcements preserved

- **Deletion:**
  - Can delete if not started
  - Cannot delete active announcements
  - Admin can delete any

- **SMS Integration:**
  - Currently in development
  - Will be available in future update

---

## ⚠️ Important Notes & Recommendations

### 🔄 Browser Refresh & Troubleshooting

#### When to Refresh Browser

**Mandatory Refresh Required:**

- If reservation/admission data is not updating automatically
- If fee collection is not reflecting immediately
- If student list is not showing latest entries
- **Action:** Press `F5` or `Ctrl+R` to refresh browser

**If UI is Stuck or Issues Occur:**

- First, try refreshing the browser (`F5` or `Ctrl+R`)
- If issue persists, logout and login again
- Clear browser cache if problems continue
- **Note:** These issues occur in some minor cases, not all cases

**Best Practice:**

- Refresh browser after creating reservation/admission
- Refresh before fee collection to see latest balance
- Refresh after section mapping to verify changes
- Regular refresh ensures you see the latest data

---

### 💾 Data Caching & Performance

#### Cache System

**Why Caching is Used:**

- Improves system performance and speed
- Reduces server load
- Faster data loading for students, fees, etc.
- Better user experience

**How It Works:**

- Student data, fee balances, and reports are cached
- Data is automatically refreshed when needed
- Cache is cleared on logout

**Important Notes:**

- If you see outdated fee balance, refresh browser
- If student list seems old, refresh to get latest data
- Cache updates automatically in most cases
- Manual refresh ensures latest information

---

### 📄 Receipt Management

#### Receipt Preview & Regeneration

**If Receipt Preview is Closed by Mistake:**

1. Navigate to **Financial Reports** → **Income** section
2. Find the payment transaction
3. Click on the transaction row
4. Click **"Regenerate Receipt"** or **"View Receipt"** button
5. Receipt will be regenerated and can be printed

**Receipt Access:**

- All receipts are stored in the system permanently
- Can be regenerated anytime from income section
- Can be printed multiple times
- Receipts are linked to payment transactions
- Receipt number remains the same

**Best Practice:**

- Always print or save receipt immediately after payment
- Note down receipt number for reference
- Receipts can be accessed later from income section

---

### 💳 Payment Processing

#### Payment Retry & Best Practices

**If Payment Fails:**

- System automatically shows **"Retry Payment"** option
- **Important:** Refresh browser before retrying payment
- Check payment details before retrying
- Verify payment mode is correct
- Ensure sufficient balance/valid payment method

**Before Making Payment:**

1. **Refresh browser** to get latest fee balance (Mandatory)
2. Ensure stable network connection
3. Verify student details and admission number
4. Check payment amount matches outstanding
5. Select correct payment mode
6. Verify all selected fees are correct

**Payment Best Practices:**

- Always refresh before payment to see latest balance
- Verify receipt immediately after payment
- Save receipt PDF for records
- Check payment in transaction history
- If payment fails, refresh and retry

**Payment Validation:**

- Books fee must be paid first (system enforces this)
- Term payment sequence is validated automatically
- Payment amount cannot exceed outstanding
- System validates all payment rules

---

### 🌐 Network Requirements

#### Network Stability

**Critical Requirement:**

- **Stable internet connection is mandatory**
- System requires consistent network connectivity
- Unstable network will cause system issues

**What Happens with Unstable Network:**

- Reservations may not save properly
- Payments may fail or not process
- Fee collection may not update
- Reports may not generate
- System may become unresponsive

**Recommendations:**

- Use stable Wi-Fi or wired connection
- Avoid mobile data if unstable
- Check network before important operations (reservations, payments)
- Wait for network to stabilize before retrying
- Do not perform payments during network issues

**Network Indicators:**

- Check browser connection status
- Look for loading indicators
- If connection lost, system will show error message
- Reconnect and refresh before continuing

---

### 📝 Form Best Practices

#### Reservation Form

**Before Saving:**

- Verify all Aadhar numbers are correct (12 digits)
- Check mobile numbers are valid (10 digits)
- Ensure class selection is correct
- Verify fee amounts
- Double-check transport selection if applicable

**After Saving:**

- Wait for confirmation message
- Print reservation form immediately
- Note reservation number
- Refresh to see in reservations list

---

#### Admission Form

**Before Converting:**

- Verify reservation details are correct
- Check payment status
- Review fee structure
- If fee lock needed, ensure Admin approval first

**After Converting:**

- Wait for admission number generation
- Print admission form immediately
- Note admission number
- Refresh to see in admissions list

---

### 🔍 Search & Filter Tips

#### Efficient Searching

**Search Best Practices:**

- Use exact admission/reservation numbers for fastest results
- Use student name for broader search
- Use mobile number for quick access
- Combine filters for precise results

**Filter Tips:**

- Use date range filters to narrow down data
- Filter by class to see specific class data
- Filter by status to see pending/completed items
- Clear filters to see all data

---

### 📊 Report Generation

#### Report Best Practices

**Before Generating Reports:**

- Refresh browser to get latest data
- Select appropriate date range
- Apply necessary filters
- Ensure stable network connection

**Report Tips:**

- Large date ranges may take time - be patient
- Use filters to reduce report size
- Export to Excel for offline analysis
- Reports are generated from cached data - refresh if needed

---

### General Limitations

1. **Data Integrity:**
   - Cannot delete records with dependencies
   - Historical data is preserved
   - Some fields cannot be edited after creation

2. **Permissions:**
   - Role-based access restrictions
   - Some actions require Admin approval
   - Fee locking requires Admin unlock (cannot be unlocked)

3. **Validations:**
   - All forms have validation rules
   - Required fields are mandatory
   - Format requirements must be followed

4. **Performance:**
   - Large datasets use pagination
   - Reports may take time for large date ranges
   - Use filters to narrow down data
   - Cache improves performance but refresh if data seems old

---

## 📞 Support

For assistance with School module:

- **Email:** contact@smdigitalx.com
- **Phone:** +91 8184919998
- **In-System:** Use Help icons and tooltips

---

## 📝 Document Information

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** School Management  
**Status:** Production Documentation

---

**Related Guides:**

- Overview: `USER_GUIDE_01_OVERVIEW.md`
- College: `USER_GUIDE_03_COLLEGE.md`
- General: `USER_GUIDE_04_GENERAL.md`
