# Accountant Role - Complete Feature & Permission Guide

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Accountant (Financial & Student Registration)  
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

**Accountant Role** is responsible for **Financial Management and Student Registration**. Accountants handle all financial transactions, student reservations, admissions, and fee collections.

### Primary Responsibilities

- Student reservations creation and management
- Student admissions (converting reservations)
- Fee collection and receipt generation
- Income and expenditure management
- Financial reporting and analytics
- Receipt regeneration
- Payment processing
- Financial data entry and validation

### Access Level

**Level:** Financial & Student Registration Access  
**Scope:** School/College modules (financial and registration only)  
**Restrictions:** Cannot access academic modules, employee management, transport management

---

## 🔐 Access Level & Permissions

### Module Access Matrix

| Module | Access Level | Create | Read | Update | Delete | Special Permissions |
|--------|-------------|--------|------|--------|--------|-------------------|
| **School Modules** |
| Reservations | Full | ✅ | ✅ | ✅ | ❌ | Create, edit, convert to admission. **Cannot delete** |
| Admissions | Full | ✅ | ✅ | ✅ | ❌ | Convert reservations, edit details |
| Students | View Only | ❌ | ✅ | ❌ | ❌ | View only. Tabs: Enrollments, Transport (no Section Mapping) |
| Fees | Full | ✅ | ✅ | ✅ | ❌ | Collect fees, generate receipts |
| Financial Reports | Full | ✅ | ✅ | ❌ | ❌ | Generate, view, export reports. Expenditure tab: **Cannot edit/delete** |
| Income & Expenditure | Full | ✅ | ✅ | ✅ | ✅ | Add income, add expenditure. Expenditure: **Cannot edit/delete** |
| Announcements | Limited | ✅ | ✅ | ✅ | ✅ | Can create/view announcements |
| **College Modules** |
| Reservations | Full | ✅ | ✅ | ✅ | ❌ | Same as School. **Cannot delete** |
| Admissions | Full | ✅ | ✅ | ✅ | ❌ | Same as School |
| Students | View Only | ❌ | ✅ | ❌ | ❌ | Same as School. Tabs: Enrollments, Transport |
| Fees | Full | ✅ | ✅ | ✅ | ❌ | Same as School |
| Financial Reports | Full | ✅ | ✅ | ❌ | ❌ | Same as School. Expenditure: **Cannot edit/delete** |
| Income & Expenditure | Full | ✅ | ✅ | ✅ | ✅ | Same as School. Expenditure: **Cannot edit/delete** |
| Announcements | Limited | ✅ | ✅ | ✅ | ✅ | Same as School |
| **Restricted Modules** |
| Academic | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Attendance | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Marks | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Employee Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Payroll | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Transport Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| User Management | ❌ | ❌ | ❌ | ❌ | ❌ | No access |
| Audit Log | View Only | ❌ | ✅ | ❌ | ❌ | View own activities only |

---

## ✨ Available Features

### 1. Reservations Management

#### 1.1 Create Reservations

**Features:**
- Create new student reservations
- Fill complete reservation form
- Enter personal details (name, Aadhar, DOB, gender)
- Enter guardian details (father, mother)
- Enter previous school details
- Enter contact details (address, mobile)
- Enter academic details (class, transport)
- Enter fee details (application fee, reservation fee)
- Save and pay reservation fees
- Generate reservation number (auto-generated)
- Print reservation form

**Access:** Full Create access

**Validations:**
- Aadhar must be 12 digits
- Mobile must be 10 digits
- All required fields must be filled
- Fee amounts must be valid

---

#### 1.2 View Reservations

**Features:**
- View all reservations
- Search by reservation number, name, mobile
- Filter by status, class, date
- View reservation details
- View payment status
- Export reservation list

**Access:** Full Read access

---

#### 1.3 Edit Reservations

**Features:**
- Edit contact details
- Edit transport details
- Edit fees (if not paid)
- Edit remarks
- Cannot edit: Name, Aadhar numbers (after creation)

**Access:** Limited Update access

**Restrictions:**
- Cannot edit student name
- Cannot edit Aadhar numbers
- Cannot edit reservation number
- Cannot edit payment history

---

#### 1.4 Delete Reservations

**Features:**
- **Delete button is hidden** (Admin-only privilege)
- Cannot delete reservations

**Access:** No Delete access

**Restrictions:**
- ⚠️ **Cannot delete reservations** (Admin-only)
- Delete button is not visible in UI
- Must contact Admin to delete reservations

---

### 2. Students Management

#### 2.1 View Students

