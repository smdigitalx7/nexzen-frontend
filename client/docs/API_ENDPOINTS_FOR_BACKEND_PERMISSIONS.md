# API Endpoints Requiring Backend Permission Updates

This document lists all API endpoints that need backend permission configuration for ACCOUNTANT and ACADEMIC roles.

## 🔴 CRITICAL: All these endpoints are returning 403 Forbidden

---

## 1. Dashboard Endpoints

### `/api/v1/dashboard`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: Should have access (financial dashboard)
  - ACADEMIC: Should have access (academic dashboard)
- **Service**: `DashboardService.getDashboard()`
- **Used in**: Main dashboard page

---

## 2. Branch Endpoints

### `/api/v1/branches`
- **Current Access**: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT (according to service comments)
- **Status**: ✅ Should work (but verify backend)
- **Service**: `BranchesService.list()`

### `/api/v1/branches?month={month}&year={year}`
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (if needed for filtering)
- **Service**: Used in various branch queries

### `/api/v1/branches?pageSize={size}&page={page}`
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (if needed for pagination)
- **Service**: Used in paginated branch queries

---

## 3. Employee Endpoints

### `/api/v1/employees/dashboard`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ✅ Should have VIEW access
- **Service**: `EmployeesService.getDashboard()`
- **Used in**: Employee management dashboard stats

### `/api/v1/employees/branch`
- **Current Access**: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT (according to service comments)
- **Status**: ✅ Should work (but verify backend)
- **Service**: `EmployeesService.listByBranch()`
- **Used in**: Employee list by branch

### `/api/v1/employees/recent?limit={limit}`
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (for viewing recent employees)
- **Service**: `EmployeesService.getRecent()`

### `/api/v1/employees/{id}`
- **Current Access**: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT (according to service comments)
- **Status**: ✅ Should work (but verify backend)
- **Service**: `EmployeesService.getById()`
- **Used in**: View employee details

### `/api/v1/employees` (POST - Create)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeesService.create()`

### `/api/v1/employees/{id}` (PUT - Update)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeesService.update()`

### `/api/v1/employees/{id}` (DELETE)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeesService.remove()`

### `/api/v1/employees/{id}/status` (PATCH - Update Status)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeesService.updateStatus()`

---

## 4. Employee Leave Endpoints

### `/api/v1/employee-leave/dashboard`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ✅ Should have VIEW access
- **Service**: `EmployeeLeaveService.getDashboard()`
- **Used in**: Leave dashboard stats

### `/api/v1/employee-leave/branch?month={month}&year={year}&pageSize={size}&page={page}`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ✅ Should have VIEW access
- **Service**: `EmployeeLeaveService.listByBranch()`
- **Used in**: Leave list by branch with filters

### `/api/v1/employee-leave` (GET - List All)
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (for viewing leaves)
- **Service**: `EmployeeLeaveService.listAll()`

### `/api/v1/employee-leave/{id}` (GET)
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (for viewing leave details)
- **Service**: `EmployeeLeaveService.getById()`

### `/api/v1/employee-leave` (POST - Create)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access (only edit existing)
- **Service**: `EmployeeLeaveService.create()`

### `/api/v1/employee-leave/{id}` (PUT - Update)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have EDIT access
  - ACADEMIC: ✅ Should have EDIT access
- **Service**: `EmployeeLeaveService.update()`

### `/api/v1/employee-leave/{id}/approve` (PUT)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeeLeaveService.approve()`

### `/api/v1/employee-leave/{id}/reject` (PUT)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeeLeaveService.reject()`

### `/api/v1/employee-leave/{id}` (DELETE)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `EmployeeLeaveService.delete()`

### `/api/v1/employee-leave/recent?limit={limit}`
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT, ACADEMIC (for viewing recent leaves)
- **Service**: `EmployeeLeaveService.getRecent()`

---

## 5. Employee Advance Endpoints

### `/api/v1/advances/dashboard`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ❌ Should NOT have access
- **Service**: `AdvancesService.getDashboard()`
- **Used in**: Advance dashboard stats

