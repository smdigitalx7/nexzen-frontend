# Admin Role - Complete Feature & Permission Guide

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Admin (Full System Access)  
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

**Admin Role** is the highest privilege level in the system with **Full System Access**. Admin users have complete control over all modules, configurations, and system settings.

### Primary Responsibilities

- System configuration and management
- Employee management and payroll processing
- Transport management and route configuration
- Financial oversight and approval
- User management and role assignment
- Audit log monitoring and review
- Fee locking and unlocking (exclusive privilege)
- Complete access to School and College modules

### Access Level

**Level:** Full System Access  
**Scope:** All modules, all branches, all academic years  
**Restrictions:** None (except system-level constraints)

---

## 🔐 Access Level & Permissions

### Module Access Matrix

| Module               | Access Level | Create | Read | Update | Delete | Special Permissions                |
| -------------------- | ------------ | ------ | ---- | ------ | ------ | ---------------------------------- |
| **General Modules**  |
| User Management      | Full         | ✅     | ✅   | ✅     | ✅     | Assign roles, manage permissions   |
| Employee Management  | Full         | ✅     | ✅   | ✅     | ✅     | Close employees, manage history    |
| Payroll Management   | Full         | ✅     | ✅   | ✅     | ✅     | Process payroll, approve payments  |
| Transport Management | Full         | ✅     | ✅   | ✅     | ✅     | Manage routes, vehicles, drivers   |
| Audit Log            | Full         | ❌     | ✅   | ❌     | ✅     | View all logs                      |
| **School Modules**   |
| Reservations         | Full         | ✅     | ✅   | ✅     | ✅     | Override validations               |
| Admissions           | Full         | ✅     | ✅   | ✅     | ✅     | Unlock fees, override restrictions |
| Students             | Full         | ✅     | ✅   | ✅     | ✅     | All student operations             |
| Academic             | Full         | ✅     | ✅   | ✅     | ✅     | Manage all academic settings       |
| Attendance           | Full         | ✅     | ✅   | ✅     | ✅     | Edit locked attendance             |
| Marks                | Full         | ✅     | ✅   | ✅     | ✅     | Edit locked marks                  |
| Fees                 | Full         | ✅     | ✅   | ✅     | ✅     | Unlock fees, override validations  |
| Financial Reports    | Full         | ✅     | ✅   | ✅     | ✅     | All reports, export                |
| Announcements        | Full         | ✅     | ✅   | ✅     | ✅     | All announcement types             |
| **College Modules**  |
| All College Modules  | Full         | ✅     | ✅   | ✅     | ✅     | Same as School modules             |

---

## ✨ Available Features

### 1. General Module Features

#### 1.1 User Management

**Features:**

- Create new users with any role
- Edit user details (name, email, phone)
- Assign roles (Admin, Institute Admin, Accountant, Academic)
- Assign branches to users
- Activate/Deactivate users
- Delete users (with validation)
- View user activity history
- Reset user passwords
- Manage user permissions

**Access:** Full CRUD access

---

#### 1.2 Employee Management

**Features:**

- Add new employees
- Edit employee details
- Manage employee attendance
- Manage employee leaves
- Manage employee advances
- Close employees (terminate)
- View complete employee history
- Generate employee reports
- Export employee data

**Access:** Full CRUD access

**Special Privileges:**

- Can close employees
- Can view closed employee history
- Can manage all employee records

---

#### 1.3 Payroll Management

**Features:**

- Process payroll for all employees
- Calculate salaries automatically
- Apply leave deductions
- Apply advance deductions
- Generate salary slips
- Approve payroll payments
- View payroll history
- Export payroll reports
- Recalculate payroll

**Access:** Full CRUD access

**Special Privileges:**

- Can process payroll for any employee
- Can approve payroll payments
- Can override calculations (if needed)

---

#### 1.4 Transport Management

**Features:**

- Create and manage bus routes
- Create distance slabs
- Assign drivers to routes
- Manage vehicles
- Track vehicle expenditure
- Set route fees
- Manage driver payments
- View transport reports
- Export transport data

**Access:** Full CRUD access

---

#### 1.5 Audit Log

**Features:**

- View all system activities
- Filter by user, action, date
- View detailed activity logs
- Add comments to logs
- Export audit logs
- Search audit history
- View user activity timeline

**Access:** Read-only (cannot create/update/delete logs)

**Special Privileges:**

- Can view all logs (not role-restricted)
- Can add comments to any log entry

---

### 2. School Module Features

#### 2.1 Reservations

**Features:**