**Features:**
- View student enrollments
- View student transport assignments
- Search by name, admission number, mobile
- Filter by class, section
- Export student list

**Access:** View-only access

**Available Tabs:**
- **Enrollments Tab:** View all student enrollments
- **Transport Tab:** View student transport assignments (view only, cannot edit/delete)

**Restrictions:**
- ⚠️ **Section Mapping tab is hidden** (Admin/Academic only)
- Cannot create students (via admission only)
- Cannot delete students
- Cannot edit transport assignments (no Edit/Delete buttons)
- Cannot assign sections (Academic role)

---

### 3. Admissions Management

#### 2.1 Convert Reservations to Admissions

**Features:**
- Search reservations by number
- View reservation details
- Convert confirmed reservations to admissions
- Pre-fill admission form from reservation
- Edit contact details during conversion
- Generate admission number (auto-generated: NZN24250001)
- Save admission

**Access:** Full Create access (via conversion)

**Validations:**
- Reservation must be confirmed
- Application fee must be paid
- Reservation fee must be paid

---

#### 2.2 Fee Locking

**Features:**
- Enter concession amount (if principal approved)
- Lock fees with concession
- **Cannot unlock fees** (Admin-only privilege)
- View locked fee status

**Access:** Limited Update access

**Restrictions:**
- ⚠️ **Cannot unlock fees once locked**
- ⚠️ **Cannot edit locked fees**
- Must contact Admin to unlock

**Important Note:**
- Once fee is locked, it cannot be changed
- Lock fees only after Admin approval
- Verify amounts before locking

---

#### 2.3 Edit Admissions

**Features:**
- Edit contact details (address, mobile)
- Edit transport details
- Edit remarks
- Cannot edit: Name, Aadhar, Admission number, Locked fees

**Access:** Limited Update access

**Restrictions:**
- Cannot edit student name
- Cannot edit Aadhar numbers
- Cannot edit admission number
- Cannot edit locked fees
- Cannot edit payment history

---

#### 2.4 View Admissions

**Features:**
- View all admissions
- Search by admission number, name, mobile
- Filter by class, section, status
- View admission details
- View fee balance
- Export admission list

**Access:** Full Read access

---

### 3. Fee Collection

#### 3.1 Collect Fees

**Features:**
- Search student by admission number, name, mobile
- View fee balance (tuition, transport, books)
- Select fees to collect (books, terms, transport)
- Enter payment amount
- Select payment mode (Cash, Cheque, Online, UPI)
- Enter payment details (cheque number, bank, etc.)
- Process payment
- Generate receipt automatically
- Print receipt

**Access:** Full Create access

**Validations:**
- Books fee must be paid first (system enforced)
- Term payment sequence: 40%, 30%, 30%
- Transport fees before Term 3
- Payment amount cannot exceed outstanding
- Cannot be negative

---

#### 3.2 View Fee Transactions

**Features:**
- View all fee transactions
- View payment history
- View fee balances
- Search by student, date, payment mode
- Filter by class, date range
- Export transaction list

**Access:** Full Read access

---

#### 3.3 Regenerate Receipts

**Features:**
- Regenerate receipts from Income section
- View receipt details
- Print receipt multiple times
- Receipt number remains same

**Access:** Full Read access (receipt regeneration)

**Workflow:**
1. Navigate to Financial Reports → Income
2. Find payment transaction
3. Click "Regenerate Receipt" or "View Receipt"
4. Receipt is regenerated
5. Can print multiple times

---

### 4. Financial Reports

#### 4.1 Available Reports

**Features:**
- New Reservations Report
- Converted Admissions Report
- Not Converted Reservations (with remarks)
- Fee Reporting (Total, Class-wise, Term-wise)
- Day-wise Finance Report
- Admission-wise Finance Report
- Date Range Report
- Terms-wise Report
- Outstanding Fee Report
- Income Reports
- Expenditure Reports (view only, cannot edit/delete)

**Access:** Full Read access, can generate and export

---

#### 4.2 Expenditure Tab Restrictions

**Important:** In Financial Reports → Expenditure Tab:
- ✅ Can view all expenditure entries
- ✅ Can create new expenditure entries
- ❌ **Cannot edit expenditure entries** (Admin-only)
- ❌ **Cannot delete expenditure entries** (Admin-only)
- Edit and Delete buttons are hidden in the UI

**Workflow:**
1. Navigate to Financial Reports → Expenditure
2. View all expenditure entries
3. Can add new expenditure entries
4. Edit/Delete buttons are not visible (restricted to Admin)

---

### 5. Income & Expenditure