### `/api/v1/advances/branch?pageSize={size}&page={page}&month={month}&year={year}`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ❌ Should NOT have access
- **Service**: `AdvancesService.listByBranch()`
- **Used in**: Advance list by branch

### `/api/v1/advances` (GET - List All)
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT (for viewing advances)
- **Service**: `AdvancesService.listAll()`

### `/api/v1/advances/{id}` (GET)
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT (for viewing advance details)
- **Service**: `AdvancesService.getById()`

### `/api/v1/advances` (POST - Create)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have CREATE access
  - ACADEMIC: ❌ Should NOT have access
- **Service**: `AdvancesService.create()`

### `/api/v1/advances/{id}` (PUT - Update)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT, ACADEMIC should NOT have access
- **Service**: `AdvancesService.update()`

### `/api/v1/advances/{id}/status` (PUT - Change Status)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT should NOT have access
- **Service**: `AdvancesService.updateStatus()`

### `/api/v1/advances/{id}/amount-paid` (PUT - Update Amount Paid)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT should NOT have access
- **Service**: `AdvancesService.updateAmountPaid()`

### `/api/v1/advances/{id}` (DELETE)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACCOUNTANT should NOT have access
- **Service**: `AdvancesService.delete()`

### `/api/v1/advances/recent?limit={limit}`
- **Current Access**: Unknown
- **Required Access**: ACCOUNTANT (for viewing recent advances)
- **Service**: `AdvancesService.getRecent()`

---

## 6. Employee Attendance Endpoints

### `/api/v1/employee-attendances/dashboard`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ❌ Should NOT have access (not in requirements)
  - ACADEMIC: ✅ Should have VIEW access
- **Service**: `EmployeeAttendanceService.getDashboard()`
- **Used in**: Attendance dashboard stats

### `/api/v1/employee-attendances/branch?month={month}&year={year}`
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ❌ Should NOT have access (not in requirements)
  - ACADEMIC: ✅ Should have VIEW access
- **Service**: `EmployeeAttendanceService.listByBranch()`
- **Used in**: Attendance list by branch

### `/api/v1/employee-attendances/` (GET - List All)
- **Current Access**: Unknown
- **Required Access**: ACADEMIC (for viewing attendance)
- **Service**: `EmployeeAttendanceService.listAll()`

### `/api/v1/employee-attendances/{id}` (GET)
- **Current Access**: Unknown
- **Required Access**: ACADEMIC (for viewing attendance details)
- **Service**: `EmployeeAttendanceService.getById()`

### `/api/v1/employee-attendances/individual` (POST - Create)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ❌ Should NOT have access
  - ACADEMIC: ✅ Should have CREATE access
- **Service**: `EmployeeAttendanceService.create()`

### `/api/v1/employee-attendances/bulk` (POST - Bulk Create)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ❌ Should NOT have access
  - ACADEMIC: ✅ Should have CREATE access
- **Service**: `EmployeeAttendanceService.createBulk()`

### `/api/v1/employee-attendances/{id}` (PUT - Update)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACADEMIC should NOT have access (only view and create)
- **Service**: `EmployeeAttendanceService.update()`

### `/api/v1/employee-attendances/{id}` (DELETE)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: ❌ ACADEMIC should NOT have access (only view and create)
- **Service**: `EmployeeAttendanceService.delete()`

---

## 7. Transport Endpoints

### `/api/v1/transport/*` (All endpoints)
- **Current Access**: ADMIN, INSTITUTE_ADMIN
- **Required Access**: 
  - ACCOUNTANT: ✅ Should have VIEW access
  - ACADEMIC: ❌ Should NOT have access
- **Service**: `TransportService` (various methods)
- **Note**: Check all transport-related endpoints

---

## Summary by Role

### ACCOUNTANT Role - Required Backend Permissions:

