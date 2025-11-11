# Velocity ERP System - General Module User Guide
## Complete Feature Workflows & Instructions

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** General Management System

---

## 📋 Table of Contents

1. [User Management](#1-user-management)
2. [Employee Management](#2-employee-management)
3. [Payroll Management](#3-payroll-management)
4. [Transport Management](#4-transport-management)
5. [Audit Log](#5-audit-log)
6. [Announcements (General)](#6-announcements-general)

---

## 1. User Management

### Overview
Create and manage system users, assign roles, and manage permissions.

**Access:** Admin, Institute Admin  
**Location:** `/users`

---

### 1.1 Creating a New User

#### Workflow Steps

1. **Navigate to User Management**
   - Click "Users" in sidebar
   - Click "New User" button

2. **Fill User Details**
   - **Full Name** (Required): Complete name of user
   - **Email** (Required): Valid email address
   - **Phone Number** (Required): 10-digit mobile number
   - **Role** (Required): Select from dropdown
     - Admin
     - Institute Admin
     - Accountant
     - Academic
   - **Branch Access** (Required): Select branch(es) user can access
   - **Status** (Required): Active/Inactive

3. **Set Password**
   - **Password** (Required): Minimum 8 characters
   - **Confirm Password** (Required): Must match password
   - Or check "Send password reset email" to let user set password

4. **Save User**
   - Click "Save User"
   - User is created
   - Email notification sent (if configured)

---

### 1.2 Validations & Requirements

#### Input Validations

- **Email:**
  - Must be valid email format
  - Must be unique in system
  - Cannot be changed after creation

- **Phone Number:**
  - Must be exactly 10 digits
  - Numeric only
  - Must start with 6, 7, 8, or 9
  - Must be unique in system

- **Password:**
  - Minimum 8 characters
  - Recommended: Mix of uppercase, lowercase, numbers, special characters
  - Cannot be same as email

- **Role:**
  - Must select valid role
  - Role determines access permissions

- **Branch Access:**
  - Must select at least one branch
  - Can select multiple branches
  - User can switch between accessible branches

---

### 1.3 Viewing Users

#### User List

**Features:**
- Search by name, email, phone, role
- Filter by role, status, branch
- Sort by any column
- Export to Excel

**Columns:**
- Full Name
- Email
- Phone
- Role
- Branch(es)
- Status
- Last Login
- Actions

---

### 1.4 Editing Users

#### Workflow

1. Click "Edit" on user row
2. Modify allowed fields:
   - Full Name
   - Phone Number
   - Role
   - Branch Access
   - Status
3. Click "Save"

#### Limitations

- **Cannot Edit:**
  - Email (after creation)
  - User ID (auto-generated)

- **Can Edit:**
  - All other fields
  - Password (via reset)

---

### 1.5 Resetting User Password

#### Workflow

1. Select user
2. Click "Reset Password"
3. Choose method:
   - Send reset email to user
   - Set temporary password
4. User receives email with reset link
5. User sets new password

---

### 1.6 Deactivating Users

#### Workflow

1. Select user
2. Click "Deactivate"
3. Confirm deactivation
4. User cannot login
5. User data is preserved

**Note:** Cannot delete users with activity history. Only deactivate.

---

## 2. Employee Management

### Overview
Manage staff employees, track attendance, leaves, and advances.

**Access:** Admin, Institute Admin  
**Location:** `/employees`

---

### 2.1 Adding a New Employee

#### Workflow Steps

1. **Navigate to Employee Management**
   - Click "Employees" in sidebar
   - Click "New Employee" button

2. **Fill Personal Details**
   - **Employee Name** (Required): Full name
   - **Employee ID** (Required): Unique ID (auto-generated or manual)
   - **Aadhar Number** (Required): 12-digit Aadhar
   - **Gender** (Required): Male/Female/Other
   - **Date of Birth** (Required)
   - **Date of Joining** (Required)
   - **Designation** (Required): Select from dropdown
   - **Department** (Required): Select from dropdown

3. **Fill Contact Details**
   - **Email** (Optional): Valid email
   - **Phone Number** (Required): 10-digit mobile
   - **Present Address** (Required)
   - **Permanent Address** (Required)
   - **Emergency Contact** (Required): Name and phone

4. **Fill Employment Details**
   - **Employment Type** (Required): Permanent/Contract/Temporary
   - **Salary** (Required): Monthly salary amount
   - **Bank Details** (Optional):
     - Bank Name
     - Account Number
     - IFSC Code
   - **PAN Number** (Optional)

5. **Save Employee**
   - Click "Save Employee"
   - Employee is created
   - Employee ID is assigned

---

### 2.2 Employee ID Management

#### Unique Employee ID

**Rules:**
- Employee ID must be unique
- Once created, cannot be reused
- Even if employee is deleted/revoked, ID cannot be reused
- Auto-generated format: EMP001, EMP002, etc.
- Or manual entry (must be unique)

**Validation:**
- System checks uniqueness before save
- Error if duplicate ID found
- Cannot change ID after creation

---

### 2.3 Viewing Employees

#### Employee List

**Features:**
- Search by name, ID, phone, designation
- Filter by department, designation, status
- Sort by any column
- Export to Excel

**Columns:**
- Employee ID
- Employee Name
- Designation
- Department
- Phone
- Date of Joining
- Status
- Actions

---

### 2.4 Employee Profile

#### Viewing Complete Profile

**Information Displayed:**
- Personal details
- Contact information
- Employment details
- Salary information
- Attendance summary
- Leave balance
- Advance balance
- Payment history
- Complete employment history

**Access:**
- Click on employee name
- Or click "View Details"

---

### 2.5 Employee Attendance

#### Marking Attendance

**Workflow:**
1. Navigate to Employee → Attendance tab
2. Select date range
3. Click "Mark Attendance"
4. For each employee:
   - Present
   - Absent
   - Leave
   - Half Day
5. Save attendance

**Bulk Attendance:**
- Mark all present
- Then modify individual entries
- Faster for large teams

---

### 2.6 Leave Management

#### Monthly Leave Allocation

**Default Allocation:**
- 1 leave per month (standard)
- Allocated automatically at month start
- Shown in leave balance

#### Applying for Leave

**Workflow:**
1. Select employee
2. Go to Leaves tab
3. Click "Apply Leave"
4. Enter:
   - Leave type (Sick, Casual, Earned, etc.)
   - Start date
   - End date
   - Reason
   - Supporting documents (optional)
5. Submit leave application

#### Leave Approval

**Workflow:**
1. Admin/Manager views pending leaves
2. Review leave application
3. Approve or Reject
4. If approved, leave is deducted from balance
5. If rejected, reason is recorded

#### Automatic Salary Deduction

**Rule:** If employee takes more than 1 leave per month

**Calculation:**
- Extra leaves = Total leaves - 1
- Deduction per leave = Salary / 30
- Final salary = Salary - (Extra leaves × Salary/30)

**Example:**
- Salary: ₹30,000
- Leaves taken: 3
- Extra leaves: 3 - 1 = 2
- Deduction per leave: 30,000 / 30 = ₹1,000
- Total deduction: 2 × 1,000 = ₹2,000
- Final salary: 30,000 - 2,000 = ₹28,000

**System Behavior:**
- Automatic calculation during payroll
- Shown in salary slip
- Deduction details in payroll report

---

### 2.7 Employee Advances

#### Requesting Advance

**Workflow:**
1. Select employee
2. Go to Advances tab
3. Click "Request Advance"
4. Enter:
   - Advance amount
   - Reason
   - Expected repayment date
5. Submit request

#### Approving Advance

**Workflow:**
1. Admin views pending advances
2. Review request
3. Approve or Reject
4. If approved:
   - Advance is recorded
   - Repayment schedule created
   - Deducted from future salaries

#### Repayment

**Methods:**
- Automatic deduction from salary
- Manual repayment
- Partial repayment

**Tracking:**
- Advance balance shown
- Repayment history
- Outstanding amount

---

### 2.8 Employee History

#### Complete History Display

**Information:**
- Employment start date
- All designations held
- All departments worked
- Salary changes
- Leave history
- Advance history
- Attendance summary
- All status changes
- Termination/Resignation details (if applicable)

**Access:**
- Click "View History" on employee
- Complete timeline displayed
- Exportable to Excel

---

### 2.9 Updating Employee

#### Workflow

1. Click "Edit" on employee
2. Modify allowed fields:
   - Contact details
   - Designation
   - Department
   - Salary
   - Status
3. Click "Save"

#### Limitations

- **Cannot Edit:**
  - Employee ID (after creation)
  - Aadhar Number (after creation)
  - Date of Joining (historical data)

- **Can Edit:**
  - All other fields
  - Salary (creates history entry)
  - Designation (creates history entry)

---

### 2.10 Closing Employee

#### Workflow

1. Select employee
2. Click "Close Employee"
3. Enter:
   - Closing date
   - Reason (Resignation, Termination, Retirement, etc.)
   - Final settlement details
4. Confirm closure
5. Employee status changes to "Closed"
6. Employee ID cannot be reused

**Note:** Employee data is preserved for history and reporting.

---

## 3. Payroll Management

### Overview
Calculate and process employee salaries, manage payroll cycles.

**Access:** Admin, Institute Admin  
**Location:** `/payroll`

---

### 3.1 Salary Calculation

#### Workflow

1. **Navigate to Payroll**
   - Click "Payroll" in sidebar
   - Select "Salary Calculation"

2. **Select Payroll Period**
   - Select month
   - Select year
   - System loads employees for period

3. **Review Employee List**
   - All active employees
   - Current salary
   - Attendance summary
   - Leave balance
   - Advance balance

4. **Calculate Salary**
   - Click "Calculate Salary" for employee
   - Or "Calculate All" for bulk
   - System calculates:
     - Base salary
     - Leave deductions (if any)
     - Advance deductions (if any)
     - Net salary

5. **Review Calculations**
   - Check each employee
   - Verify deductions
   - Adjust if needed

6. **Process Payroll**
   - Click "Process Payroll"
   - Salaries are processed
   - Salary slips generated
   - Payment records created

---

### 3.2 Salary Calculation Formula

#### Standard Calculation

```
Base Salary = Monthly Salary
Leave Deduction = (Extra Leaves × Salary / 30)
Advance Deduction = Outstanding Advance Amount
Net Salary = Base Salary - Leave Deduction - Advance Deduction
```

#### Example

**Employee Details:**
- Monthly Salary: ₹30,000
- Leaves taken: 3
- Standard leaves: 1
- Extra leaves: 2
- Advance outstanding: ₹5,000

**Calculation:**
- Base Salary: ₹30,000
- Leave Deduction: 2 × (30,000 / 30) = ₹2,000
- Advance Deduction: ₹5,000
- Net Salary: 30,000 - 2,000 - 5,000 = ₹23,000

---

### 3.3 Leave Deduction Rules

#### Monthly Leave Allocation

- **Standard:** 1 leave per month
- **Allocated:** Automatically at month start
- **Carry Forward:** Not allowed (unless configured)

#### Deduction Rules

- **1 Leave:** No deduction
- **2 Leaves:** Deduct 1 leave (Salary/30)
- **3 Leaves:** Deduct 2 leaves (2 × Salary/30)
- **And so on...**

#### Calculation

```
If Leaves Taken > 1:
  Extra Leaves = Leaves Taken - 1
  Deduction = Extra Leaves × (Salary / 30)
Else:
  Deduction = 0
```

---

### 3.4 Payroll Processing

#### Workflow

1. **Select Employees**
   - Select employees to process
   - Or select all

2. **Review Calculations**
   - Check each calculation
   - Verify deductions
   - Adjust if needed

3. **Process Payment**
   - Select payment mode:
     - Bank Transfer
     - Cash
     - Cheque
   - Enter payment details
   - Process payment

4. **Generate Salary Slips**
   - Click "Generate Slips"
   - Salary slips created
   - Can be printed or emailed

---

### 3.5 Salary Slip

#### Contents

- Employee details
- Payroll period
- Earnings:
  - Basic salary
  - Allowances (if any)
- Deductions:
  - Leave deductions
  - Advance deductions
  - Other deductions
- Net salary
- Payment details
- Date and signature

---

### 3.6 Payroll Reports

#### Available Reports

1. **Monthly Payroll Report**
   - All employees
   - Salary details
   - Deductions
   - Net salary

2. **Employee-wise Report**
   - Individual employee
   - Year-wise summary
   - Month-wise breakdown

3. **Department-wise Report**
   - By department
   - Total salary
   - Average salary

4. **Deduction Report**
   - Leave deductions
   - Advance deductions
   - Other deductions

5. **Payment Report**
   - Payment status
   - Payment mode
   - Payment date

---

## 4. Transport Management

### Overview
Manage bus routes, distance slabs, vehicles, drivers, and transport fees.

**Access:** Admin, Institute Admin  
**Location:** `/transport`

---

### 4.1 Bus Route Management

#### Creating a Route

**Workflow:**
1. Navigate to Transport → Bus Routes
2. Click "Add Route"
3. Enter route details:
   - **Route Number** (Required): Unique route number
   - **Route Name** (Required): Route name/description
   - **Distance (KM)** (Required): Total route distance
   - **Driver Name** (Required): Driver's name
   - **Driver Number** (Required): Driver's phone number
   - **Bus Pay** (Required): Monthly bus payment
   - **Driver Pay** (Required): Monthly driver salary
   - **Vehicle Details** (Optional):
     - Vehicle number
     - Vehicle type
     - Capacity
4. Save route

**Route Format:**
```
Route No. | Route | KM | Driver Name | Driver Number | Bus Pay | Driver Pay
```

---

### 4.2 Distance Slab Management

#### Creating Distance Slab

**Workflow:**
1. Navigate to Transport → Distance Slabs
2. Click "Add Distance Slab"
3. Enter slab details:
   - **Slab Name** (Required): e.g., "0-5 KM", "5-10 KM"
   - **Min Distance** (Required): Minimum distance in KM
   - **Max Distance** (Optional): Maximum distance in KM
   - **Fee Amount** (Required): Transport fee for this slab
4. Save slab

**Purpose:**
- Calculate transport fee based on distance
- Different fees for different distance ranges
- Used during student transport assignment

---

### 4.3 Vehicle Management

#### Adding Vehicle

**Workflow:**
1. Navigate to Transport → Vehicles
2. Click "Add Vehicle"
3. Enter vehicle details:
   - **Vehicle Number** (Required): Registration number
   - **Vehicle Type** (Required): Bus, Van, etc.
   - **Capacity** (Required): Number of seats
   - **Route Assignment** (Optional): Assign to route
   - **Status** (Required): Active/Inactive
4. Save vehicle

---

### 4.4 Transport Fee Structure

#### Fee Creation per Slabs

**Workflow:**
1. Distance slabs define fee ranges
2. When assigning transport to student:
   - Select route
   - System calculates distance
   - System matches distance to slab
   - System assigns fee from slab

**Example:**
- Slab 1: 0-5 KM = ₹2,000
- Slab 2: 5-10 KM = ₹3,000
- Slab 3: 10-15 KM = ₹4,000
- Student distance: 7 KM
- Assigned fee: ₹3,000 (Slab 2)

---

### 4.5 Vehicle Expenditure

#### Recording Expenditure

**Workflow:**
1. Navigate to Transport → Expenditure
2. Click "Add Expenditure"
3. Enter:
   - **Vehicle** (Required): Select vehicle
   - **Expense Type** (Required):
     - Fuel
     - Maintenance
     - Repair
     - Insurance
     - Other
   - **Amount** (Required)
   - **Date** (Required)
   - **Description** (Optional)
   - **Voucher/Receipt** (Optional): Upload document
4. Save expenditure

**Tracking:**
- Vehicle-wise expenditure
- Type-wise breakdown
- Monthly totals
- Reports and analytics

---

### 4.6 Route Details Management

#### Complete Route Information

**Information Tracked:**
- Route number and name
- Distance in KM
- Driver name and contact
- Bus payment details
- Driver salary details
- Vehicle assignment
- Student assignments
- Expenditure tracking

**Viewing Route Details:**
- Click on route
- View complete information
- Edit route details
- View assigned students
- View expenditure

---

## 5. Audit Log

### Overview
View complete system activity log with user actions, timestamps, and details.

**Access:** Admin, Institute Admin  
**Location:** `/audit-log`

---

### 5.1 Viewing Audit Log

#### Workflow

1. **Navigate to Audit Log**
   - Click "Audit Log" in sidebar

2. **Apply Filters**
   - **User:** Filter by user
   - **Action Type:** Create, Update, Delete, View
   - **Module:** Filter by module
   - **Date Range:** From and to date
   - **Branch:** Filter by branch

3. **View Logs**
   - Logs displayed in table
   - Most recent first
   - Paginated for large datasets

4. **View Details**
   - Click on log entry
   - View complete details:
     - User name
     - Action description
     - Timestamp
     - Module
     - Branch
     - Changes made
     - Remarks/Comments

---

### 5.2 Log Information

#### Log Entry Format

**Example:**
```
Accountant Durgesh, added new admission at 9:30 AM
```

**Information Included:**
- User name
- Action performed
- Time and date
- Module
- Branch
- Details of change
- Count or amount (if applicable)

---

### 5.3 Log Categories

#### Action Types

1. **CREATE:**
   - New records created
   - New reservations
   - New admissions
   - New employees
   - etc.

2. **UPDATE:**
   - Records modified
   - Status changes
   - Field updates
   - etc.

3. **DELETE:**
   - Records deleted
   - Status changes to deleted
   - etc.

4. **VIEW:**
   - Reports generated
   - Data exported
   - etc.

---

### 5.4 Remarks/Comments

#### Adding Comments

**Workflow:**
1. View log entry
2. Click "Add Comment"
3. Enter remark/comment
4. Save comment

**Purpose:**
- Add context to actions
- Document reasons for changes
- Track approvals
- Maintain audit trail

---

### 5.5 Audit Log Reports

#### Available Reports

1. **User Activity Report**
   - Activity by user
   - Action count
   - Time spent

2. **Module Activity Report**
   - Activity by module
   - Most used modules
   - Trends

3. **Daily Activity Report**
   - Activity by day
   - Peak hours
   - Activity patterns

4. **Export Audit Log**
   - Export to Excel
   - Export to PDF
   - Custom date range

---

### 5.6 Audit Log Features

#### Key Features

- **Immutable:** Logs cannot be modified
- **Complete:** All actions logged
- **Searchable:** Search by any field
- **Filterable:** Multiple filter options
- **Exportable:** Export to Excel/PDF
- **Detailed:** Complete change history

---

## 6. Announcements (General)

### Overview
Create and manage general announcements (also available in School/College modules).

**Access:** Admin, Institute Admin, Academic, Accountant  
**Location:** General announcements or School/College announcements

---

### 6.1 Creating General Announcements

Same workflow as School/College announcements - see School guide section 9.1

**General Announcements:**
- System-wide announcements
- Not branch-specific
- Visible to all users

---

## ⚠️ Important Notes & Recommendations

### 🔄 Browser Refresh & Troubleshooting

#### When to Refresh Browser

**Mandatory Refresh Required:**
- If employee data is not updating automatically
- If payroll calculations are not reflecting
- If transport routes are not showing latest data
- If user list is not updating
- **Action:** Press `F5` or `Ctrl+R` to refresh browser

**If UI is Stuck or Issues Occur:**
- First, try refreshing the browser (`F5` or `Ctrl+R`)
- If issue persists, logout and login again
- Clear browser cache if problems continue
- **Note:** These issues occur in some minor cases, not all cases

**Best Practice:**
- Refresh browser after adding/editing employees
- Refresh before processing payroll to see latest data
- Refresh after transport route changes
- Refresh after user management changes
- Regular refresh ensures you see the latest data

---

### 💾 Data Caching & Performance

#### Cache System

**Why Caching is Used:**
- Improves system performance and speed
- Reduces server load
- Faster data loading for employees, users, routes
- Better user experience

**How It Works:**
- Employee data, user lists, transport routes are cached
- Payroll data is cached for faster calculations
- Data is automatically refreshed when needed
- Cache is cleared on logout

**Important Notes:**
- If you see outdated employee data, refresh browser
- If payroll seems incorrect, refresh to get latest data
- If transport routes seem old, refresh
- Cache updates automatically in most cases
- Manual refresh ensures latest information

---

### 💳 Payroll Processing

#### Payroll Best Practices

**Before Processing Payroll:**
1. **Refresh browser** to get latest employee data (Mandatory)
2. Ensure stable network connection
3. Verify all employee attendance is marked
4. Check leave balances are updated
5. Verify advance balances
6. Review salary calculations

**During Payroll:**
- System calculates automatically
- Review each employee's calculation
- Verify deductions are correct
- Check net salary amounts
- Ensure all employees are included

**After Processing:**
- Generate salary slips immediately
- Print or save salary slips
- Verify payment records
- Refresh to see updated records

**If Payroll Calculation Seems Wrong:**
- Refresh browser to get latest data
- Check attendance entries
- Verify leave records
- Check advance balances
- Recalculate if needed

---

### 👥 Employee Management

#### Employee Data Best Practices

**Before Adding Employee:**
- Verify Employee ID is unique (system checks automatically)
- Ensure all required fields are filled
- Check Aadhar number format (12 digits)
- Verify mobile number format (10 digits)

**After Adding Employee:**
- Refresh to see employee in list
- Verify Employee ID is assigned correctly
- Check all details are saved
- Print employee details if needed

**Employee ID Important Notes:**
- Once created, Employee ID cannot be changed
- Even if employee is deleted, ID cannot be reused
- System enforces uniqueness automatically
- Refresh to verify ID assignment

---

### 🚌 Transport Management

#### Transport Best Practices

**Before Creating Route:**
- Verify route number is unique
- Check distance is accurate
- Ensure driver details are correct
- Verify bus and driver pay amounts

**After Creating Route:**
- Refresh to see route in list
- Verify all details are saved
- Test route assignment to students
- Check distance slab mapping

**Route Management:**
- Cannot delete routes with assigned students
- Refresh before deleting to check assignments
- Update route details if needed
- Refresh after changes to verify

---

### 📊 Audit Log

#### Audit Log Best Practices

**Viewing Audit Logs:**
- Refresh to see latest activities
- Use filters to narrow down results
- Export logs for records
- Logs are real-time but refresh for latest

**Audit Log Notes:**
- Logs are immutable (cannot be changed)
- Complete history is preserved
- Refresh to see latest log entries
- Use date filters for specific periods

---

### 🌐 Network Requirements

#### Network Stability

**Critical Requirement:**
- **Stable internet connection is mandatory**
- System requires consistent network connectivity
- Unstable network will cause system issues

**What Happens with Unstable Network:**
- Employee data may not save properly
- Payroll may not process
- Transport routes may not update
- User management may fail
- System may become unresponsive

**Recommendations:**
- Use stable Wi-Fi or wired connection
- Avoid mobile data if unstable
- Check network before important operations (payroll, employee management)
- Wait for network to stabilize before retrying
- Do not process payroll during network issues

**Network Indicators:**
- Check browser connection status
- Look for loading indicators
- If connection lost, system will show error message
- Reconnect and refresh before continuing

---

### General Limitations

1. **User Management:**
   - Cannot delete users with activity
   - Email cannot be changed
   - Password reset required for security
   - Refresh to see latest user list

2. **Employee Management:**
   - Employee ID cannot be reused
   - Cannot delete employees with history
   - Salary changes create history entries
   - Refresh to see latest employee data

3. **Payroll:**
   - Cannot process payroll for closed employees
   - Leave deduction is automatic
   - Advance deduction is automatic
   - Refresh before processing to get latest data

4. **Transport:**
   - Cannot delete routes with assigned students
   - Cannot delete distance slabs in use
   - Vehicle expenditure tracked separately
   - Refresh to see latest route data

5. **Audit Log:**
   - Logs are immutable
   - Cannot be deleted
   - Complete history preserved
   - Refresh to see latest log entries

---

## 📊 Best Practices

### User Management
- Use strong passwords
- Regularly review user access
- Deactivate unused accounts
- Document role changes

### Employee Management
- Keep employee data updated
- Regular attendance marking
- Timely leave approval
- Track advances properly

### Payroll
- Calculate before processing
- Review all deductions
- Generate salary slips
- Maintain payment records

### Transport
- Keep route details updated
- Regular expenditure tracking
- Maintain vehicle records
- Update distance slabs as needed

### Audit Log
- Regular review of activities
- Monitor unusual activities
- Export logs for records
- Add comments for important actions

---

## 📞 Support

For assistance with General modules:
- **Email:** contact@smdigitalx.com
- **Phone:** +91 8184919998
- **In-System:** Use Help icons and tooltips

---

## 📝 Document Information

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Module:** General Management  
**Status:** Production Documentation

---

**Related Guides:**
- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School: `USER_GUIDE_02_SCHOOL.md`
- College: `USER_GUIDE_03_COLLEGE.md`

