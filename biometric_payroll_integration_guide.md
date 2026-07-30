# Frontend Integration Guide: Biometric Payroll Operations

This guide documents the API endpoints, request payloads, response contracts, and UI handling recommendations for integrating the new Biometric Payroll features into the frontend application.

---

## 1. API Endpoints Specification

All requests require standard Authorization header (JWT Bearer Token):
`Authorization: Bearer <token>`

| Operation | Method | Path | Request Body | Response Model | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Get Biometric Payroll Preview** | `POST` | `/api/v1/payrolls/biometric-payroll-preview` | `PayrollPreviewRequest` | `JSON Object` | Retrieves a computed preview of payroll metrics merging ERP leaves and ESSL attendance logs. |
| **Generate/Upsert Biometric Payroll** | `POST` | `/api/v1/payrolls/biometric-payroll` | `PayrollCreateRequest` | `JSON Object` | Generates a new payroll record or updates an existing PENDING/HOLD record. |

---

## 2. Request Contracts (Payloads)

### A. Biometric Payroll Preview Request (`PayrollPreviewRequest`)
Used to request a preview calculation before writing to the database.

*   **Content-Type**: `application/json`
*   **Structure**:
```json
{
  "employee_id": 15,
  "month": 7,
  "year": 2026
}
```

### B. Biometric Payroll Generation Request (`PayrollCreateRequest`)
Used to write/save the calculated payroll record or update an existing one.

*   **Content-Type**: `application/json`
*   **Structure**:
```json
{
  "employee_id": 15,
  "payroll_month": 7,
  "payroll_year": 2026,
  "other_deductions": 150.00,
  "advance_amount": 1000.00,
  "paid_amount": 18500.00,
  "payment_method": "UPI",
  "payment_notes": "Salary disbursed via UPI transaction"
}
```
*   *Note*: `other_deductions` and `advance_amount` are optional. `payment_method` is required if `paid_amount > 0`. Allowed values for `payment_method` are: `CASH`, `UPI`, `CARD`.

---

## 3. Response Contracts (Payloads)

### A. Preview Response (`/biometric-payroll-preview`)
```json
{
  "success": true,
  "employee_id": 15,
  "employee_name": "John Doe",
  "payroll_month": 7,
  "payroll_year": 2026,
  "previous_balance": 0.00,
  "gross_pay": 20000.00,
  "lop": 1334.00,
  "advance_deduction": 0.00,
  "other_deductions": 0.00,
  "total_deductions": 1334.00,
  "net_pay": 18666.00,
  "expected_days": 16,
  "missing_days": 2,
  "existing_record": true,
  "existing_status": "PENDING"
}
```

#### Fields Explanation:
*   **`expected_days`**: The number of calendar days elapsed so far in the month. If it is the current month, this equals the current day of the month (preventing penalization of future days).
*   **`missing_days`**: Synced log gaps (days where no logs exist in ESSL and no approved leaves are registered). This is factored into the `lop` total.
*   **`existing_record`**: Indicates if a payroll record already exists. If `true`, generating this payroll will perform an **UPSERT (Update)** instead of an insert.
*   **`existing_status`**: The status of the existing record (`PENDING` or `HOLD`).

---

## 4. UI Validation & Error Handling

When integrating these endpoints, the frontend must gracefully handle the following error responses (returned with `success: false` or standard FastAPI HTTP status codes):

### 1. Missing Employee Salary
*   **Condition**: The employee has not been assigned a salary in their ERP profile (salary is 0 or NULL).
*   **Response Payload**:
```json
{
  "success": false,
  "message": "Employee salary details are not updated. Please set a valid salary in the employee profile before generating payroll.",
  "employee_id": 15,
  "employee_name": "John Doe"
}
```
*   **Frontend Action**: Disable the "Generate Payroll" button and display a banner directing the admin to the Employee Management page to update the employee's salary.

### 2. Already Paid (Finalized)
*   **Condition**: The payroll has already been disbursed and marked as `PAID`. Finalized records cannot be modified.
*   **Response Payload**:
```json
{
  "success": false,
  "message": "Payroll has already been PAID and finalized for this month/year. It cannot be recalculated.",
  "employee_id": 15,
  "employee_name": "John Doe",
  "month": 7,
  "year": 2026
}
```
*   **Frontend Action**: Display as read-only with a "PAID" badge. Hide "Recalculate" or "Generate" controls.

### 3. Sync Warning / Missing Logs
*   **Condition**: `missing_days` is greater than 0.
*   **Frontend Action**: Display an informational tooltip warning the admin:
    > ⚠️ *This employee has {missing_days} days with no attendance logs synced from ESSL. These days have been deducted as Loss of Pay (LOP).*