- Create new reservations
- View all reservations
- Edit reservations (all fields)
- Delete reservations (with validation)
- Convert reservations to admissions
- Print reservation forms
- Search and filter reservations
- Export reservation reports
- Override validations (if needed)

**Access:** Full CRUD access

---

#### 2.2 Admissions

**Features:**

- Create new admissions
- View all admissions
- Convert reservations to admissions
- Edit admission details
- Lock/unlock fees (exclusive privilege)
- Override fee validations
- Print admission forms
- Search and filter admissions
- Export admission reports

**Access:** Full CRUD access

**Special Privileges:**

- **Only Admin can unlock fees** (once locked, cannot be unlocked by others)
- Can override fee validations
- Can edit locked fees

---

#### 2.3 Students

**Features:**

- View all students
- Edit student details
- Manage student enrollments
- Assign sections (if needed)
- Change student sections
- Manage transport assignments
- View student profiles
- View student history
- Export student data

**Access:** Full CRUD access

---

#### 2.4 Academic Management

**Features:**

- Manage academic years
- Create/edit/delete classes
- Create/edit/delete subjects
- Create/edit/delete sections
- Create/edit/delete exams
- Create/edit/delete tests
- Assign teachers to subjects
- Manage teacher assignments
- View academic structure

**Access:** Full CRUD access

---

#### 2.5 Attendance

**Features:**

- Create attendance entries
- View all attendance records
- Edit attendance (even if locked)
- Delete attendance records
- View attendance reports
- Export attendance data
- Override attendance locks

**Access:** Full CRUD access

**Special Privileges:**

- Can edit locked attendance (Academic role cannot)
- Can delete attendance records

---

#### 2.6 Marks

**Features:**

- Create marks entries
- View all marks
- Edit marks (even if locked)
- Delete marks records
- View marks reports
- Export marks data
- Override marks locks

**Access:** Full CRUD access

**Special Privileges:**

- Can edit locked marks (Academic role cannot)
- Can delete marks records

---

#### 2.7 Fees

**Features:**

- Collect fees
- View all fee transactions
- View fee balances
- Unlock fees (exclusive privilege)
- Override fee validations
- Generate receipts
- Regenerate receipts
- View payment history
- Export fee reports

**Access:** Full CRUD access

**Special Privileges:**

- **Only Admin can unlock fees**
- Can override fee payment validations
- Can edit fee transactions (if needed)

---

#### 2.8 Financial Reports

**Features:**

- View all financial reports
- Generate custom reports
- Export reports to Excel
- View income reports
- View expenditure reports
- View fee collection reports
- View outstanding fee reports
- Generate dashboard analytics

**Access:** Full read access, can generate and export

---

#### 2.9 Announcements

**Features:**

- Create announcements
- View all announcements
- Edit announcements
- Delete announcements
- Publish announcements
- Target specific audiences
- View announcement history

**Access:** Full CRUD access

---

### 3. College Module Features

**All College module features are identical to School modules, with additional:**

- Group management (MPC, BiPC, etc.)
- Course management (IPE, Mains, EAPCET)
- Group/Course-based filtering
- Group/Course-specific reports

**Access:** Full CRUD access to all College modules

---

## 🔒 CRUD Operations & Access Controls

### Create Operations

**Allowed:**

- ✅ Create users, employees, routes, reservations, admissions, students
- ✅ Create academic structure (classes, subjects, sections, exams)
- ✅ Create attendance and marks entries
- ✅ Create fee transactions
- ✅ Create announcements
- ✅ Create payroll records
- ✅ Create transport routes and distance slabs

**Restrictions:**

- ❌ Cannot create audit logs (system-generated only)
- ❌ Cannot create duplicate Employee IDs
- ❌ Cannot create duplicate reservation/admission numbers

---

### Read Operations

**Allowed:**

- ✅ Read all data in all modules
- ✅ Read all user data
- ✅ Read all employee data
- ✅ Read all student data
- ✅ Read all financial data
- ✅ Read all academic data
- ✅ Read all audit logs
- ✅ Read all reports

**Restrictions:**

- ❌ None (full read access)

---

### Update Operations

**Allowed:**

- ✅ Update all user data
- ✅ Update all employee data
- ✅ Update all student data
- ✅ Update all academic settings
- ✅ Update attendance (even if locked)
- ✅ Update marks (even if locked)
- ✅ Update fees (unlock if locked)
- ✅ Update transport routes
- ✅ Update payroll calculations

**Restrictions:**

