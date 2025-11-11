# Velocity ERP System - College Module User Guide

## Complete Feature Workflows & Instructions

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** College Management System

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

Create and manage new student reservations for college. College reservations include additional fields for Group and Course selection (for 11th and 12th classes).

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/college/reservations/new`

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
     - For Junior and Senior: Additional fields appear
   - **Group** (Required for Junior/Senior): Select from dropdown
     - MPC (Mathematics, Physics, Chemistry)
     - BiPC (Biology, Physics, Chemistry)
     - N/A (Not Applicable - for other classes)
   - **Course** (Required for 11th/12th): Select from dropdown
     - IPE (Intermediate Public Examination)
     - Mains (Engineering Mains)
     - EAPCET (Engineering, Agriculture and Pharmacy Common Entrance Test)
     - N/A (Not Applicable - for other classes)
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

### 1.2 Key Differences from School Reservations

#### Additional Fields

1. **Group Selection:**
   - Only appears for 11th and 12th classes
   - Required field when class is 11th or 12th
   - Options: MPC, BiPC, N/A

2. **Course Selection:**
   - Only appears for 11th and 12th classes
   - Required field when class is 11th or 12th
   - Options: IPE, Mains, EAPCET, N/A

#### Validations

- **Group Validation:**
  - Must select if class is 11th or 12th
  - Can be N/A for other classes
  - Cannot be changed after admission

- **Course Validation:**
  - Must select if class is 11th or 12th
  - Can be N/A for other classes
  - Cannot be changed after admission

---

### 1.3 Validations & Requirements

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

- **Group & Course:**
  - Required for 11th and 12th classes
  - Must select valid options
  - Cannot be changed after admission

- **Fees:**
  - Application fee: Minimum amount required
  - Reservation fee: Minimum amount required
  - Cannot be negative
  - Cannot exceed maximum allowed

---

### 1.4 Viewing Reservations

Same as School module - see School guide section 1.3

---

### 1.5 Editing Reservations

Same as School module - see School guide section 1.4

**Additional Note:**

- Group and Course cannot be edited after creation
- These fields are locked once reservation is created

---

## 2. Admissions Management

### Overview

Convert confirmed reservations to admissions and manage student admissions for college.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/college/admissions`

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
   - Check Group and Course (for 11th/12th)
   - Check payment status
   - Review remarks

4. **Convert to Admission**
   - Click "Convert to Admission" button
   - Admission form opens with pre-filled data
   - Group and Course are pre-filled (cannot be changed)

5. **Fee Lock (If Applicable)**
   - Enter concession amount (if principal approved)
   - Click "Lock Fee"
   - **Note:** Once locked, only Admin can unlock

6. **Edit Admission Details (If Needed)**
   - Can edit: Contact details, address, transport
   - Cannot edit: Student name, Aadhar numbers, Group, Course

7. **Generate Admission Number**
   - Format: NZN24250001
   - Same format as School
   - Auto-generated sequentially

8. **Save Admission**
   - Click "Save Admission"
   - Admission number is auto-generated
   - Student is now enrolled

---

### 2.2 Fee Payment During Admission

Same validations as School module - see School guide section 2.2

**Key Points:**

- Books fee must be paid first
- Term payment sequence validation
- Transport fees before Term 3

---

### 2.3 Viewing Admissions

Same as School module - see School guide section 2.3

**Additional Information:**

- Group column displayed
- Course column displayed
- Filter by Group and Course

---

## 3. Student Management

### Overview

Manage enrolled college students, view profiles, manage enrollments, and assign transport.

**Access:** Admin, Institute Admin, Academic, Accountant  
**Location:** `/college/students`

---

### 3.1 Student List

Same features as School module - see School guide section 3.1

**Additional Filters:**

- Filter by Group
- Filter by Course
- Filter by Combination

---

### 3.2 Student Profile

Same as School module - see School guide section 3.2