#### 5.1 Income Management

**Features:**
- Add miscellaneous income
- Enter income details (amount, description, date)
- View all income entries
- Edit income entries
- Delete income entries
- Export income report

**Access:** Full CRUD access

**Validations:**
- Amount must be positive
- Date must be valid
- Description is required

---

#### 5.2 Expenditure Management

**Features:**
- Add expenditure entries
- Enter expenditure details (amount, voucher, remarks)
- View all expenditure entries
- **Cannot edit expenditure entries** (Admin-only)
- **Cannot delete expenditure entries** (Admin-only)
- Export expenditure report
- **Expenditure is highlighted to Admin** (for review)

**Access:** Create and View access only (no Edit/Delete)

**Validations:**
- Amount must be positive
- Voucher number (if applicable)
- Remarks are required
- Date must be valid

**Restrictions:**
- ⚠️ **Cannot edit expenditure entries** (Admin-only)
- ⚠️ **Cannot delete expenditure entries** (Admin-only)
- Edit and Delete buttons are hidden in UI
- Must contact Admin for corrections

**Special Note:**
- Expenditure entries are visible to Admin
- Admin can review, edit, and delete
- Export available for reporting

---

### 6. Announcements

**Features:**
- Create announcements
- View announcements
- Edit announcements (before start date)
- Delete announcements (if not started)
- Cannot edit/delete after start date

**Access:** Limited CRUD access

**Restrictions:**
- Cannot edit after start date
- Cannot delete active announcements
- Admin can override

---

## 🔒 CRUD Operations & Access Controls

### Create Operations

**Allowed:**
- ✅ Create reservations
- ✅ Create admissions (via conversion)
- ✅ Create fee transactions
- ✅ Create income entries
- ✅ Create expenditure entries
- ✅ Create announcements
- ✅ Generate receipts

**Restrictions:**
- ❌ Cannot create students directly (via admission only)
- ❌ Cannot create academic settings
- ❌ Cannot create attendance/marks
- ❌ Cannot create employees
- ❌ Cannot create users

---

### Read Operations

**Allowed:**
- ✅ Read all reservations
- ✅ Read all admissions
- ✅ Read all fee transactions
- ✅ Read all financial reports
- ✅ Read income/expenditure
- ✅ Read student details (view only)
- ✅ Read own audit logs

**Restrictions:**
- ❌ Cannot read academic data (attendance, marks)
- ❌ Cannot read employee data
- ❌ Cannot read transport management
- ❌ Cannot read other users' audit logs (only own)

---

### Update Operations

**Allowed:**
- ✅ Update reservation details (limited fields)
- ✅ Update admission details (limited fields)
- ✅ Update fee transactions (before processing)
- ✅ Update income entries
- ✅ Update expenditure entries
- ✅ Update announcements (before start date)

**Restrictions:**
- ❌ Cannot update student name
- ❌ Cannot update Aadhar numbers
- ❌ Cannot update locked fees
- ❌ Cannot update payment history
- ❌ Cannot update academic data
- ❌ Cannot update employee data

**Special Restrictions:**
- ⚠️ **Cannot unlock fees** (Admin-only)
- ⚠️ **Cannot edit locked fees**

---

### Delete Operations

**Allowed:**
- ✅ Delete income entries
- ✅ Delete announcements (if not started)

**Restrictions:**
- ❌ **Cannot delete reservations** (Admin-only)
- ❌ **Cannot delete expenditure entries** (Admin-only)
- ❌ Cannot delete admissions
- ❌ Cannot delete fee transactions
- ❌ Cannot delete payment history
- ❌ Cannot delete students
- ❌ Cannot delete academic data
- ❌ Cannot delete employee data

---

## ✅ Validations & Business Rules

### Reservation Validations

1. **Personal Details:**
   - Student name: Required, cannot be empty
   - Aadhar: 12 digits, numeric only, unique
   - DOB: Valid date, cannot be future
   - Gender: Required, from dropdown

2. **Guardian Details:**
   - Father/Guardian name: Required
   - Father/Guardian Aadhar: 12 digits
   - Mother/Guardian name: Required
   - Mother/Guardian Aadhar: 12 digits
   - Occupation: Required

3. **Contact Details:**
   - Present address: Required
   - Permanent address: Required
   - Mobile numbers: 10 digits, must start with 6,7,8,9

4. **Academic Details:**
   - Class: Required, must be active
   - Transport: Yes/No, if Yes must select route
   - Application fee: Required, minimum amount
   - Reservation fee: Required, minimum amount