- ❌ Cannot update audit logs (immutable)
- ❌ Cannot update auto-generated IDs (Employee ID, Admission Number)
- ❌ Cannot update payment history (immutable)
- ❌ Cannot update locked fees (must unlock first, then update)

**Special Privileges:**

- ✅ **Only Admin can unlock fees** (exclusive privilege)
- ✅ Can update locked attendance/marks
- ✅ Can override validations

---

### Delete Operations

**Allowed:**

- ✅ Delete users (with validation)
- ✅ Delete employees (if no dependencies)
- ✅ Delete reservations (if not converted)
- ✅ Delete admissions (with validation)
- ✅ Delete academic settings (if no dependencies)
- ✅ Delete attendance records
- ✅ Delete marks records
- ✅ Delete announcements
- ✅ Delete transport routes (if no students assigned)

**Restrictions:**

- ❌ Cannot delete users with activity history
- ❌ Cannot delete employees with payroll history
- ❌ Cannot delete classes with students
- ❌ Cannot delete subjects with marks
- ❌ Cannot delete routes with assigned students
- ❌ Cannot delete audit logs
- ❌ Cannot delete payment transactions
- ❌ Cannot delete fee structures in use

---

## ✅ Validations & Business Rules

### User Management Validations

1. **Email Validation:**
   - Must be unique across system
   - Must be valid email format
   - Cannot be changed after creation

2. **Role Assignment:**
   - Must assign valid role
   - Cannot assign Admin role to non-admin users (system restriction)
   - Must assign at least one branch

3. **User Deletion:**
   - Cannot delete if user has activity
   - Cannot delete last Admin user
   - Must transfer data before deletion

---

### Employee Management Validations

1. **Employee ID:**
   - Must be unique
   - Cannot be reused (even if employee deleted)
   - Auto-generated or manual entry

2. **Employee Closure:**
   - Can close employee at any time
   - Closed employees cannot be processed in payroll
   - History is preserved

3. **Salary Updates:**
   - Creates history entry
   - Cannot delete salary history
   - Previous payrolls remain unchanged

---

### Payroll Validations

1. **Payroll Processing:**
   - Cannot process for closed employees
   - Must have attendance data
   - Leave deduction is automatic
   - Advance deduction is automatic

2. **Leave Deduction Formula:**
   - Monthly 1 leave allocated
   - Additional leaves: Salary/30 per day
   - Example: ₹30,000/30 = ₹1,000 per day

3. **Payroll Approval:**
   - Admin must approve before payment
   - Cannot edit after approval (without override)

---

### Fee Management Validations

1. **Fee Locking:**
   - Only Admin can lock fees
   - Once locked, cannot be unlocked (system restriction)
   - Locked fees cannot be changed by Accountant

2. **Fee Payment Validations:**
   - Books fee must be paid first
   - Term payment sequence: 40%, 30%, 30%
   - Transport fees before Term 3
   - Admin can override these validations

3. **Payment Amount:**
   - Cannot exceed outstanding amount
   - Cannot be negative
   - Must be valid payment mode

---

### Academic Validations

1. **Class Management:**
   - Cannot delete class with students
   - Cannot delete class with subjects
   - Must deactivate instead

2. **Section Management:**
   - Section name must be unique within class
   - Cannot exceed class capacity (if set)

3. **Exam/Test Management:**
   - Exam dates must be within academic year
   - End date must be after start date
   - Cannot delete exam with marks

---

## 🚫 Restrictions & Limitations

### System-Level Restrictions

1. **Cannot Override:**
   - Audit log immutability
   - Payment transaction immutability
   - Auto-generated ID uniqueness
   - System-level validations

2. **Cannot Delete:**
   - Records with dependencies
   - Historical data
   - Audit logs
   - Payment transactions

3. **Cannot Change:**
   - Employee ID (once created)
   - Admission number (once generated)
   - Reservation number (once generated)
   - Payment history

---

### Business Rule Restrictions

1. **Fee Locking:**
   - Once locked, cannot be unlocked (by design)
   - Must be careful when locking fees
   - Locked fees cannot be changed by Accountant

2. **Employee Management:**
   - Cannot reuse Employee ID
   - Cannot delete employees with history
   - Must close instead of delete

3. **Academic Structure:**
   - Cannot delete classes/subjects with dependencies
   - Must deactivate instead
   - Historical data preserved

---

### Data Integrity Restrictions

1. **Referential Integrity:**
   - Cannot delete parent records with children
   - Must delete children first (or cascade)
   - System enforces relationships

2. **Historical Data:**
   - All historical data is preserved
   - Cannot modify past records
   - Audit trail is complete

---

## 📋 Acceptance Criteria