**Additional Information Displayed:**

- Group
- Course
- Combination (if applicable)

---

### 3.3 Section Mapping

Same workflow as School module - see School guide section 3.3

**College-Specific:**

- Sections are organized by Group
- Students from same Group are typically in same section
- Can mix Groups in sections (if needed)

---

### 3.4 Enrollments Management

Same as School module - see School guide section 3.4

**Additional Fields:**

- Group
- Course
- Combination

---

### 3.5 Transport Assignment

Same as School module - see School guide section 3.5

---

## 4. Academic Management

### Overview

Manage college academic structure: courses, groups, subjects, sections, exams, tests, and teacher assignments.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/college/academic`

---

### 4.1 Academic Year Management

Same as School module - see School guide section 4.1

---

### 4.2 Course Management

#### Creating Course

**Workflow:**

1. Navigate to Academic → Courses
2. Click "Add Course"
3. Enter:
   - Course name (e.g., "IPE", "Mains", "EAPCET")
   - Course code (optional)
   - Description (optional)
4. Save

**Validations:**

- Course name must be unique
- Course code must be unique (if provided)

**Limitations:**

- Cannot delete course with students
- Cannot delete course with subjects
- Can only deactivate

---

### 4.3 Group Management

#### Creating Group

**Workflow:**

1. Navigate to Academic → Groups
2. Click "Add Group"
3. Enter:
   - Group name (e.g., "MPC", "BiPC")
   - Group code (optional)
   - Description (optional)
4. Save

**Validations:**

- Group name must be unique
- Group code must be unique (if provided)

**Common Groups:**

- **MPC:** Mathematics, Physics, Chemistry
- **BiPC:** Biology, Physics, Chemistry
- **CEC:** Commerce, Economics, Civics
- **HEC:** History, Economics, Civics

---

### 4.4 Class Management

Same as School module - see School guide section 4.2

**College-Specific:**

- Classes: 11th, 12th, and other college classes
- Classes are linked to Courses and Groups

---

### 4.5 Subject Management

Same as School module - see School guide section 4.3

**College-Specific:**

- Subjects are linked to Groups
- Different Groups have different subjects
- Common subjects across Groups

---

### 4.6 Section Management

Same as School module - see School guide section 4.4

**College-Specific:**

- Sections can be Group-specific
- Or mixed Groups in same section

---

### 4.7 Exam Management

Same as School module - see School guide section 4.5

---

### 4.8 Test Management

Same as School module - see School guide section 4.6

---

### 4.9 Teacher Assignments

#### Assigning Teachers

**Workflow:**

1. Navigate to Academic → Teacher Assignments
2. Select course and group
3. Click "Assign Teacher"
4. Select:
   - Teacher
   - Subject
   - Section (optional)
5. Save

**College-Specific:**

- Teachers assigned to Course + Group + Subject
- One teacher can teach multiple Groups
- One teacher can teach multiple Courses

---

## 5. Attendance Management

### Overview

Record and manage monthly attendance for college students.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/college/attendance`

---

### 5.1 Monthly Attendance Entry

Same workflow as School module - see School guide section 5.1

**College-Specific:**

- Can filter by Course and Group
- Attendance tracked by Group
- Reports can be Group-wise

---

### 5.2 Validations

Same as School module - see School guide section 5.2

---

### 5.3 Viewing Attendance

Same as School module - see School guide section 5.3

**Additional Filters:**

- Filter by Course
- Filter by Group
- Filter by Combination

---

## 6. Marks Management

### Overview

Enter and manage exam and test marks for college students.

**Access:** Admin, Institute Admin, Academic  
**Location:** `/college/marks`

---

### 6.1 Exam Marks Entry

Same workflow as School module - see School guide section 6.1

**College-Specific:**

- Marks entry by Course and Group
- Different subjects for different Groups
- Group-wise performance tracking

---

### 6.2 Test Marks Entry

Same as School module - see School guide section 6.2

