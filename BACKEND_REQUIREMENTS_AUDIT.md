# Backend Requirements - Comprehensive Audit & Analysis

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Purpose:** Deep audit of backend API requirements including pagination, filtering, response formats, and minor implementation details

---

## Table of Contents

1. [API Base Structure](#api-base-structure)
2. [Pagination Requirements](#pagination-requirements)
3. [Missing Pagination - Endpoints Audit](#missing-pagination---endpoints-audit)
4. [Filtering & Query Parameters](#filtering--query-parameters)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Types & Formats](#data-types--formats)
9. [Common Patterns](#common-patterns)
10. [Endpoint-Specific Requirements](#endpoint-specific-requirements)
11. [Performance Considerations](#performance-considerations)

---

## API Base Structure

### Base URL

- **Base Prefix:** `/api/v1`
- **All endpoints** must be prefixed with `/api/v1`
- **Health endpoints:** `/api/v1/health/live` and `/api/v1/health/ready`

### HTTP Methods

- **GET:** Retrieve data (list, detail, dashboard)
- **POST:** Create new resources
- **PUT:** Update existing resources (full update)
- **PATCH:** Partial updates (e.g., status updates)
- **DELETE:** Delete resources

### Request Headers

```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

### CSRF Protection

- **Headers to support:**
  - `X-CSRF-Token`
  - `X-XSRF-TOKEN`
- **Note:** Frontend sends these headers when available, backend should verify

---

## Pagination Requirements

### Query Parameters

**Standard Pagination Parameters:**

- `page` (integer, default: 1) - Current page number (1-indexed)
- `page_size` or `pageSize` (integer, default: 10) - Number of items per page
  - **Note:** Frontend uses both `page_size` (snake_case) and `pageSize` (camelCase)
  - **Recommendation:** Support both formats for backward compatibility
  - **Common values:** 10, 20, 50, 100

**Example Requests:**

```
GET /api/v1/advances?page=1&pageSize=10
GET /api/v1/employees/branch?page=2&page_size=20
GET /api/v1/school/reservations?page=1&page_size=50
```

### Paginated Response Format

**Required Response Structure:**

```json
{
  "data": [...],           // Array of items
  "total": 150,            // Total number of items (across all pages)
  "total_count": 150,     // Alternative field name (also used)
  "pages": 15,             // Total number of pages
  "total_pages": 15,       // Alternative field name (also used)
  "current_page": 1,       // Current page number
  "page": 1,               // Alternative field name
  "pageSize": 10,          // Items per page (optional, for confirmation)
  "page_size": 10          // Alternative field name
}
```

**Alternative Response Format (used in some endpoints):**

```json
{
  "items": [...],          // Array of items
  "pagination": {
    "total": 150,
    "pages": 15,
    "current_page": 1,
    "page_size": 10
  }
}
```

**Frontend Expectation:**

- Frontend checks for both `total_pages` and `pages`
- Frontend checks for both `total_count` and `total`
- **Recommendation:** Use consistent field names across all endpoints

### Pagination Best Practices

1. **Default Values:**
   - `page`: Default to 1 if not provided
   - `page_size`: Default to 10-20 if not provided
   - **Maximum:** Enforce reasonable maximum (e.g., 100 items per page)

2. **Validation:**
   - `page` must be >= 1
   - `page_size` must be > 0 and <= maximum allowed
   - Return 400 Bad Request for invalid values

3. **Edge Cases:**
   - If `page` exceeds total pages, return empty array with correct pagination metadata
   - If no results, return empty array with `total: 0`, `pages: 0`

4. **Performance:**
   - Always use database-level pagination (LIMIT/OFFSET or cursor-based)
   - Never fetch all records and paginate in application code
   - Consider using cursor-based pagination for large datasets

---

## Missing Pagination - Endpoints Audit

### 🔴 Critical: Endpoints Missing Pagination

The following endpoints currently return arrays without pagination support. These endpoints **MUST** be updated to support pagination to prevent performance issues and UI freezes with large datasets.

#### 1. User Management Endpoints

**Endpoint:** `GET /api/v1/users`

- **Current:** Returns `UserRead[]` (all users)
- **Issue:** Can return hundreds/thousands of users
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response with `total`, `pages`, `current_page`

**Endpoint:** `GET /api/v1/users/roles-and-branches`

- **Current:** Returns `UserWithRolesAndBranches[]` (all users with details)
- **Issue:** Can return large datasets with nested data
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response

#### 2. Branch Management Endpoints

**Endpoint:** `GET /api/v1/branches`

- **Current:** Returns `BranchRead[]` (all branches)
- **Issue:** May grow large over time
- **Priority:** Medium (typically small dataset, but should support pagination for consistency)
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response

#### 3. User Branch Access Endpoints

**Endpoint:** `GET /api/v1/user-branch-accesses`

- **Current:** Returns `UserBranchAccessRead[]` (all accesses)
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response
- **Optional Filters:** `?user_id={id}`, `?branch_id={id}`, `?role_id={id}`

#### 4. Employee Management Endpoints

**Endpoint:** `GET /api/v1/employees`

- **Current:** Returns `EmployeeRead[]` (all employees by institute)
- **Issue:** Can return hundreds/thousands of employees
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response
- **Optional Filters:** `?status={status}`, `?search={term}`

**Endpoint:** `GET /api/v1/employees/branch`

- **Current:** Returns `EmployeeRead[]` (employees by branch)
- **Issue:** May not have pagination
- **Status:** Verify if pagination exists
- **Required:** Ensure pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/branch-employees`

- **Current:** Returns list of branch employees
- **Issue:** May not have pagination
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

#### 5. Employee Attendance Endpoints

**Endpoint:** `GET /api/v1/employee-attendances`

- **Current:** Returns `AttendanceListResponse` (may have pagination)
- **Status:** Verify pagination implementation
- **Required:** Ensure pagination is properly implemented
- **Expected Parameters:** `?page=1&page_size=20&month={month}&year={year}`

**Endpoint:** `GET /api/v1/employee-attendances/branch`

- **Current:** Returns `AttendanceListResponse` (may have pagination)
- **Status:** Verify pagination implementation
- **Required:** Ensure pagination is properly implemented
- **Expected Parameters:** `?page=1&page_size=20&month={month}&year={year}`

#### 6. Payroll Endpoints

**Endpoint:** `GET /api/v1/payrolls`

- **Current:** Returns grouped payroll data
- **Status:** Verify pagination implementation
- **Required:** Ensure pagination support
- **Expected Parameters:** `?page=1&page_size=20&month={month}&year={year}&status={status}`

**Endpoint:** `GET /api/v1/payrolls/branch`

- **Current:** Returns grouped payroll data
- **Status:** Verify pagination implementation
- **Required:** Ensure pagination support
- **Expected Parameters:** `?page=1&page_size=20&month={month}&year={year}&status={status}`

**Endpoint:** `GET /api/v1/payrolls/employee/{employee_id}/payrolls`

- **Current:** Returns `PayrollListResponse`
- **Status:** Verify pagination implementation
- **Required:** Ensure pagination support
- **Expected Parameters:** `?page=1&page_size=20`

#### 7. Transport Endpoints

**Endpoint:** `GET /api/v1/bus-routes`

- **Current:** Returns list of all bus routes
- **Issue:** May grow large over time
- **Priority:** Medium
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response

**Endpoint:** `GET /api/v1/distance-slabs`

- **Current:** Returns list of distance slabs
- **Issue:** Typically small, but should support pagination for consistency
- **Priority:** Low
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

#### 8. Announcements Endpoints

**Endpoint:** `GET /api/v1/announcements`

- **Current:** Returns `Announcement[]` (all announcements)
- **Issue:** Can grow large over time
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Expected Response:** Paginated response
- **Optional Filters:** `?branch_id={id}`, `?branch_type={type}`, `?announcement_type={type}`, `?class_id={id}`

#### 9. Logs Endpoints

**Endpoint:** `GET /api/v1/logs`

- **Current:** Returns list of log files
- **Status:** May have pagination, verify
- **Priority:** Medium

**Endpoint:** `GET /api/v1/logs/{category}`

- **Current:** Returns logs from category
- **Issue:** Logs can be extremely large
- **Priority:** 🔴 **CRITICAL** - Logs must have pagination
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=50&lines={lines}`
- **Expected Response:** Paginated response

**Endpoint:** `GET /api/v1/logs/search/global`

- **Current:** Returns search results
- **Issue:** Search results can be large
- **Priority:** High
- **Required:** Add pagination support
- **Expected Parameters:** `?query={term}&page=1&page_size=20&lines_per_file={lines}`

#### 10. Roles & Academic Years Endpoints

**Endpoint:** `GET /api/v1/roles`

- **Current:** Returns list of all roles
- **Issue:** Typically small dataset (5-20 roles)
- **Priority:** Low (but should support pagination for consistency)
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/academic-years`

- **Current:** Returns list of academic years
- **Issue:** Typically small dataset (5-10 years)
- **Priority:** Low (but should support pagination for consistency)
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

#### 11. School Module Endpoints

**Endpoint:** `GET /api/v1/school/classes`

- **Current:** Returns list of classes
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/school/subjects`

- **Current:** Returns list of subjects
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/school/students`

- **Current:** Returns list of students
- **Issue:** Can return hundreds/thousands of students
- **Priority:** 🔴 **CRITICAL**
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?section_id={id}`, `?search={term}`

**Endpoint:** `GET /api/v1/school/enrollments`

- **Current:** Returns list of enrollments
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?academic_year_id={id}`, `?status={status}`

**Endpoint:** `GET /api/v1/school/exams`

- **Current:** Returns list of exams
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?academic_year_id={id}`

**Endpoint:** `GET /api/v1/school/tests`

- **Current:** Returns list of tests
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?subject_id={id}`

**Endpoint:** `GET /api/v1/school/exam-marks`

- **Current:** Returns exam marks
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?exam_id={id}`, `?class_id={id}`, `?section_id={id}`

**Endpoint:** `GET /api/v1/school/student-attendance`

- **Current:** Returns attendance records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?date={date}`, `?month={month}&year={year}`

**Endpoint:** `GET /api/v1/school/student-marks`

- **Current:** Returns student marks
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?test_id={id}`, `?class_id={id}`, `?student_id={id}`

**Endpoint:** `GET /api/v1/school/income`

- **Current:** Returns income records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?start_date={date}&end_date={date}`, `?category={category}`

**Endpoint:** `GET /api/v1/school/expenditure`

- **Current:** Returns expenditure records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?start_date={date}&end_date={date}`, `?category={category}`

**Endpoint:** `GET /api/v1/school/tuition-fee-balances`

- **Current:** Returns fee balances
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?status={status}`

**Endpoint:** `GET /api/v1/school/transport-fee-balances`

- **Current:** Returns transport fee balances
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?status={status}`

#### 12. College Module Endpoints

**Endpoint:** `GET /api/v1/college/classes`

- **Current:** Returns list of classes
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/college/groups`

- **Current:** Returns list of groups
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/college/courses`

- **Current:** Returns list of courses
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/college/subjects`

- **Current:** Returns list of subjects
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`

**Endpoint:** `GET /api/v1/college/students`

- **Current:** Returns list of students
- **Issue:** Can return hundreds/thousands of students
- **Priority:** 🔴 **CRITICAL**
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?course_id={id}`, `?search={term}`

**Endpoint:** `GET /api/v1/college/enrollments`

- **Current:** Returns list of enrollments
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?academic_year_id={id}`, `?status={status}`

**Endpoint:** `GET /api/v1/college/exams`

- **Current:** Returns list of exams
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?academic_year_id={id}`

**Endpoint:** `GET /api/v1/college/tests`

- **Current:** Returns list of tests
- **Issue:** May grow large
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?subject_id={id}`

**Endpoint:** `GET /api/v1/college/exam-marks`

- **Current:** Returns exam marks
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?exam_id={id}`, `?class_id={id}`, `?group_id={id}`

**Endpoint:** `GET /api/v1/college/attendance`

- **Current:** Returns attendance records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?date={date}`, `?month={month}&year={year}`

**Endpoint:** `GET /api/v1/college/student-marks`

- **Current:** Returns student marks
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?test_id={id}`, `?class_id={id}`, `?group_id={id}`, `?student_id={id}`

**Endpoint:** `GET /api/v1/college/income`

- **Current:** Returns income records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?start_date={date}&end_date={date}`, `?category={category}`

**Endpoint:** `GET /api/v1/college/expenditure`

- **Current:** Returns expenditure records
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?start_date={date}&end_date={date}`, `?category={category}`

**Endpoint:** `GET /api/v1/college/tuition-fee-balances`

- **Current:** Returns fee balances
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?status={status}`

**Endpoint:** `GET /api/v1/college/transport-fee-balances`

- **Current:** Returns transport fee balances
- **Issue:** Can return large datasets
- **Required:** Add pagination support
- **Expected Parameters:** `?page=1&page_size=20`
- **Optional Filters:** `?class_id={id}`, `?group_id={id}`, `?status={status}`

### Summary of Missing Pagination

#### Priority Levels

**🔴 CRITICAL (Must implement immediately):**

1. `GET /api/v1/users` - User list
2. `GET /api/v1/users/roles-and-branches` - Users with details
3. `GET /api/v1/employees` - Employee list
4. `GET /api/v1/logs/{category}` - Logs (can be extremely large)
5. `GET /api/v1/school/students` - Student list
6. `GET /api/v1/college/students` - Student list

**🟡 HIGH (Should implement soon):**

1. `GET /api/v1/user-branch-accesses` - Access list
2. `GET /api/v1/announcements` - Announcements
3. `GET /api/v1/logs/search/global` - Log search
4. `GET /api/v1/school/enrollments` - Enrollments
5. `GET /api/v1/college/enrollments` - Enrollments
6. `GET /api/v1/school/exam-marks` - Exam marks
7. `GET /api/v1/college/exam-marks` - Exam marks
8. `GET /api/v1/school/student-attendance` - Attendance
9. `GET /api/v1/college/attendance` - Attendance
10. `GET /api/v1/school/income` - Income records
11. `GET /api/v1/school/expenditure` - Expenditure records
12. `GET /api/v1/college/income` - Income records
13. `GET /api/v1/college/expenditure` - Expenditure records

**🟢 MEDIUM (Should implement for consistency):**

1. `GET /api/v1/branches` - Branch list
2. `GET /api/v1/bus-routes` - Bus routes
3. `GET /api/v1/school/classes` - Classes
4. `GET /api/v1/school/subjects` - Subjects
5. `GET /api/v1/school/exams` - Exams
6. `GET /api/v1/school/tests` - Tests
7. `GET /api/v1/college/classes` - Classes
8. `GET /api/v1/college/groups` - Groups
9. `GET /api/v1/college/courses` - Courses
10. `GET /api/v1/college/subjects` - Subjects
11. `GET /api/v1/college/exams` - Exams
12. `GET /api/v1/college/tests` - Tests

**⚪ LOW (Nice to have, typically small datasets):**

1. `GET /api/v1/roles` - Roles (typically 5-20 items)
2. `GET /api/v1/academic-years` - Academic years (typically 5-10 items)
3. `GET /api/v1/distance-slabs` - Distance slabs (typically small)

### Implementation Checklist

For each endpoint missing pagination:

- [ ] Add `page` query parameter (default: 1)
- [ ] Add `page_size` or `pageSize` query parameter (default: 20, max: 100)
- [ ] Update response to include pagination metadata:
  - `total` or `total_count` - Total number of items
  - `pages` or `total_pages` - Total number of pages
  - `current_page` or `page` - Current page number
  - `page_size` - Items per page
- [ ] Implement database-level pagination (LIMIT/OFFSET)
- [ ] Update API documentation
- [ ] Test with large datasets
- [ ] Verify performance improvements

---

## Filtering & Query Parameters

### Common Filter Parameters

#### Date Range Filtering

```
?start_date=2025-01-01&end_date=2025-01-31
```

- **Format:** YYYY-MM-DD (ISO 8601 date format)
- **Validation:** `start_date` must be <= `end_date`
- **Use cases:** Dashboard stats, reports, transaction history

#### Month/Year Filtering

```
?month=11&year=2025
```

- **month:** Integer (1-12)
- **year:** Integer (4 digits)
- **Use cases:** Monthly reports, branch-specific queries, attendance

#### Branch Filtering

```
?branch_id=1
```

- **branch_id:** Integer (branch ID)
- **Use cases:** Branch-specific data, role-based filtering

#### Academic Year Filtering

```
?academic_year_id=1
```

- **academic_year_id:** Integer (academic year ID)
- **Use cases:** Academic year-specific data

#### Status Filtering

```
?status=PENDING
?status=APPROVED
?status=all  // Special value to get all statuses
```

- **status:** String (enum value)
- **Special value:** `"all"` means no status filter (return all statuses)
- **Use cases:** Filtering by approval status, payment status, etc.

#### Class/Group Filtering

```
?class_id=1
?group_id=2
```

- **class_id:** Integer (for school)
- **group_id:** Integer (for college)
- **Use cases:** Class/group-specific lists

#### Search/Text Filtering

```
?search=john
?q=student_name
```

- **search** or **q:** String (search term)
- **Use cases:** Global search, name search
- **Note:** Currently limited usage in frontend, but should be supported

### Filter Combination

**Multiple filters can be combined:**

```
GET /api/v1/advances/branch?page=1&pageSize=10&month=11&year=2025&status=PENDING
GET /api/v1/employee-leaves/branch?page=1&page_size=20&month=12&year=2024
GET /api/v1/employees/branch?branch_id=1&status=ACTIVE
```

**Filter Validation:**

- All filters are optional
- Invalid filter values should return 400 Bad Request
- Missing filter values should be ignored (not cause errors)

### Recent Items Endpoint Pattern

**Common pattern for "recent" endpoints:**

```
GET /api/v1/employees/recent?limit=5
GET /api/v1/advances/recent?limit=10
GET /api/v1/employee-leaves/recent?limit=5
```

**Parameters:**

- `limit` (integer, default: 5) - Number of recent items to return

**Response Format:**

```json
[
  {
    "id": 1,
    "name": "...",
    "created_at": "2025-01-15T10:30:00Z",
    ...
  }
]
```

- Returns array directly (not paginated)
- Ordered by `created_at` DESC (most recent first)

---

## Response Formats

### Success Response Wrapper

**Standard Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z",
  "message": "Optional success message"
}
```

**Single Resource Response:**

```json
{
  "id": 1,
  "name": "Resource Name",
  "created_at": "2025-01-15T10:30:00Z",
  ...
}
```

- Some endpoints return resource directly (without wrapper)
- **Recommendation:** Standardize on wrapper format for consistency

**List Response (Non-paginated):**

```json
[
  {
    "id": 1,
    "name": "Item 1",
    ...
  },
  {
    "id": 2,
    "name": "Item 2",
    ...
  }
]
```

**List Response (Paginated):**
See [Pagination Requirements](#pagination-requirements) section above.

### Dashboard Response Format

**Dashboard endpoints return structured data:**

```json
{
  "success": true,
  "data": {
    "overview": { ... },
    "financial": { ... },
    "recent_activities": [ ... ],
    "charts": { ... }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**See:** `client/docs/dashboard-api-requirements.md` for detailed dashboard response structures.

---

## Error Handling

### HTTP Status Codes

**Standard Status Codes:**

- **200 OK:** Successful request
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid input data, validation errors
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Insufficient permissions for the operation
- **404 Not Found:** Resource not found
- **422 Unprocessable Entity:** Validation errors with field details
- **500 Internal Server Error:** Server-side error

### Error Response Format

**Standard Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Alternative Error Format (FastAPI style):**

```json
{
  "detail": "Error message description"
}
```

**422 Validation Error Format:**

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "amount"],
      "msg": "amount must be greater than 0",
      "type": "value_error"
    }
  ]
}
```

**Frontend Handling:**

- Frontend checks for both `error.message` and `detail`
- Frontend parses validation errors from `detail` array
- **Recommendation:** Use consistent error format across all endpoints

### Common Error Scenarios

1. **Invalid Pagination:**

   ```json
   {
     "detail": "Invalid page number. Must be >= 1"
   }
   ```

   Status: 400 Bad Request

2. **Invalid Filter:**

   ```json
   {
     "detail": "Invalid month value. Must be between 1 and 12"
   }
   ```

   Status: 400 Bad Request

3. **Resource Not Found:**

   ```json
   {
     "detail": "Employee not found with id: 123"
   }
   ```

   Status: 404 Not Found

4. **Permission Denied:**

   ```json
   {
     "detail": "You do not have permission to perform this action"
   }
   ```

   Status: 403 Forbidden

5. **Unauthorized:**
   ```json
   {
     "detail": "Invalid or expired token"
   }
   ```
   Status: 401 Unauthorized

---

## Authentication & Authorization

### Authentication

**Token-based Authentication:**

- **Header:** `Authorization: Bearer {access_token}`
- **Token Refresh:** `POST /api/v1/auth/refresh`
- **Token Expiry:** Backend should return 401 when token expires

**Login Endpoint:**

```
POST /api/v1/auth/login
```

**Response:**

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "user": { ... }
}
```

### Authorization (Role-Based Access Control)

**Roles:**

- `ADMIN` - Full system access
- `INSTITUTE_ADMIN` - Institute-level access
- `ACCOUNTANT` - Financial operations access
- `ACADEMIC` - Academic operations access

**Permission Requirements:**

See `client/docs/API_ENDPOINTS_FOR_BACKEND_PERMISSIONS.md` for detailed role-based permission requirements.

**Key Points:**

1. **Dashboard Access:**
   - `/api/v1/dashboard` - Should be accessible to ACCOUNTANT and ACADEMIC (role-specific dashboards)

2. **View Access (GET):**
   - Most list/detail endpoints should allow VIEW access for appropriate roles
   - Branch-specific endpoints should respect branch access permissions

3. **Create Access (POST):**
   - Restricted to ADMIN, INSTITUTE_ADMIN, and specific roles (e.g., ACCOUNTANT for advances)

4. **Update Access (PUT/PATCH):**
   - Varies by endpoint and role
   - Some roles can update specific fields only

5. **Delete Access (DELETE):**
   - Usually restricted to ADMIN and INSTITUTE_ADMIN

**Branch Context:**

- All endpoints should respect user's current branch context
- Branch switching: `POST /api/v1/auth/switch-branch/{branch_id}`
- Academic year switching: `POST /api/v1/auth/switch-academic-year/{academic_year_id}`

**Current Branch:**

- User's current branch is determined from JWT token or session
- All queries should automatically filter by current branch unless explicitly overridden

---

## Data Types & Formats

### Date & Time Formats

**DateTime (with time):**

- **Format:** ISO 8601
- **Example:** `"2025-01-15T10:30:00Z"`
- **Example:** `"2025-01-15T10:30:00+05:30"` (with timezone)
- **Use cases:** `created_at`, `updated_at`, `transaction_date`

**Date Only (without time):**

- **Format:** YYYY-MM-DD
- **Example:** `"2025-01-15"`
- **Use cases:** `enrollment_date`, `advance_date`, filter parameters

**Validation:**

- All dates should be valid ISO 8601 or YYYY-MM-DD format
- Invalid dates should return 400 Bad Request

### Number Formats

**Monetary Values:**

- **Format:** Decimal (float/double)
- **Example:** `15000.00`, `2500000.0`
- **Precision:** 2 decimal places recommended
- **Use cases:** Amounts, fees, balances

**Percentages:**

- **Format:** Decimal (float/double)
- **Example:** `92.5` (for 92.5%), `-3.1` (for -3.1% decrease)
- **Use cases:** Attendance rates, pass rates, change indicators

**Integers:**

- **Format:** Integer
- **Example:** `1250`, `85`
- **Use cases:** Counts, IDs, page numbers

**Change Indicators:**

- All `*_change` fields represent percentage change from previous period
- Positive values indicate increase
- Negative values indicate decrease
- **Example:** `"attendance_rate_change": 2.3` means +2.3% increase

### Boolean Values

- **Format:** `true` or `false` (JSON boolean)
- **Use cases:** `is_active`, `is_paid`, `promoted`

### Null Handling

- Use `null` for missing/optional data (not empty strings or zeros)
- **Example:** `"updated_at": null`, `"approved_by": null`
- Empty arrays should be `[]` (not `null`)

---

## Common Patterns

### Branch-Specific Endpoints

**Pattern:**

```
GET /api/v1/{resource}/branch?page=1&pageSize=10&month=11&year=2025
```

**Examples:**

- `/api/v1/employees/branch`
- `/api/v1/advances/branch`
- `/api/v1/employee-leaves/branch`
- `/api/v1/employee-attendances/branch`

**Behavior:**

- Automatically filters by user's current branch
- Supports pagination and additional filters
- Returns paginated response

### Dashboard Endpoints

**Pattern:**

```
GET /api/v1/{resource}/dashboard
```

**Examples:**

- `/api/v1/dashboard` (main dashboard)
- `/api/v1/employees/dashboard`
- `/api/v1/advances/dashboard`
- `/api/v1/employee-leaves/dashboard`

**Behavior:**

- Returns statistics and aggregated data
- Role-specific dashboards return different data
- Supports optional query parameters:
  - `?branch_id=1`
  - `?academic_year_id=1`
  - `?start_date=2025-01-01&end_date=2025-01-31`

### Recent Items Endpoints

**Pattern:**

```
GET /api/v1/{resource}/recent?limit=5
```

**Examples:**

- `/api/v1/employees/recent?limit=5`
- `/api/v1/advances/recent?limit=10`
- `/api/v1/employee-leaves/recent?limit=5`

**Behavior:**

- Returns most recent items (ordered by `created_at` DESC)
- Not paginated (returns array directly)
- Default limit: 5

### Status Update Endpoints

**Pattern:**

```
PUT /api/v1/{resource}/{id}/status
PATCH /api/v1/{resource}/{id}/status
```

**Examples:**

- `/api/v1/employees/{id}/status`
- `/api/v1/advances/{id}/status`
- `/api/v1/employee-leaves/{id}/approve`
- `/api/v1/employee-leaves/{id}/reject`

**Request Body:**

```json
{
  "status": "APPROVED",
  "reason": "Optional reason for status change"
}
```

### Bulk Operations

**Pattern:**

```
POST /api/v1/{resource}/bulk
```

**Examples:**

- `/api/v1/employee-attendances/bulk` (bulk create attendance)

**Request Body:**

```json
{
  "items": [
    { ... },
    { ... }
  ]
}
```

---

## Endpoint-Specific Requirements

### Employees Module

**Endpoints:**

- `GET /api/v1/employees/dashboard` - Dashboard stats
- `GET /api/v1/employees/recent?limit={limit}` - Recent employees
- `GET /api/v1/employees` - List all (by institute)
- `GET /api/v1/employees/branch` - List by branch
- `GET /api/v1/employees/{id}` - Get by ID
- `POST /api/v1/employees` - Create
- `PUT /api/v1/employees/{id}` - Update
- `PATCH /api/v1/employees/{id}/status` - Update status
- `DELETE /api/v1/employees/{id}` - Delete

**Permissions:**

- VIEW: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT
- CREATE/UPDATE/DELETE: ADMIN, INSTITUTE_ADMIN only

### Advances Module

**Endpoints:**

- `GET /api/v1/advances/dashboard` - Dashboard stats
- `GET /api/v1/advances/recent?limit={limit}` - Recent advances
- `GET /api/v1/advances?pageSize={size}&page={page}&month={month}&year={year}&status={status}` - List all
- `GET /api/v1/advances/branch?pageSize={size}&page={page}&month={month}&year={year}&status={status}` - List by branch
- `GET /api/v1/advances/{id}` - Get by ID
- `POST /api/v1/advances` - Create
- `PUT /api/v1/advances/{id}` - Update
- `PUT /api/v1/advances/{id}/status` - Update status
- `PUT /api/v1/advances/{id}/amount-paid` - Update amount paid
- `DELETE /api/v1/advances/{id}` - Delete

**Permissions:**

- VIEW: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
- CREATE: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
- UPDATE/DELETE: ADMIN, INSTITUTE_ADMIN only

**Filtering:**

- Supports `month`, `year`, `status` filters
- Supports pagination

### Employee Leaves Module

**Endpoints:**

- `GET /api/v1/employee-leaves/dashboard` - Dashboard stats
- `GET /api/v1/employee-leaves/recent?limit={limit}` - Recent leaves
- `GET /api/v1/employee-leaves/branch?pageSize={size}&page={page}&month={month}&year={year}` - List by branch
- `GET /api/v1/employee-leaves/{id}` - Get by ID
- `POST /api/v1/employee-leaves` - Create
- `PUT /api/v1/employee-leaves/{id}` - Update
- `PUT /api/v1/employee-leaves/{id}/approve` - Approve leave
- `PUT /api/v1/employee-leaves/{id}/reject` - Reject leave
- `DELETE /api/v1/employee-leaves/{id}` - Delete

**Permissions:**

- VIEW: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT
- CREATE: ADMIN, INSTITUTE_ADMIN only
- UPDATE: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT
- APPROVE/REJECT: ADMIN, INSTITUTE_ADMIN only

### Employee Attendance Module

**Endpoints:**

- `GET /api/v1/employee-attendances/dashboard` - Dashboard stats
- `GET /api/v1/employee-attendances/branch?month={month}&year={year}` - List by branch
- `GET /api/v1/employee-attendances/{id}` - Get by ID
- `POST /api/v1/employee-attendances/individual` - Create individual
- `POST /api/v1/employee-attendances/bulk` - Bulk create
- `PUT /api/v1/employee-attendances/{id}` - Update
- `DELETE /api/v1/employee-attendances/{id}` - Delete

**Permissions:**

- VIEW: ADMIN, INSTITUTE_ADMIN, ACADEMIC
- CREATE: ADMIN, INSTITUTE_ADMIN, ACADEMIC
- UPDATE/DELETE: ADMIN, INSTITUTE_ADMIN only

### Reservations Module

**School Reservations:**

- `GET /api/v1/school/reservations?page={page}&page_size={size}&class_id={id}&status={status}` - List
- `GET /api/v1/school/reservations/{id}` - Get by ID
- `POST /api/v1/school/reservations` - Create
- `PUT /api/v1/school/reservations/{id}` - Update
- `PUT /api/v1/school/reservations/{id}/status` - Update status
- `PUT /api/v1/school/reservations/{id}/concessions` - Update concessions
- `DELETE /api/v1/school/reservations/{id}` - Delete

**College Reservations:**

- `GET /api/v1/college/reservations?page={page}&page_size={size}&group_id={id}&status={status}` - List
- Similar endpoints as school

**Response Format:**

```json
{
  "data": [...],
  "total_pages": 15,
  "total_count": 150,
  "current_page": 1
}
```

**Permissions:**

- VIEW/CREATE/UPDATE: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
- Concession updates: ADMIN, INSTITUTE_ADMIN only

---

## Performance Considerations

### Database Queries

1. **Always use pagination** for list endpoints
   - Never return all records in a single response
   - Default page size: 10-20 items
   - Maximum page size: 100 items

2. **Use database indexes** for:
   - Foreign keys (employee_id, branch_id, etc.)
   - Date fields (created_at, updated_at)
   - Status fields
   - Search fields (name, admission_no, etc.)

3. **Optimize queries:**
   - Use SELECT only required fields
   - Use JOINs efficiently
   - Avoid N+1 query problems
   - Use database-level filtering (not application-level)

### Caching

1. **Cache frequently accessed data:**
   - Dashboard statistics (cache for 1-5 minutes)
   - Dropdown lists (cache for longer periods)
   - User permissions (cache in Redis)

2. **Cache invalidation:**
   - Invalidate cache on data updates
   - Use cache keys with TTL

### Response Size

1. **Limit response sizes:**
   - Paginated lists: Max 100 items per page
   - Dashboard responses: Keep aggregated data concise
   - Avoid deep nesting in responses

2. **Use compression:**
   - Enable gzip compression for responses
   - Especially important for large JSON responses

### Rate Limiting

1. **Implement rate limiting:**
   - Prevent abuse and DoS attacks
   - Different limits for different endpoints
   - Return 429 Too Many Requests when limit exceeded

### Timeout Handling

1. **Request timeouts:**
   - Frontend expects 30-second timeout
   - Long-running operations should use async processing
   - Return 504 Gateway Timeout for exceeded timeouts

---

## Minor Implementation Details

### Query Parameter Handling

1. **Case Sensitivity:**
   - Query parameters should be case-insensitive where possible
   - Frontend uses both `pageSize` and `page_size`

2. **Optional Parameters:**
   - All filter parameters are optional
   - Missing parameters should not cause errors
   - Use default values when parameters are missing

3. **Parameter Validation:**
   - Validate all parameters before processing
   - Return 400 Bad Request for invalid values
   - Provide clear error messages

### Response Consistency

1. **Field Naming:**
   - Use consistent naming (snake_case recommended)
   - Support both snake_case and camelCase if needed for backward compatibility

2. **Null vs Empty:**
   - Use `null` for missing optional fields
   - Use `[]` for empty arrays
   - Use `{}` for empty objects

3. **Date Fields:**
   - Always include timezone information
   - Use UTC for storage, convert to user timezone in responses if needed

### Branch Context

1. **Automatic Branch Filtering:**
   - All queries should respect user's current branch
   - Branch context comes from JWT token or session
   - `/branch` endpoints explicitly filter by branch

2. **Branch Switching:**
   - `POST /api/v1/auth/switch-branch/{branch_id}` updates user's current branch
   - Subsequent requests use new branch context

### Academic Year Context

1. **Academic Year Filtering:**
   - Similar to branch context
   - `POST /api/v1/auth/switch-academic-year/{academic_year_id}` updates context
   - All queries respect current academic year

### Audit Logging

1. **Track Changes:**
   - `created_at`, `created_by` for new records
   - `updated_at`, `updated_by` for updates
   - Track status changes and approvals

2. **Audit Trail:**
   - Log all create/update/delete operations
   - Include user ID, timestamp, and action type
   - Store in audit_logs table

---

## Testing Requirements

### Test Coverage

1. **Pagination:**
   - Test with various page sizes
   - Test edge cases (page 0, negative page, page > total pages)
   - Test with empty results

2. **Filtering:**
   - Test each filter individually
   - Test filter combinations
   - Test invalid filter values

3. **Permissions:**
   - Test each role's access to each endpoint
   - Test 403 responses for unauthorized access
   - Test branch-based access control

4. **Error Handling:**
   - Test all error scenarios
   - Verify error response formats
   - Test validation errors

### Performance Testing

1. **Load Testing:**
   - Test with large datasets
   - Test pagination performance
   - Test concurrent requests

2. **Response Time:**
   - List endpoints: < 500ms
   - Detail endpoints: < 200ms
   - Dashboard endpoints: < 1000ms

---

## Summary Checklist

### ✅ Pagination

- [ ] All list endpoints support `page` and `page_size` parameters
- [ ] Responses include `total`, `pages`, `current_page` fields
- [ ] Default page size is reasonable (10-20)
- [ ] Maximum page size is enforced (100)
- [ ] Edge cases are handled (empty results, invalid page numbers)
- [ ] **CRITICAL:** User endpoints (`/users`, `/users/roles-and-branches`) have pagination
- [ ] **CRITICAL:** Employee endpoints (`/employees`, `/employees/branch`) have pagination
- [ ] **CRITICAL:** Student endpoints (`/school/students`, `/college/students`) have pagination
- [ ] **CRITICAL:** Log endpoints (`/logs/{category}`) have pagination
- [ ] **HIGH:** Announcements, enrollments, marks, attendance endpoints have pagination
- [ ] **MEDIUM:** Branch, class, subject, exam endpoints have pagination
- [ ] See [Missing Pagination - Endpoints Audit](#missing-pagination---endpoints-audit) for complete list

### ✅ Filtering

- [ ] Date range filtering (`start_date`, `end_date`)
- [ ] Month/year filtering (`month`, `year`)
- [ ] Branch filtering (`branch_id`)
- [ ] Academic year filtering (`academic_year_id`)
- [ ] Status filtering (`status`)
- [ ] Class/group filtering (`class_id`, `group_id`)
- [ ] All filters are optional and can be combined

### ✅ Response Formats

- [ ] Consistent success response wrapper
- [ ] Consistent error response format
- [ ] Paginated responses include all required metadata
- [ ] Dates in ISO 8601 format
- [ ] Numbers in correct format (decimals for money/percentages)

### ✅ Error Handling

- [ ] All HTTP status codes are correct
- [ ] Error messages are clear and helpful
- [ ] Validation errors include field details
- [ ] 401 for unauthorized, 403 for forbidden

### ✅ Authentication & Authorization

- [ ] Bearer token authentication works
- [ ] Role-based access control is enforced
- [ ] Branch context is respected
- [ ] Academic year context is respected

### ✅ Performance

- [ ] Database queries are optimized
- [ ] Pagination is database-level (not application-level)
- [ ] Appropriate indexes are in place
- [ ] Response sizes are reasonable
- [ ] Caching is implemented where appropriate

---

## References

- **Public API Endpoints:** `client/docs/PUBLIC_API.md`
- **Permission Requirements:** `client/docs/API_ENDPOINTS_FOR_BACKEND_PERMISSIONS.md`
- **Dashboard Requirements:** `client/docs/dashboard-api-requirements.md`
- **College API:** `client/docs/COLLEGE_API.md`
- **School API:** `client/docs/SCHOOL_API.md`

---

**Document End**