5. **College-Specific:**
   - Group: Required for 11th/12th (MPC, BiPC, N/A)
   - Course: Required for 11th/12th (IPE, Mains, EAPCET, N/A)

---

### Admission Validations

1. **Conversion Requirements:**
   - Reservation must be confirmed
   - Application fee must be paid
   - Reservation fee must be paid

2. **Admission Number:**
   - Auto-generated: NZN24250001
   - Format: NZN + Academic Year + Sequential Number
   - Cannot be changed

3. **Fee Locking:**
   - Can lock fees with concession
   - Once locked, cannot be unlocked (Admin-only)
   - Cannot edit locked fees

4. **Editable Fields:**
   - Contact details (address, mobile)
   - Transport details
   - Remarks
   - Cannot edit: Name, Aadhar, Admission number

---

### Fee Collection Validations

1. **Books Fee Validation:**
   - **Critical:** Books fee must be paid first
   - System blocks tuition fee if books fee pending
   - Cannot pay tuition fee without books fee

2. **Term Payment Sequence:**
   - Term 1: 40% of tuition fee
   - Term 2: 30% of tuition fee
   - Term 3: 30% of tuition fee
   - Must pay in sequence (can pay any term if books fee paid)

3. **Transport Fee Validation:**
   - Transport Term 1 and 2 must be paid
   - After Term 1 & 2 of tuition, transport must be paid before Term 3
   - System enforces this automatically

4. **Payment Amount:**
   - Cannot exceed outstanding amount
   - Cannot be negative
   - Must be valid payment mode
   - Minimum payment amount (if configured)

5. **Payment Mode:**
   - Cash, Cheque, Online Transfer, UPI, Other
   - Cheque requires cheque number
   - Online requires transaction ID (optional)

---

### Income & Expenditure Validations

1. **Income Validations:**
   - Amount: Must be positive, numeric
   - Description: Required
   - Date: Must be valid, cannot be future

2. **Expenditure Validations:**
   - Amount: Must be positive, numeric
   - Voucher: Required (if applicable)
   - Remarks: Required
   - Date: Must be valid, cannot be future
   - Highlighted to Admin for review

---

## 🚫 Restrictions & Limitations

### Access Restrictions

1. **Cannot Access:**
   - Academic modules (Attendance, Marks, Academic Management)
   - Employee Management
   - Payroll Management
   - Transport Management
   - User Management
   - Full Audit Log (only own activities)

2. **Limited Access:**
   - Students: View only, cannot create/delete
   - Announcements: Limited CRUD (cannot edit after start)

---

### Functional Restrictions

1. **Fee Management:**
   - ⚠️ **Cannot unlock fees** (Admin-only privilege)
   - ⚠️ **Cannot edit locked fees**
   - Cannot override fee validations
   - Must follow payment sequence

2. **Student Management:**
   - Cannot create students directly
   - Cannot delete students
   - Cannot assign sections (Academic role)
   - Cannot change sections (Academic role)
   - **Section Mapping tab is hidden** (only Enrollments and Transport tabs visible)
   - Cannot edit/delete transport assignments (view only)

3. **Data Modification:**
   - Cannot edit student name
   - Cannot edit Aadhar numbers
   - Cannot edit admission/reservation numbers
   - Cannot edit payment history

---

### Business Rule Restrictions

1. **Reservation Restrictions:**
   - **Cannot delete reservations** (Admin-only privilege)
   - Cannot delete if converted to admission
   - Cannot edit name/Aadhar after creation
   - Cannot edit payment history

2. **Admission Restrictions:**
   - Cannot delete admissions
   - Cannot edit locked fees
   - Cannot unlock fees
   - Cannot change admission number

3. **Payment Restrictions:**
   - Must follow payment sequence
   - Books fee must be first
   - Cannot exceed outstanding
   - Cannot delete payment transactions

4. **Expenditure Restrictions:**
   - ⚠️ **Cannot edit expenditure entries** (Admin-only)
   - ⚠️ **Cannot delete expenditure entries** (Admin-only)
   - Must contact Admin for corrections

---

## 📋 Acceptance Criteria

### Reservation Management

**AC1:** Accountant can create reservation
- ✅ All required fields validated
- ✅ Aadhar numbers are 12 digits
- ✅ Mobile numbers are 10 digits
- ✅ Reservation number auto-generated
- ✅ Reservation saved successfully

**AC2:** Accountant can edit reservation
- ✅ Can edit contact details
- ✅ Can edit transport details
- ✅ Cannot edit name/Aadhar
- ✅ Changes saved successfully

