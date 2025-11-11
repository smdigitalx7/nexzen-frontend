# Velocity ERP System - User Guide Overview

## Complete Module & Feature Overview

**Version:** 1.0.0  
**Last Updated:** January 2025  
**System Type:** School & College ERP Management System

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [User Roles & Access](#user-roles--access)
3. [Module Structure](#module-structure)
4. [Navigation Guide](#navigation-guide)
5. [Common Features](#common-features)
6. [Quick Start Guide](#quick-start-guide)

---

## 🎯 System Overview

The Velonex ERP system is a comprehensive educational management platform designed for schools and colleges. It manages the complete student lifecycle from reservation to graduation, including financial management, academic tracking, employee management, and administrative functions.

### Key Capabilities

- **Student Management:** Complete lifecycle from reservation to admission to graduation
- **Financial Management:** Fee collection, income tracking, expenditure management
- **Academic Management:** Attendance, marks, exams, subjects, and performance tracking
- **Employee Management:** Staff management, payroll, leave tracking
- **Transport Management:** Bus routes, distance slabs, fee calculation
- **Reporting & Analytics:** Comprehensive reports with Excel export

---

## 👥 User Roles & Access

### 1. Admin Role

**Access Level:** Full System Access

**Primary Responsibilities:**

- System configuration and management
- Employee management and payroll
- Transport management
- Financial oversight
- User management
- Audit log monitoring

**Key Modules:**

- User Management
- Employee Management
- Payroll Management
- Transport Management
- Audit Log
- All School/College modules (full access)

---

### 2. Accountant Role

**Access Level:** Financial & Student Registration

**Primary Responsibilities:**

- Student reservations
- Student admissions
- Fee collection
- Income and expenditure management
- Financial reporting
- Receipt generation

**Key Modules:**

- Reservations (School/College)
- Admissions (School/College)
- Fees Management (School/College)
- Financial Reports (School/College)
- Income & Expenditure

**Restrictions:**

- Cannot access academic modules (Attendance, Marks)
- Cannot modify locked fees (Admin-only)
- Cannot access employee management

---

### 3. Academic Role

**Access Level:** Academic & Student Management

**Primary Responsibilities:**

- Section mapping for students
- Attendance management
- Marks entry and management
- Student profile management
- Teacher assignments
- Announcements

**Key Modules:**

- Academic Management
- Section Mapping
- Attendance Management
- Marks Management
- Student Profiles
- Teacher Assignments
- Announcements

**Restrictions:**

- Cannot access financial modules
- Cannot create reservations or admissions
- Cannot modify employee data
- Cannot access transport management

---

## 📦 Module Structure

The system is organized into three main categories:

### 1. General Modules

**Access:** Admin

**Modules:**

- **User Management:** Create and manage system users
- **Employee Management:** Staff records, attendance, leaves, advances
- **Payroll Management:** Salary calculation and processing
- **Transport Management:** Bus routes, distance slabs, vehicle management
- **Audit Log:** System activity tracking

**Location:** Accessible from main sidebar (General section)

---

### 2. School Modules

**Access:** Based on role and branch type (SCHOOL)

**Modules:**

- **Reservations:** New student reservations
- **Admissions:** Convert reservations to admissions
- **Students:** Student management and profiles
- **Academic:** Classes, subjects, sections, exams, tests
- **Attendance:** Monthly attendance entry
- **Marks:** Exam and test marks entry
- **Fees:** Fee collection and management
- **Financial Reports:** Comprehensive financial analytics
- **Announcements:** Institutional communications

**Location:** `/school/*` routes

---

### 3. College Modules

**Access:** Based on role and branch type (COLLEGE)

**Modules:**

- **Reservations:** New student reservations (with Group/Course)
- **Admissions:** Convert reservations to admissions
- **Students:** Student management and profiles
- **Academic:** Courses, groups, subjects, sections, exams, tests
- **Attendance:** Monthly attendance entry
- **Marks:** Exam and test marks entry
- **Fees:** Fee collection and management
- **Financial Reports:** Comprehensive financial analytics
- **Announcements:** Institutional communications

**Location:** `/college/*` routes

**Key Differences from School:**

- Additional Group selection (MPC, BiPC, N/A)
- Additional Course selection (IPE, Mains, EAPCET, N/A)
- Course-based academic structure
- Group-based class organization

---

## 🧭 Navigation Guide

### Main Navigation Structure

```
Dashboard
├── General (Admin/Institute Admin only)
│   ├── Users
│   ├── Employees
│   ├── Payroll
│   ├── Transport
│   └── Audit Log
│
├── School (if branch_type = SCHOOL)
│   ├── Reservations
│   ├── Admissions
│   ├── Students
│   ├── Academic
│   ├── Attendance
│   ├── Marks
│   ├── Fees
│   ├── Financial Reports
│   └── Announcements
│
└── College (if branch_type = COLLEGE)
    ├── Reservations
    ├── Admissions
    ├── Students
    ├── Academic
    ├── Attendance
    ├── Marks
    ├── Fees
    ├── Financial Reports
    └── Announcements
```

### Branch Switching

- **Location:** Top header bar
- **Function:** Switch between different branches
- **Access:** Users with access to multiple branches
- **Impact:** Changes all module data to selected branch

### Academic Year Switching

- **Location:** Top header bar
- **Function:** Switch between academic years
- **Access:** All users
- **Impact:** Filters data by selected academic year

---

## 🔧 Common Features

### 1. Search Functionality

**Available In:**

- Student management
- Employee management
- Reservations
- Admissions
- Global search (header)

**Features:**

- Search by name, ID, admission number
- Real-time search results
- Filter by multiple criteria
- Quick access to records

---

### 2. Data Tables

**Common Features:**

- Sorting by columns
- Filtering
- Pagination
- Export to Excel
- Bulk actions (where applicable)
- Row selection
- Column visibility toggle

---

### 3. Forms & Dialogs

**Standard Form Features:**

- Required field indicators (\*)
- Validation messages
- Auto-save (where applicable)
- Cancel/Save buttons
- Form reset
- Field-level help text

---

### 4. Reports & Export

**Available Formats:**

- Excel (.xlsx)
- PDF (for receipts and forms)
- On-screen view

**Common Filters:**

- Date range
- Class/Course
- Status
- User/Accountant
- Payment method

---

### 5. Print Functionality

**Printable Documents:**

- Receipts
- Admission forms
- Reservation forms
- Reports
- Student profiles

**Features:**

- Print preview
- Page setup
- Print to PDF
- Print to physical printer

---

## 🚀 Quick Start Guide

### For First-Time Users

#### Step 1: Login

1. Navigate to login page
2. Enter email/phone and password
3. System redirects to role-specific features with permissions and Assigned branches

#### Step 2: Understand Your Dashboard

- **Admin:** Overview of all modules
- **Accountant:** Financial overview and quick links
- **Academic:** Academic metrics and quick links

#### Step 3: Navigate to Your Primary Module

- Use sidebar navigation
- Click on module name
- Explore tabs within modules

#### Step 4: Perform Your First Action

- **Accountant:** Create a new reservation
- **Academic:** Map sections to students
- **Admin:** View audit log

---

### Common Workflows

#### Accountant Workflow

1. **Create Reservation** → Fill form → Save & Pay
2. **View Reservations** → Select reservation → Convert to Admission
3. **Collect Fees** → Search student → Select terms → Process payment
4. **Generate Reports** → Select filters → Export to Excel

#### Academic Workflow

1. **Map Sections** → Select class → Select students → Assign section
2. **Mark Attendance** → Select class/section → Select month → Enter attendance
3. **Enter Marks** → Select exam → Select class → Enter marks
4. **View Reports** → Select student → View performance

#### Admin Workflow

1. **Manage Employees** → Add employee → Set salary → Process payroll
2. **Manage Transport** → Create route → Set distance slabs → Assign drivers
3. **View Reports** → Select report type → Apply filters → Export

---

## 📊 Data Flow Overview

### Student Lifecycle

```
Reservation → Payment → Confirmation → Admission → Enrollment →
Section Assignment → Attendance → Marks → Reports → Promotion
```

### Financial Flow

```
Reservation Fee → Application Fee → Admission Fee →
Term 1 Payment → Term 2 Payment → Term 3 Payment →
Transport Fees → Books Fee → Other Fees
```

### Academic Flow

```
Academic Year Setup → Class Setup → Subject Setup →
Section Setup → Teacher Assignment → Exam Creation →
Marks Entry → Report Generation
```

---

## ⚠️ Important Notes & Recommendations

### 🔄 Browser Refresh & Troubleshooting

#### When to Refresh Browser

**Mandatory Refresh Required:**

- If data is not updating automatically after an action
- If changes are not reflected immediately
- **Action:** Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac) to refresh

**If UI is Stuck or Issues Occur:**

- First, try refreshing the browser (`F5` or `Ctrl+R`)
- If issue persists, logout and login again
- Clear browser cache if problems continue
- **Note:** These issues occur in some minor cases, not all cases

**Best Practice:**

- Refresh browser after completing important actions
- Refresh before starting a new task if data seems outdated
- Regular refresh ensures you see the latest data

---

### 💾 Data Caching & Performance

#### Cache System

**Why Caching is Used:**

- Improves system performance
- Reduces server load
- Faster data loading
- Better user experience

**How It Works:**

- Frequently accessed data is stored in browser cache
- Data is automatically refreshed when needed
- Cache is cleared on logout

**Important Notes:**

- If you see outdated data, refresh the browser
- Cache updates automatically in most cases
- Manual refresh ensures latest data
- Cache helps system work faster

---

### 📄 Receipt Management

#### Receipt Preview & Regeneration

**If Receipt Preview is Closed by Mistake:**

1. Navigate to **Financial Reports** → **Income** section
2. Find the payment transaction
3. Click on the transaction
4. Click **"Regenerate Receipt"** button
5. Receipt will be regenerated and can be printed

**Receipt Access:**

- All receipts are stored in the system
- Can be regenerated anytime
- Can be printed multiple times
- Receipts are linked to payment transactions

---

### 💳 Payment Processing

#### Payment Retry & Best Practices

**If Payment Fails:**

- System automatically shows **"Retry Payment"** option
- **Important:** Refresh browser before retrying payment
- Check payment details before retrying
- Verify payment mode is correct

**Before Making Payment:**

1. Ensure stable network connection
2. Refresh browser to get latest fee balance
3. Verify student details
4. Check payment amount
5. Select correct payment mode

**Payment Best Practices:**

- Always refresh before payment
- Verify receipt after payment
- Save receipt immediately
- Check payment in transaction history

---

### 🌐 Network Requirements

#### Network Stability

**Critical Requirement:**

- **Stable internet connection is mandatory**
- System requires consistent network connectivity
- Unstable network will cause system issues

**What Happens with Unstable Network:**

- Data may not save properly
- Payments may fail
- Reports may not generate
- System may become unresponsive

**Recommendations:**

- Use stable Wi-Fi or wired connection
- Avoid mobile data if unstable
- Check network before important operations
- Wait for network to stabilize before retrying

**Network Indicators:**

- Check browser connection status
- Look for loading indicators
- If connection lost, system will show error
- Reconnect and refresh before continuing

---

### Data Validation

- All forms have validation rules
- Required fields are marked with (\*)
- Invalid data shows error messages
- Some fields have format requirements (e.g., phone numbers, dates)

### Permissions

- Each role has specific permissions
- Some actions require Admin approval
- Fee locking requires Admin unlock
- Direct URL access may be restricted for some roles

### Data Integrity

- Cannot delete records with dependencies
- Historical data is preserved
- Audit logs track all changes
- Some fields cannot be edited after creation

### Performance

- Large datasets use pagination
- Reports may take time for large date ranges
- Export functions process in background
- Use filters to narrow down data

---

## 🔗 Related Documentation

- **School Module Guide:** See `USER_GUIDE_02_SCHOOL.md`
- **College Module Guide:** See `USER_GUIDE_03_COLLEGE.md`
- **General Module Guide:** See `USER_GUIDE_04_GENERAL.md`
- **Technical Documentation:** See `CLIENT_REQUIREMENTS_ANALYSIS.md`

---

## 📞 Support

For assistance:

- **Email:** contact@smdigitalx.com
- **Phone:** +91 8184919998
- **In-System:** Use Help icons and tooltips

---

## 📝 Document Information

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Prepared By:** Development Team  
**Status:** Production Documentation

---

**Next:** Proceed to specific module guides for detailed workflows and instructions.