**VIEW Access:**
- ✅ `/api/v1/dashboard`
- ✅ `/api/v1/branches`
- ✅ `/api/v1/employees/dashboard`
- ✅ `/api/v1/employees/branch`
- ✅ `/api/v1/employees/recent`
- ✅ `/api/v1/employees/{id}`
- ✅ `/api/v1/employee-leave/dashboard`
- ✅ `/api/v1/employee-leave/branch`
- ✅ `/api/v1/employee-leave/{id}`
- ✅ `/api/v1/advances/dashboard`
- ✅ `/api/v1/advances/branch`
- ✅ `/api/v1/advances/{id}`
- ✅ `/api/v1/advances/recent`
- ✅ `/api/v1/transport/*` (all GET endpoints)

**EDIT Access:**
- ✅ `/api/v1/employee-leave/{id}` (PUT - Update leave)

**CREATE Access:**
- ✅ `/api/v1/advances` (POST - Create advance)

**NO Access (Should return 403):**
- ❌ `/api/v1/employees` (POST, PUT, DELETE, PATCH status)
- ❌ `/api/v1/employee-leave` (POST - Create, PUT approve/reject, DELETE)
- ❌ `/api/v1/advances/{id}` (PUT - Update, PUT status, PUT amount-paid, DELETE)
- ❌ `/api/v1/employee-attendances/*` (all endpoints)

---

### ACADEMIC Role - Required Backend Permissions:

**VIEW Access:**
- ✅ `/api/v1/dashboard`
- ✅ `/api/v1/branches`
- ✅ `/api/v1/employees/dashboard`
- ✅ `/api/v1/employees/branch`
- ✅ `/api/v1/employees/recent`
- ✅ `/api/v1/employees/{id}`
- ✅ `/api/v1/employee-leave/dashboard`
- ✅ `/api/v1/employee-leave/branch`
- ✅ `/api/v1/employee-leave/{id}`
- ✅ `/api/v1/employee-attendances/dashboard`
- ✅ `/api/v1/employee-attendances/branch`
- ✅ `/api/v1/employee-attendances/{id}`

**EDIT Access:**
- ✅ `/api/v1/employee-leave/{id}` (PUT - Update leave)

**CREATE Access:**
- ✅ `/api/v1/employee-attendances/individual` (POST)
- ✅ `/api/v1/employee-attendances/bulk` (POST)

**NO Access (Should return 403):**
- ❌ `/api/v1/employees` (POST, PUT, DELETE, PATCH status)
- ❌ `/api/v1/employee-leave` (POST - Create, PUT approve/reject, DELETE)
- ❌ `/api/v1/advances/*` (all endpoints)
- ❌ `/api/v1/employee-attendances/{id}` (PUT - Update, DELETE)
- ❌ `/api/v1/transport/*` (all endpoints)

---

## Quick Reference - Endpoints Returning 403

Based on the network log showing 403 errors, these endpoints need immediate backend permission updates:

1. **Dashboard**: `/api/v1/dashboard`
2. **Branch queries**: `/api/v1/branches?month=11&year=2025&pageSize=20&page=1`
3. **Employee dashboard**: `/api/v1/employees/dashboard`
4. **Employee branch list**: `/api/v1/employees/branch`
5. **Leave dashboard**: `/api/v1/employee-leave/dashboard`
6. **Leave branch list**: `/api/v1/employee-leave/branch?month=11&year=2025&pageSize=10&page=1`
7. **Advance dashboard**: `/api/v1/advances/dashboard`
8. **Advance branch list**: `/api/v1/advances/branch?pageSize=10&page=1`
9. **Attendance dashboard**: `/api/v1/employee-attendances/dashboard`
10. **Attendance branch list**: `/api/v1/employee-attendances/branch?month=11&year=2025`

---

## Notes for Backend Team

1. All dashboard endpoints should be accessible to ACCOUNTANT and ACADEMIC based on their role-specific dashboards
2. All `/branch` endpoints with query parameters should allow VIEW access for appropriate roles
3. The frontend is already configured to hide buttons/actions based on permissions, but backend must also enforce these permissions
4. 403 errors are blocking the UI from loading data, causing the "You do not have access to this module" messages