**AC3:** Accountant can convert reservation to admission
- ✅ Reservation is confirmed
- ✅ Fees are paid
- ✅ Admission form pre-filled
- ✅ Admission number generated
- ✅ Admission saved successfully

---

### Fee Collection

**AC1:** Accountant can collect fees
- ✅ Books fee must be paid first (system enforced)
- ✅ Can pay any term after books fee
- ✅ Payment amount validated
- ✅ Receipt generated automatically

**AC2:** Accountant can regenerate receipt
- ✅ Navigate to Income section
- ✅ Find transaction
- ✅ Click regenerate receipt
- ✅ Receipt regenerated successfully

**AC3:** Payment retry on failure
- ✅ System shows retry option
- ✅ Refresh browser before retry
- ✅ Payment processed successfully

---

### Fee Locking

**AC1:** Accountant can lock fees
- ✅ Enter concession amount
- ✅ Click lock fee
- ✅ Fee is locked
- ✅ Cannot be unlocked (by design)

**AC2:** Accountant cannot unlock fees
- ✅ Unlock option not available
- ✅ Must contact Admin
- ✅ System enforces restriction

---

### Income & Expenditure

**AC1:** Accountant can add income
- ✅ Amount is positive
- ✅ Description provided
- ✅ Date is valid
- ✅ Income saved successfully

**AC2:** Accountant can add expenditure
- ✅ Amount is positive
- ✅ Voucher/remarks provided
- ✅ Expenditure highlighted to Admin
- ✅ Expenditure saved successfully

---

## 💡 Best Practices

### Reservation Best Practices

1. **Before Creating:**
   - Verify all Aadhar numbers (12 digits)
   - Check mobile numbers (10 digits)
   - Ensure class selection is correct
   - Verify fee amounts

2. **After Creating:**
   - Print reservation form immediately
   - Note reservation number
   - Refresh browser to verify
   - Save receipt

---

### Admission Best Practices

1. **Before Converting:**
   - Verify reservation details
   - Check payment status
   - Review fee structure
   - Get Admin approval for concession (if needed)

2. **Fee Locking:**
   - Verify concession amount
   - Get Admin approval
   - Double-check before locking
   - Remember: Cannot unlock once locked

3. **After Converting:**
   - Print admission form immediately
   - Note admission number
   - Refresh browser to verify
   - Save all documents

---

### Fee Collection Best Practices

1. **Before Payment:**
   - **Refresh browser** (mandatory)
   - Verify student details
   - Check fee balance
   - Ensure stable network

2. **During Payment:**
   - Verify payment amount
   - Select correct payment mode
   - Enter all required details
   - Process payment

3. **After Payment:**
   - Verify receipt immediately
   - Print receipt
   - Save receipt PDF
   - Check transaction in history

4. **If Payment Fails:**
   - Refresh browser
   - Check network connection
   - Verify payment details
   - Retry payment

---

### Financial Reporting Best Practices

1. **Before Generating Reports:**
   - Refresh browser
   - Select appropriate date range
   - Apply necessary filters
   - Ensure stable network

2. **Report Generation:**
   - Wait for report to load
   - Verify data accuracy
   - Export to Excel for records
   - Save reports

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Cannot Unlock Fees:**
   - This is by design (Admin-only)
   - Contact Admin to unlock
   - Verify fee amounts before locking

2. **Payment Fails:**
   - Refresh browser
   - Check network connection
   - Verify payment details
   - Retry payment

3. **Receipt Preview Closed:**
   - Navigate to Income section
   - Find transaction
   - Regenerate receipt
   - Print receipt

4. **Cannot Edit Locked Fees:**
   - Fees are locked (by design)
   - Contact Admin to unlock
   - Verify amounts before locking

---

## 📝 Document Information

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Accountant  
**Status:** Production Documentation

### Permission System

All permissions are centrally configured in `client/src/lib/permissions/config.ts`. This ensures:
- Consistent permission enforcement across the application
- Easy maintenance and updates
- Type-safe permission checks
- Dynamic UI filtering based on user roles

**Key Restrictions for Accountant:**
- ❌ Cannot delete reservations (Admin-only)
- ❌ Cannot edit/delete expenditure entries (Admin-only)
- ❌ Section Mapping tab hidden in Students module
- ❌ Cannot edit/delete transport assignments (view only)

---

**Related Documents:**
- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School Guide: `USER_GUIDE_02_SCHOOL.md`
- College Guide: `USER_GUIDE_03_COLLEGE.md`
- General Guide: `USER_GUIDE_04_GENERAL.md`
- Admin Role: `ROLE_ADMIN.md`

