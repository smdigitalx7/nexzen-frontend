# Dashboard API Response Requirements

This document outlines the API response structure requirements for dashboard endpoints based on user roles.

## Endpoint Structure

All dashboard endpoints should follow this pattern:

- **Endpoint**: `GET /api/{role}/dashboard` or `GET /api/dashboard?role={role}`
- **Authentication**: Required (Bearer Token)
- **Response Format**: JSON

---

## 1. Admin Dashboard

### Endpoint

```
GET /api/admin/dashboard
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_students": 1250,
      "total_teachers": 85,
      "total_classes": 45,
      "total_branches": 3
    },
    "financial": {
      "total_income": 2500000.0,
      "total_expenditure": 1800000.0,
      "net_profit": 700000.0,
      "income_this_month": 450000.0,
      "expenditure_this_month": 320000.0,
      "income_this_year": 2800000.0,
      "expenditure_this_year": 2000000.0
    },
    "enrollments": {
      "total_enrollments": 1250,
      "pending_enrollments": 25,
      "confirmed_enrollments": 1200,
      "cancelled_enrollments": 25
    },
    "reservations": {
      "total_reservations": 150,
      "pending_reservations": 15,
      "confirmed_reservations": 120,
      "cancelled_reservations": 15
    },
    "attendance": {
      "average_attendance_rate": 92.5,
      "attendance_rate_change": 2.3,
      "students_present_today": 1150,
      "students_absent_today": 100,
      "attendance_today_rate": 92.0
    },
    "academic": {
      "total_exams": 12,
      "upcoming_exams": 3,
      "completed_exams": 9,
      "average_pass_rate": 85.5,
      "average_pass_rate_change": 3.2
    },

    // Audit logs
    "recent_activities": [
      {
        "id": 1,
        "type": "enrollment",
        "title": "New Enrollment",
        "description": "Student John Doe enrolled in Class 10-A",
        "timestamp": "2025-01-15T10:30:00Z",
        "user_name": "Admin User",
        "branch_name": "Main Branch"
      },
      {
        "id": 2,
        "type": "income",
        "title": "Payment Received",
        "description": "Tuition fee payment of ₹15,000 received",
        "timestamp": "2025-01-15T09:15:00Z",
        "user_name": "Admin User",
        "amount": 15000.0
      },
      {
        "id": 3,
        "type": "expenditure",
        "title": "Expense Recorded",
        "description": "Salary payment of ₹500,000",
        "timestamp": "2025-01-15T08:00:00Z",
        "user_name": "Admin User",
        "amount": 500000.0
      }
    ],
    "charts": {
      "income_trend": [
        { "month": "Jan", "income": 450000, "expenditure": 320000 },
        { "month": "Feb", "income": 480000, "expenditure": 340000 },
        { "month": "Mar", "income": 520000, "expenditure": 360000 },
        { "month": "Apr", "income": 500000, "expenditure": 350000 },
        { "month": "May", "income": 550000, "expenditure": 380000 },
        { "month": "Jun", "income": 450000, "expenditure": 320000 }
      ],
      "enrollment_trend": [
        { "month": "Jan", "enrollments": 45 },
        { "month": "Feb", "enrollments": 52 },
        { "month": "Mar", "enrollments": 38 },
        { "month": "Apr", "enrollments": 42 },
        { "month": "May", "enrollments": 48 },
        { "month": "Jun", "enrollments": 35 }
      ],
      "attendance_trend": [
        { "date": "2025-01-09", "rate": 91.2 },
        { "date": "2025-01-10", "rate": 92.5 },
        { "date": "2025-01-11", "rate": 93.1 },
        { "date": "2025-01-12", "rate": 92.8 },
        { "date": "2025-01-13", "rate": 92.0 },
        { "date": "2025-01-14", "rate": 91.5 },
        { "date": "2025-01-15", "rate": 92.0 }
      ],
      "income_by_category": [
        { "category": "Tuition Fee", "amount": 1800000, "percentage": 72 },
        { "category": "Transport Fee", "amount": 400000, "percentage": 16 },
        { "category": "Book Fee", "amount": 200000, "percentage": 8 },
        { "category": "Application Fee", "amount": 100000, "percentage": 4 }
      ]
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Key Metrics for Admin:

- Overall system statistics (students, teachers, classes, branches)
- Complete financial overview (income, expenditure, profit/loss)
- Enrollment and reservation statistics
- Attendance overview
- Academic performance metrics
- Recent activities across all modules

---

## 2. Accountant Dashboard

### Endpoint

```
GET /api/accountant/dashboard
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "financial_overview": {
      "income_today": 10000.0,
      "total_income": 2500000.0,
      "total_expenditure": 1800000.0,
      "income_this_month": 450000.0,
      "expenditure_this_month": 320000.0
    },
    "income_breakdown": {
      "tuition_fee_income": 1800000.0,
      "transport_fee_income": 400000.0,
      "book_fee_income": 200000.0,
      "application_fee_income": 100000.0,
      "other_income": 100000.0
    },

    //Audit Logs
    "recent_transactions": [
      {
        "id": 1,
        "type": "income",
        "transaction_id": "INC-2025-001",
        "purpose": "Tuition Fee",
        "amount": 15000.0,
        "payment_method": "Bank Transfer",
        "student_name": "John Doe",
        "admission_no": "ADM-2024-001",
        "transaction_date": "2025-01-15T10:30:00Z",
        "created_by": "Accountant User"
      },
      {
        "id": 2,
        "type": "expenditure",
        "transaction_id": "EXP-2025-001",
        "purpose": "Salary Payment",
        "amount": 500000.0,
        "payment_method": "Bank Transfer",
        "voucher_no": "VCH-2025-001",
        "transaction_date": "2025-01-15T08:00:00Z",
        "created_by": "Accountant User"
      },
      {
        "id": 3,
        "type": "income",
        "transaction_id": "INC-2025-002",
        "purpose": "Application Fee",
        "amount": 5000.0,
        "payment_method": "Cash",
        "student_name": "Jane Smith",
        "reservation_no": "RES-2025-001",
        "transaction_date": "2025-01-15T09:15:00Z",
        "created_by": "Accountant User"
      }
    ],
    //optional
    "charts": {
      "income_trend": [
        { "month": "Jan", "income": 450000, "expenditure": 320000 },
        { "month": "Feb", "income": 480000, "expenditure": 340000 },
        { "month": "Mar", "income": 520000, "expenditure": 360000 },
        { "month": "Apr", "income": 500000, "expenditure": 350000 },
        { "month": "May", "income": 550000, "expenditure": 380000 },
        { "month": "Jun", "income": 450000, "expenditure": 320000 }
      ],
      "income_by_category": [
        { "category": "Tuition Fee", "amount": 1800000, "percentage": 72 },
        { "category": "Transport Fee", "amount": 400000, "percentage": 16 },
        { "category": "Book Fee", "amount": 200000, "percentage": 8 },
        { "category": "Application Fee", "amount": 100000, "percentage": 4 }
      ],
      "expenditure_by_category": [
        { "category": "Salary", "amount": 1200000, "percentage": 66.7 },
        { "category": "Infrastructure", "amount": 300000, "percentage": 16.7 },
        { "category": "Transport", "amount": 150000, "percentage": 8.3 },
        { "category": "Other", "amount": 150000, "percentage": 8.3 }
      ],
      "payment_method_distribution": [
        { "method": "Cash", "amount": 800000, "percentage": 32 },
        { "method": "Bank Transfer", "amount": 1200000, "percentage": 48 },
        { "method": "Cheque", "amount": 300000, "percentage": 12 },
        { "method": "Online", "amount": 200000, "percentage": 8 }
      ],
      "daily_transactions": [
        { "date": "2025-01-09", "income": 85000, "expenditure": 60000 },
        { "date": "2025-01-10", "income": 92000, "expenditure": 65000 },
        { "date": "2025-01-11", "income": 88000, "expenditure": 70000 },
        { "date": "2025-01-12", "income": 95000, "expenditure": 55000 },
        { "date": "2025-01-13", "income": 78000, "expenditure": 80000 },
        { "date": "2025-01-14", "income": 82000, "expenditure": 62000 },
        { "date": "2025-01-15", "income": 90000, "expenditure": 68000 }
      ]
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Key Metrics for Accountant:

- Detailed financial overview (income, expenditure, net balance)
- Income breakdown by category (tuition, transport, books, etc.)
- Expenditure breakdown by category
- Payment method distribution
- Pending payments and overdue amounts
- Recent financial transactions
- Financial alerts and notifications
- Branch-wise financial summary

---

## 3. Academic Dashboard

### Endpoint

```
GET /api/academic/dashboard
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_students": 1250,
      "total_teachers": 85,
      "total_classes": 45,
      "total_subjects": 120
    },
    "attendance": {
      "students_present_today": 1150,
      "students_absent_today": 100,
      "attendance_today_rate": 92.0,
      "teachers_present_today": 82,
      "teachers_absent_today": 3,
      "teacher_attendance_rate": 96.5
    },
    "academic_performance": {
      "total_exams_conducted": 12,
      "upcoming_exams": 3,
      "completed_exams": 9
    },
    "exams": {
      "total_exams": 12,
      "upcoming_exams": 3,
      "completed_exams": 9,
      "exams_this_month": 2,
      "exams_this_year": 12,
      "next_exam_date": "2025-01-20",
      "next_exam_name": "Mid-Term Examination"
    },
    "tests": {
      "total_tests": 45,
      "tests_this_month": 8,
      "tests_this_year": 45,
      "average_test_score": 78.5,
      "average_test_score_change": 2.5
    },

    //Audit Logs -- Academic
    "recent_activities": [
      {
        "id": 1,
        "type": "exam",
        "title": "Exam Results Published",
        "description": "Mid-Term Examination results published for Class 10",
        "timestamp": "2025-01-15T10:00:00Z",
        "class_name": "Class 10-A",
        "exam_name": "Mid-Term Examination"
      },
      {
        "id": 2,
        "type": "attendance",
        "title": "Attendance Marked",
        "description": "Attendance marked for Class 9-B",
        "timestamp": "2025-01-15T09:30:00Z",
        "class_name": "Class 9-B",
        "present_count": 42,
        "absent_count": 6
      },
      {
        "id": 3,
        "type": "test",
        "title": "Test Conducted",
        "description": "Mathematics test conducted for Class 8-A",
        "timestamp": "2025-01-15T08:45:00Z",
        "class_name": "Class 8-A",
        "subject_name": "Mathematics"
      }
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Key Metrics for Academic:

- Academic overview (students, teachers, classes, subjects)
- Attendance statistics (students and teachers)
- Academic performance metrics (pass rates, average marks)
- Exam and test information
- Class-wise performance comparison
- Subject-wise performance analysis
- Recent academic activities
- Academic alerts and upcoming events
- Branch-wise academic summary

---

## Common Response Fields

All dashboard responses should include:

### Standard Response Wrapper

```json
{
  "success": boolean,
  "data": { ... },
  "timestamp": "ISO 8601 datetime string",
  "message"?: "Optional success/error message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description",
    "details"?: "Additional error details"
  },
  "timestamp": "ISO 8601 datetime string"
}
```

---

## Query Parameters

All dashboard endpoints should support optional filtering:

### Date Range Filtering

```
?start_date=2025-01-01&end_date=2025-01-31
```

### Branch Filtering (if applicable)

```
?branch_id=1
```

### Academic Year Filtering (if applicable)

```
?academic_year_id=1
```

---

## Data Types

### Number Formats

- All monetary values should be in **decimal format** (e.g., `2500000.00`)
- All percentages should be in **decimal format** (e.g., `92.5` for 92.5%)
- All change values should include **positive/negative indicators** (e.g., `5.2` for +5.2%, `-3.1` for -3.1%)

### Date Formats

- All dates should be in **ISO 8601 format** (e.g., `2025-01-15T10:30:00Z`)
- Date-only values should be in **YYYY-MM-DD format** (e.g., `2025-01-15`)

### Change Indicators

- All `*_change` fields represent **percentage change** from previous period
- Positive values indicate increase, negative values indicate decrease

---

## Notes for Backend Implementation

1. **Role-based Access**: Ensure each endpoint returns only data accessible to the specific role
2. **Performance**: Consider caching dashboard data for better performance
3. **Real-time Updates**: Consider WebSocket support for real-time dashboard updates
4. **Pagination**: For large datasets (like recent activities), implement pagination
5. **Filtering**: Support date range, branch, and academic year filtering
6. **Consistency**: Maintain consistent field naming and data structure across all roles
7. **Null Handling**: Use `null` for missing data, not empty strings or zeros
8. **Validation**: Validate all date ranges and filter parameters
9. **Error Handling**: Provide meaningful error messages for invalid requests
10. **Security**: Ensure proper authentication and authorization checks