---

### 6.3 Validations

Same as School module - see School guide section 6.3

---

### 6.4 Marks Reports

Same as School module - see School guide section 6.4

**Additional Reports:**

- Group-wise performance
- Course-wise performance
- Combination-wise performance
- Subject-wise by Group

---

## 7. Fees Management

### Overview

Collect fees, manage fee balances, and track payments for college students.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/college/fees`

---

### 7.1 Fee Collection

Same workflow as School module - see School guide section 7.1

**College-Specific:**

- Fee structure may vary by Course
- Fee structure may vary by Group
- Different fee rates for different combinations

---

### 7.2 Validations

Same as School module - see School guide section 7.2

**Additional Validations:**

- Course-specific fee validation
- Group-specific fee validation

---

### 7.3 Fee Balance Tracking

Same as School module - see School guide section 7.3

**Additional Filters:**

- Filter by Course
- Filter by Group
- Filter by Combination

---

### 7.4 Receipt Generation

Same as School module - see School guide section 7.4

---

## 8. Financial Reports

### Overview

Comprehensive financial reporting and analytics for college.

**Access:** Admin, Institute Admin, Accountant  
**Location:** `/college/financial-reports`

---

### 8.1 Available Reports

Same report types as School module - see School guide section 8.1

**Additional Reports:**

- Course-wise fee collection
- Group-wise fee collection
- Combination-wise reports

---

### 8.2 Generating Reports

Same workflow as School module - see School guide section 8.2

**Additional Filters:**

- Filter by Course
- Filter by Group
- Filter by Combination

---

### 8.3 Report Filters

Same as School module - see School guide section 8.3

**Additional Filters:**

- **Course:** Filter by course type
- **Group:** Filter by group
- **Combination:** Filter by course + group combination

---

### 8.4 Financial Analytics

Same as School module - see School guide section 8.4

**Additional Analytics:**

- Course-wise income breakdown
- Group-wise income breakdown
- Combination performance

---

## 9. Announcements

### Overview

Create and manage institutional announcements for college.

**Access:** Admin, Institute Admin, Academic, Accountant  
**Location:** `/college/announcements`

---

### 9.1 Creating Announcements

Same workflow as School module - see School guide section 9.1

**College-Specific:**

- Can target specific Courses
- Can target specific Groups
- Can target specific Combinations

---

### 9.2 Announcement Types

Same as School module - see School guide section 9.2

**Additional Types:**

- Course-specific announcements
- Group-specific announcements
- Combination-specific announcements

---

### 9.3 Viewing Announcements

Same as School module - see School guide section 9.3

**Additional Filters:**

- Filter by Course
- Filter by Group

---

## 🔑 Key Differences: College vs School

### Academic Structure

| Feature  | School         | College               |
| -------- | -------------- | --------------------- |
| Classes  | 1st to 10th    | 11th, 12th, and other |
| Groups   | Not applicable | MPC, BiPC, etc.       |
| Courses  | Not applicable | IPE, Mains, EAPCET    |
| Subjects | Class-based    | Group-based           |
| Sections | Class-based    | Group/Course-based    |

### Reservation/Admission

| Feature       | School       | College                |
| ------------- | ------------ | ---------------------- |
| Group Field   | Not required | Required for 11th/12th |
| Course Field  | Not required | Required for 11th/12th |
| Fee Structure | Class-based  | Course/Group-based     |

### Academic Management

| Feature            | School          | College                  |
| ------------------ | --------------- | ------------------------ |
| Course Management  | Not available   | Available                |
| Group Management   | Not available   | Available                |
| Teacher Assignment | Class + Subject | Course + Group + Subject |

---

## ⚠️ Important Notes & Recommendations

### 🔄 Browser Refresh & Troubleshooting

#### When to Refresh Browser

**Mandatory Refresh Required:**

- If reservation/admission data is not updating automatically
- If fee collection is not reflecting immediately
- If student list is not showing latest entries
- If Group/Course data seems outdated
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
- Refresh after Group/Course assignments
- Regular refresh ensures you see the latest data

---

### 💾 Data Caching & Performance

#### Cache System

**Why Caching is Used:**

- Improves system performance and speed
- Reduces server load
- Faster data loading for students, fees, courses, groups
- Better user experience

**How It Works:**

- Student data, fee balances, courses, groups are cached
- Data is automatically refreshed when needed
- Cache is cleared on logout

**Important Notes:**

- If you see outdated fee balance, refresh browser
- If student list seems old, refresh to get latest data
- If Group/Course dropdowns seem outdated, refresh
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
3. Verify student details, admission number, Group, Course
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
- Course/Group-specific fee validation

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
- Group/Course assignments may not save
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

#### Reservation Form (College-Specific)

**Before Saving:**

- Verify all Aadhar numbers are correct (12 digits)
- Check mobile numbers are valid (10 digits)
- **Important:** Select correct Group (MPC/BiPC) - cannot be changed later
- **Important:** Select correct Course (IPE/Mains/EAPCET) - cannot be changed later
- Ensure class selection is correct (11th/12th for Group/Course)
- Verify fee amounts
- Double-check transport selection if applicable

**After Saving:**

- Wait for confirmation message
- Print reservation form immediately
- Note reservation number
- Refresh to see in reservations list
- Verify Group and Course are saved correctly

---

#### Admission Form (College-Specific)

**Before Converting:**

- Verify reservation details are correct
- **Verify Group and Course are correct** - cannot be changed after admission
- Check payment status
- Review fee structure (may vary by Course/Group)
- If fee lock needed, ensure Admin approval first

**After Converting:**

- Wait for admission number generation
- Print admission form immediately
- Note admission number
- Refresh to see in admissions list
- Verify Group and Course are preserved

---

### 🔍 Search & Filter Tips

#### Efficient Searching

**Search Best Practices:**

- Use exact admission/reservation numbers for fastest results
- Use student name for broader search
- Use mobile number for quick access
- Filter by Group/Course for college-specific searches
- Combine filters for precise results

**Filter Tips:**

- Use date range filters to narrow down data
- Filter by Course to see course-specific data
- Filter by Group to see group-specific data
- Filter by Combination (Course + Group) for precise results
- Clear filters to see all data

---

### 📊 Report Generation

#### Report Best Practices

**Before Generating Reports:**

- Refresh browser to get latest data
- Select appropriate date range
- Apply necessary filters (Course, Group, Combination)
- Ensure stable network connection

**Report Tips:**

- Large date ranges may take time - be patient
- Use filters to reduce report size
- Export to Excel for offline analysis
- Reports are generated from cached data - refresh if needed
- Course/Group filters help generate specific reports

---

### College-Specific Limitations

1. **Group & Course:**
   - Cannot be changed after reservation creation
   - Cannot be changed after admission
   - Historical data preserved
   - **Critical:** Select carefully as changes are not possible

2. **Fee Structure:**
   - May vary by Course
   - May vary by Group
   - Must be configured correctly
   - Refresh to see latest fee structure

3. **Academic Structure:**
   - Subjects linked to Groups
   - Teachers assigned to Course + Group + Subject
   - Sections can be Group-specific
   - Refresh after assignments to verify

4. **Reports:**
   - Additional filters for Course and Group
   - Group-wise performance tracking
   - Course-wise financial reports
   - Refresh before generating reports

---

## 📞 Support

For assistance with College module:

- **Email:** contact@smdigitalx.com
- **Phone:** +91 8184919998
- **In-System:** Use Help icons and tooltips

---

## 📝 Document Information

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** College Management  
**Status:** Production Documentation

---

**Related Guides:**

- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School: `USER_GUIDE_02_SCHOOL.md`
- General: `USER_GUIDE_04_GENERAL.md`