### User Management

**AC1:** Admin can create user with any role

- ✅ Can select role from dropdown
- ✅ Can assign branches
- ✅ User is created successfully
- ✅ User can login with assigned role

**AC2:** Admin can edit user details

- ✅ Can update name, email, phone
- ✅ Cannot change email (system restriction)
- ✅ Changes are saved

**AC3:** Admin can delete user

- ✅ Cannot delete if user has activity
- ✅ Cannot delete last Admin
- ✅ User is deleted successfully

---

### Employee Management

**AC1:** Admin can add employee

- ✅ Employee ID is unique
- ✅ All required fields validated
- ✅ Employee is created successfully

**AC2:** Admin can close employee

- ✅ Employee status changes to closed
- ✅ Cannot process in payroll
- ✅ History is preserved

**AC3:** Admin can manage employee attendance

- ✅ Can mark attendance
- ✅ Can edit attendance
- ✅ Attendance is saved

---

### Payroll Management

**AC1:** Admin can process payroll

- ✅ All employees included (except closed)
- ✅ Leave deduction calculated correctly
- ✅ Advance deduction calculated correctly
- ✅ Net salary calculated correctly

**AC2:** Admin can approve payroll

- ✅ Payroll is approved
- ✅ Salary slips generated
- ✅ Cannot edit after approval

---

### Fee Management

**AC1:** Admin can unlock fees

- ✅ Only Admin can unlock (exclusive)
- ✅ Fee is unlocked successfully
- ✅ Accountant can now edit

**AC2:** Admin can override fee validations

- ✅ Can bypass books fee validation
- ✅ Can bypass term sequence validation
- ✅ Override is logged in audit

---

### Academic Management

**AC1:** Admin can manage academic structure

- ✅ Can create classes, subjects, sections
- ✅ Can edit academic settings
- ✅ Cannot delete with dependencies

**AC2:** Admin can edit locked attendance/marks

- ✅ Can edit even if locked by Academic
- ✅ Changes are saved
- ✅ Audit log updated

---

## 💡 Best Practices

### Security Best Practices

1. **User Management:**
   - Assign roles carefully
   - Review user permissions regularly
   - Deactivate unused accounts
   - Monitor audit logs

2. **Fee Locking:**
   - Lock fees only when necessary
   - Verify amounts before locking
   - Document reason for locking
   - Remember: Cannot unlock once locked

3. **Data Management:**
   - Review before deleting
   - Check dependencies
   - Backup important data
   - Use deactivate instead of delete

---

### Operational Best Practices

1. **Payroll Processing:**
   - Refresh browser before processing
   - Verify all attendance marked
   - Review calculations
   - Approve only after verification

2. **Fee Management:**
   - Review fee structure before locking
   - Verify concession amounts
   - Document fee changes
   - Monitor fee collections

3. **System Maintenance:**
   - Regular audit log review
   - Monitor system performance
   - Review user activities
   - Maintain data integrity

---

### Data Integrity Best Practices

1. **Before Deleting:**
   - Check for dependencies
   - Verify no active records
   - Review impact
   - Use deactivate if possible

2. **Before Locking Fees:**
   - Verify amounts
   - Check concession approval
   - Document reason
   - Inform Accountant

3. **Before Processing Payroll:**
   - Verify attendance data
   - Check leave balances
   - Review advance balances
   - Calculate correctly

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Cannot Unlock Fees:**
   - This is by design (system restriction)
   - Fees cannot be unlocked once locked
   - Contact system administrator if error

2. **Cannot Delete Record:**
   - Check for dependencies
   - Review error message
   - Use deactivate instead

3. **Payroll Calculation Wrong:**
   - Refresh browser
   - Check attendance data
   - Verify leave balances
   - Recalculate

---

## 📝 Document Information

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Role:** Admin  
**Status:** Production Documentation

### Permission System

All permissions are centrally configured in `client/src/lib/permissions/config.ts`. This ensures:

- Consistent permission enforcement across the application
- Easy maintenance and updates
- Type-safe permission checks
- Dynamic UI filtering based on user roles

**Key Features:**

- Role-based access control (RBAC)
- UI component visibility control (tabs, buttons, sections)
- Action-level permissions (create, edit, delete, view, export)
- Granular button-level restrictions

---

**Related Documents:**

- Overview: `USER_GUIDE_01_OVERVIEW.md`
- School Guide: `USER_GUIDE_02_SCHOOL.md`
- College Guide: `USER_GUIDE_03_COLLEGE.md`
- General Guide: `USER_GUIDE_04_GENERAL.md`
