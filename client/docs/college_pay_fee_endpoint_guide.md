# College Payment Endpoint: `POST /income/pay-fee/{admission_no}`

## Overview

This endpoint allows frontend applications to process fee payments for college students by admission number. It supports multiple payment types in a single transaction with comprehensive validation and business rule enforcement.

**Endpoint:** `POST /api/v1/college/income/pay-fee/{admission_no}`

**Authentication:** Required (Roles: `ADMIN`, `ACCOUNTANT`, `INSTITUTE_ADMIN`)

---

## Table of Contents

1. [Request Structure](#request-structure)
2. [Response Structure](#response-structure)
3. [Payment Types Supported](#payment-types-supported)
4. [End-to-End Flow](#end-to-end-flow)
5. [Validation Rules](#validation-rules)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)
7. [SQL Functions & Queries](#sql-functions--queries)
8. [Frontend Integration Guide](#frontend-integration-guide)

---

## Request Structure

### URL Parameters

- `admission_no` (string, path parameter): Student's admission number

### Request Body

```json
{
  "details": [
    {
      "purpose": "TUITION_FEE",
      "term_number": 1,
      "paid_amount": 5000.0,
      "payment_method": "CASH",
      "custom_purpose_name": null,
      "payment_month": null
    },
    {
      "purpose": "BOOK_FEE",
      "paid_amount": 2000.0,
      "payment_method": "ONLINE",
      "payment_month": null
    }
  ],
  "remarks": "Optional remarks"
}
```

### Request Schema Details

#### `PayFeeByAdmissionRequest`

```typescript
interface PayFeeByAdmissionRequest {
  details: CollegeIncomeDetailCreate[]; // Minimum 1 item required
  remarks?: string; // Optional
}
```

#### `CollegeIncomeDetailCreate`

```typescript
interface CollegeIncomeDetailCreate {
  purpose: IncomePurposeEnum; // Required
  term_number?: number; // Required for TUITION_FEE (1, 2, or 3)
  paid_amount: number; // Required, > 0, <= 1000000, max 2 decimal places
  payment_method: PaymentMethodEnum; // Default: "CASH"
  custom_purpose_name?: string; // Required if purpose is "OTHER"
  payment_month?: string; // Required for TRANSPORT_FEE (YYYY-MM-01 format)
}
```

#### Valid Purpose Values

- `TUITION_FEE` - Tuition fee (requires `term_number`: 1, 2, or 3)
- `BOOK_FEE` - Book fee (must be paid in full)
- `TRANSPORT_FEE` - Transport fee (requires `payment_month`)
- `OTHER` - Other fees (requires `custom_purpose_name`)

#### Valid Payment Methods

- `CASH` - Cash payment
- `ONLINE` - Online payment

---

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Income created successfully",
  "context": {
    "income_id": 12345,
    "receipt_no": "COL-2024-001234",
    "total_amount": 7000.0,
    "details_count": 2
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Payment sequence violation: Term 1 must be completed before Term 2",
  "context": {}
}
```

---

## Payment Types Supported

### 1. Book Fee (`BOOK_FEE`)

- **Must be paid in full** - partial payments not allowed
- Must be paid before any tuition term payments (unless paid in same transaction)
- No `term_number` or `payment_month` required
- Requires `enrollment_id` (automatically resolved from `admission_no`)

### 2. Tuition Fee (`TUITION_FEE`)

- **Sequential payment required**: Term 1 → Term 2 → Term 3
- Supports **multi-term payments** in single transaction (e.g., Term 1 + Term 2)
- Supports **mixed payments**: Full Term 1 + Partial Term 2
- **Partial payments allowed** for each term
- Requires `term_number`: 1, 2, or 3
- Requires `enrollment_id` (automatically resolved)

### 3. Transport Fee (`TRANSPORT_FEE`)

- **Monthly payments** (not term-based)
- **Sequential payment required**: Must pay months in order
- Supports **multi-month payments** in single transaction
- Requires `payment_month` (YYYY-MM-01 format, first day of month)
- Requires active transport assignment for the student
- Requires `enrollment_id` (automatically resolved)

### 4. Other Fee (`OTHER`)

- Custom purpose payments
- Requires `custom_purpose_name`
- No `term_number` or `payment_month` required

---

## End-to-End Flow

### 1. Router Layer (`income_router.py`)

```python
@router.post("/pay-fee/{admission_no}")
async def pay_fee_by_admission(
    admission_no: str,
    payload: PayFeeByAdmissionRequest,
    service: CollegeIncomeService = Depends(get_college_income_service),
    user: dict = Depends(required_roles(["ADMIN", "ACCOUNTANT","INSTITUTE_ADMIN"])),
)
```

**What happens:**

- Validates user authentication and authorization
- Extracts `admission_no` from URL path
- Validates request body structure (Pydantic validation)
- Passes to service layer

**Edge Cases:**

- Invalid `admission_no` format → 422 Validation Error
- Missing or invalid request body → 422 Validation Error
- Unauthorized user → 403 Forbidden

---

### 2. Service Layer (`income_service.py`)

```python
async def pay_fee_by_admission(
    self,
    *,
    user: dict[str, Any],
    admission_no: str,
    payload: PayFeeByAdmissionRequest,
) -> dict:
```

**What happens:**

1. Calls repository method with:

   - `branch_id` from user context
   - `admission_no` from request
   - `academic_year_id` from user context
   - `payload` details
   - `created_by` user ID

2. **Checks response success:**

   - If `success: false` → Raises HTTPException (400 Bad Request)
   - If `success: true` → Proceeds to SMS notification

3. **Sends SMS notification** (non-blocking):

   - Prepares payment details for SMS
   - Calculates total amount
   - Sends confirmation SMS
   - **Errors in SMS don't fail the payment** (logged only)

4. Returns response data

**Edge Cases:**

- Repository returns error → HTTPException with error message
- SMS service unavailable → Payment succeeds, SMS fails silently (logged)

---

### 3. Repository Layer (`income_repo.py`)

```python
async def pay_fee_by_admission(
    self,
    *,
    branch_id: int,
    admission_no: str,
    academic_year_id: int,
    payload: PayFeeByAdmissionRequest,
    created_by: int,
) -> dict:
```

**What happens:**

#### Step 1: Resolve Student ID

```sql
SELECT student_id
FROM college.students
WHERE branch_id = :branch_id
  AND admission_no = :admission_no
```

**Edge Cases:**

- Student not found → Returns `{"success": false, "message": "Student not found..."}`
- Multiple students with same admission_no → Returns first match (should not happen in production)

#### Step 2: Resolve Enrollment ID

```sql
SELECT enrollment_id
FROM college.student_enrollments
WHERE branch_id = :branch_id
  AND student_id = :student_id
  AND academic_year_id = :academic_year_id
  AND is_active = TRUE
```

**Edge Cases:**

- No active enrollment → Returns `{"success": false, "message": "Active enrollment not found..."}`
- Multiple active enrollments → Returns first match (should not happen)

#### Step 3: Prepare JSON Payload

Converts Python objects to JSON for database function:

```python
details_json = []
for detail in payload.details:
    detail_dict = {
        "purpose": detail.purpose.value,
        "custom_purpose_name": detail.custom_purpose_name or "",
        "term_number": detail.term_number,
        "paid_amount": float(detail.paid_amount),
        "payment_method": detail.payment_method.value
    }
    if detail.payment_month is not None:
        detail_dict["payment_month"] = detail.payment_month.strftime("%Y-%m-%d")
    details_json.append(detail_dict)
```

**Edge Cases:**

- Empty details array → Returns `{"success": false, "message": "No payment details provided"}`
- Invalid date format → Python validation error (caught by Pydantic)

#### Step 4: Call Database Function

```sql
SELECT college.create_income_with_details_func(
    :p_branch_id,           -- INT
    :p_created_by,          -- INT
    :p_details,             -- JSONB
    :p_reservation_id,      -- INT (NULL for admission payments)
    :p_student_id,          -- BIGINT
    :p_enrollment_id,       -- BIGINT
    :p_academic_year_id     -- INT
)
```

**Transaction Management:**

- Function executes in database transaction
- If validation fails → Transaction rolled back, no records created
- If processing fails → Transaction rolled back, no records created
- On success → Transaction committed

**Edge Cases:**

- Database connection error → Exception caught, rollback, returns error
- Function returns NULL → Returns `{"success": false, "message": "Failed to create income record..."}`

---

### 4. Database Function Layer (`college_income_functions.sql`)

#### Function: `college.create_income_with_details_func`

**Two-Phase Approach:**

##### Phase 1: VALIDATION PHASE

All validations performed **before** creating any records:

1. **Input Validation:**

   - Checks required parameters (branch_id, created_by, details)
   - Validates details array is not empty

2. **Academic Year Resolution:**

   - If not provided, resolves from enrollment or student record
   - Validates academic year exists

3. **Payment Method Validation:**

   - Validates each detail has valid payment method (CASH or ONLINE)

4. **Purpose-Specific Validations:**

   **BOOK_FEE:**

   - Validates enrollment exists
   - Validates `tuition_fee_balances` record exists
   - Validates book fee amount matches exactly (no partial payments)
   - Validates book fee is configured (> 0)

   **TUITION_FEE:**

   - Validates enrollment exists
   - Validates `tuition_fee_balances` record exists
   - Validates term_number is 1, 2, or 3
   - Calls `validate_tuition_fee_comprehensive()` which checks:
     - Book fee prerequisite (unless book fee in same transaction)
     - Sequential term payment order
     - Mixed payment scenarios (full + partial)
     - Payment amount doesn't exceed balance

   **TRANSPORT_FEE:**

   - Validates enrollment exists
   - Validates payment_month provided
   - Validates transport assignment exists and is active
   - Validates payment_month within assignment period
   - Validates payment_month within academic year
   - Calls `validate_transport_fee_payment()` for individual validation
   - Calls `validate_sequential_transport_payment()` for multi-month validation

   **OTHER:**

   - Validates enrollment exists
   - Validates custom_purpose_name provided

5. **Multi-Payment Validations:**
   - Checks for duplicate transport payment months in same transaction
   - Validates sequential transport payments if multiple months
   - Validates tuition term sequence if multiple terms

##### Phase 2: PROCESSING PHASE

Only executed if **all validations pass**:

1. **Create Income Header:**

   ```sql
   INSERT INTO college.income(
       branch_id, reservation_id, student_id, enrollment_id,
       academic_year_id, total_amount, created_by, created_at
   )
   VALUES (...)
   RETURNING income_id;
   ```

   - Initially sets `total_amount = 0`
   - Will be updated after all details processed

2. **Process Each Detail:**

   For each detail in the array:

   a. **Call Purpose-Specific Processing Function:**

   - `process_book_fee()` - Updates tuition_fee_balances
   - `process_tuition_fee()` - Updates tuition_fee_balances
   - `process_transport_fee()` - Creates/updates transport_monthly_payments
   - `process_other_fee()` - No database updates (validation only)

   b. **Create Income Detail Record:**

   ```sql
   INSERT INTO college.income_details(
       income_id, reservation_id, student_id, enrollment_id,
       purpose, custom_purpose_name, term_number, paid_amount,
       payment_method, created_by, created_at
   )
   VALUES (...)
   RETURNING income_detail_id;
   ```

   c. **Special Handling for Transport Fees:**

   - Collects `income_detail_id` for each transport payment
   - After all details processed, calls `process_multiple_transport_fees()`
   - Links transport payments to income details

3. **Update Income Header:**

   ```sql
   UPDATE college.income
   SET total_amount = :total_amount,
       updated_at = NOW()
   WHERE income_id = :income_id;
   ```

4. **Return Success Response:**
   ```json
   {
     "success": true,
     "message": "Income created successfully",
     "context": {
       "income_id": 12345,
       "receipt_no": "COL-2024-001234",
       "total_amount": 7000.0,
       "details_count": 2
     }
   }
   ```

---

## Validation Rules

### 1. Book Fee Rules

- ✅ **Must be paid in full** - Partial payments not allowed
- ✅ **Must be paid before tuition fees** (unless paid in same transaction)
- ✅ **One-time payment** - Cannot be paid twice

**Example Error:**

```json
{
  "success": false,
  "message": "Book fee must be paid in full: paid_amount 1000 must equal book_fee 2000. Partial payments not allowed."
}
```

### 2. Tuition Fee Rules

- ✅ **Sequential payment required**: Term 1 → Term 2 → Term 3
- ✅ **Multi-term payments allowed**: Can pay Term 1 + Term 2 in one transaction
- ✅ **Mixed payments allowed**: Full Term 1 + Partial Term 2
- ✅ **Partial payments allowed** for each term
- ✅ **Cannot skip terms**: Cannot pay Term 2 if Term 1 not fully paid

**Example Errors:**

```json
{
  "success": false,
  "message": "Payment sequence violation: Term 1 must be completed before Term 2"
}
```

```json
{
  "success": false,
  "message": "Payment amount validation failed: paid_amount 6000 exceeds remaining_balance 5000 for Term 1"
}
```

### 3. Transport Fee Rules

- ✅ **Sequential payment required**: Must pay months in chronological order
- ✅ **Multi-month payments allowed**: Can pay multiple consecutive months
- ✅ **Active transport assignment required**
- ✅ **Payment month must be within assignment period**
- ✅ **Payment month must be within academic year**
- ✅ **No duplicate months** in same transaction

**Example Errors:**

```json
{
  "success": false,
  "message": "Sequential payment validation failed: Cannot pay for Jan 2024. Please pay pending months first: Dec 2023"
}
```

```json
{
  "success": false,
  "message": "Transport assignment not found: Student does not have active transport assignment for enrollment_id 123 and payment_month Jan 2024"
}
```

---

## Edge Cases & Error Handling

### 1. Student Not Found

**Scenario:** Admission number doesn't exist in database

**Response:**

```json
{
  "success": false,
  "message": "Student not found with admission number: ABC123"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error message to user
- Suggest checking admission number
- Allow user to retry with correct admission number

---

### 2. No Active Enrollment

**Scenario:** Student exists but has no active enrollment for the academic year

**Response:**

```json
{
  "success": false,
  "message": "Active enrollment not found for admission number: ABC123"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error message
- Suggest checking if student is enrolled for the academic year
- May need to create enrollment first

---

### 3. Book Fee Prerequisite Not Met

**Scenario:** Trying to pay tuition fee before book fee is paid

**Response:**

```json
{
  "success": false,
  "message": "Book fee prerequisite validation failed: Book fee of 2000 must be paid before tuition fees. Currently paid: 0, Remaining: 2000"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error with remaining book fee amount
- Suggest adding book fee to transaction or paying it first
- Show book fee amount in UI before allowing tuition payment

---

### 4. Sequential Payment Violation

**Scenario:** Trying to pay Term 2 before Term 1 is fully paid

**Response:**

```json
{
  "success": false,
  "message": "Payment sequence violation: Term 1 must be completed before Term 2"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error message
- Show current payment status for each term
- Disable payment buttons for terms that cannot be paid yet
- Suggest paying previous terms first

---

### 5. Payment Amount Exceeds Balance

**Scenario:** Trying to pay more than remaining balance

**Response:**

```json
{
  "success": false,
  "message": "Payment amount validation failed: paid_amount 6000 exceeds remaining_balance 5000 for Term 1"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error with remaining balance
- Pre-fill payment amount with remaining balance
- Validate amount on frontend before submission

---

### 6. Book Fee Partial Payment

**Scenario:** Trying to pay partial book fee amount

**Response:**

```json
{
  "success": false,
  "message": "Book fee must be paid in full: paid_amount 1000 must equal book_fee 2000. Partial payments not allowed."
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error message
- Auto-fill book fee amount with full amount
- Disable partial payment option for book fee

---

### 7. Transport Fee - No Active Assignment

**Scenario:** Student doesn't have active transport assignment

**Response:**

```json
{
  "success": false,
  "message": "Transport assignment not found: Student does not have active transport assignment for enrollment_id 123 and payment_month Jan 2024"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error message
- Hide transport fee payment option if no assignment
- Suggest creating transport assignment first

---

### 8. Transport Fee - Sequential Violation

**Scenario:** Trying to pay a month before previous months are paid

**Response:**

```json
{
  "success": false,
  "message": "Sequential payment validation failed: Cannot pay for Jan 2024. Please pay pending months first: Dec 2023"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display error with list of pending months
- Show payment status for each month
- Disable payment for months that cannot be paid yet
- Suggest paying pending months first

---

### 9. Duplicate Payment Months

**Scenario:** Including same month twice in transport fee payments

**Response:**

```json
{
  "success": false,
  "message": "Duplicate payment months found in same transaction: Jan 2024. Each month can only be paid once per transaction."
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Validate on frontend before submission
- Show error if duplicate months detected
- Remove duplicate entries automatically

---

### 10. Missing Required Fields

**Scenario:** Missing required fields for specific payment types

**Response Examples:**

```json
{
  "success": false,
  "message": "Missing required parameter: term_number for TUITION_FEE"
}
```

```json
{
  "success": false,
  "message": "Missing required parameter: payment_month for TRANSPORT_FEE"
}
```

```json
{
  "success": false,
  "message": "Missing required parameter: custom_purpose_name for OTHER"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Validate required fields before submission
- Show field-level validation errors
- Disable submit button until all required fields filled

---

### 11. Database Transaction Failure

**Scenario:** Database error during processing

**Response:**

```json
{
  "success": false,
  "message": "Failed to create income record - no result from database function",
  "error_type": "database_error"
}
```

**HTTP Status:** 400 Bad Request

**Frontend Handling:**

- Display generic error message
- Log error for debugging
- Suggest retrying the payment
- No partial records created (transaction rolled back)

---

### 12. SMS Notification Failure

**Scenario:** Payment succeeds but SMS notification fails

**Response:** Payment still succeeds (200 OK)

**Frontend Handling:**

- Payment is successful
- SMS failure is logged but doesn't affect payment
- May want to show warning message to user
- Can manually resend SMS if needed

---

## SQL Functions & Queries

### Main Function: `college.create_income_with_details_func`

**Signature:**

```sql
CREATE OR REPLACE FUNCTION college.create_income_with_details_func(
    p_branch_id INT,
    p_created_by INT,
    p_details JSONB,
    p_reservation_id INT DEFAULT NULL,
    p_student_id BIGINT DEFAULT NULL,
    p_enrollment_id BIGINT DEFAULT NULL,
    p_academic_year_id INT DEFAULT NULL
) RETURNS JSONB
```

**Key Features:**

- Two-phase validation and processing
- Transaction-safe (all-or-nothing)
- Returns JSONB response with success/error status

---

### Helper Functions

#### 1. `college.process_book_fee(p_enrollment_id BIGINT, p_amount NUMERIC)`

**Purpose:** Process book fee payment

**SQL:**

```sql
UPDATE college.tuition_fee_balances
SET book_paid = p_amount,
    book_paid_status = 'FULLY_PAID',
    overall_balance_fee = term1_balance + term2_balance + term3_balance + (book_fee - book_paid),
    updated_at = NOW()
WHERE enrollment_id = p_enrollment_id;
```

**Validations:**

- Enrollment exists
- `tuition_fee_balances` record exists
- Book fee configured (> 0)
- Book fee not already fully paid
- Payment amount equals full book fee (no partial payments)

---

#### 2. `college.process_tuition_fee(p_enrollment_id BIGINT, p_term_number INT, p_amount NUMERIC)`

**Purpose:** Process tuition fee payment for specific term

**SQL (Term 1 example):**

```sql
UPDATE college.tuition_fee_balances
SET term1_paid = LEAST(term1_paid + p_amount, term1_amount),
    term1_balance = GREATEST(term1_amount - LEAST(term1_paid + p_amount, term1_amount), 0),
    term1_status = CASE
        WHEN LEAST(term1_paid + p_amount, term1_amount) >= term1_amount
            THEN 'FULLY_PAID'
        ELSE 'PARTIALLY_PAID'
    END,
    overall_balance_fee = GREATEST(term1_amount - LEAST(term1_paid + p_amount, term1_amount), 0) +
                          term2_balance + term3_balance + (book_fee - book_paid),
    updated_at = NOW()
WHERE enrollment_id = p_enrollment_id;
```

**Validations:**

- Enrollment exists
- `tuition_fee_balances` record exists
- Term number is 1, 2, or 3
- Sequential payment order (Term 1 before Term 2, Term 2 before Term 3)
- Payment amount doesn't exceed remaining balance

---

#### 3. `college.process_transport_fee(...)`

**Purpose:** Process transport fee payment for specific month

**SQL (Create new payment):**

```sql
INSERT INTO college.transport_monthly_payments (
    transport_assignment_id,
    branch_id,
    academic_year_id,
    payment_month,
    amount_paid,
    income_detail_id,
    created_at,
    updated_at
) VALUES (...);
```

**SQL (Update existing payment):**

```sql
UPDATE college.transport_monthly_payments
SET amount_paid = p_amount,
    income_detail_id = p_income_detail_id,
    updated_at = NOW()
WHERE payment_id = v_existing_payment.payment_id;
```

**Validations:**

- Enrollment exists
- Active transport assignment exists
- Payment month within assignment period
- Payment month within academic year
- Payment not already processed for the month

---

#### 4. `college.process_multiple_transport_fees(...)`

**Purpose:** Process multiple transport fee payments in batch

**Features:**

- Processes array of payment months and amounts
- Validates sequential order
- Creates or updates payment records
- Links to income detail records

---

### Validation Functions

#### 1. `college.validate_book_fee_prerequisite(...)`

**Purpose:** Validate book fee is paid before tuition fees

**Logic:**

- Checks if book fee exists and is not fully paid
- Skips check if book fee included in same transaction

---

#### 2. `college.validate_sequential_term_payment(...)`

**Purpose:** Validate tuition term payment sequence

**Logic:**

- Validates Term 2 cannot be paid before Term 1 fully paid
- Validates Term 3 cannot be paid before Term 2 fully paid
- Supports multi-term validation in same transaction

---

#### 3. `college.validate_mixed_term_payment(...)`

**Purpose:** Validate mixed payment scenarios (full + partial)

**Logic:**

- Validates previous terms must be paid in full
- Only last term in sequence can be partial
- Example: Term 1 (full) + Term 2 (partial) is allowed
- Example: Term 1 (partial) + Term 2 (full) is not allowed

---

#### 4. `college.validate_tuition_fee_comprehensive(...)`

**Purpose:** Comprehensive tuition fee validation

**Calls:**

- `validate_book_fee_prerequisite()`
- `validate_sequential_term_payment()`
- `validate_mixed_term_payment()`

---

#### 5. `college.validate_transport_fee_payment(...)`

**Purpose:** Validate individual transport fee payment

**Validations:**

- Enrollment exists
- Transport assignment exists and active
- Payment month within assignment period
- Payment month within academic year
- Sequential payment order (if enabled)

---

#### 6. `college.validate_sequential_transport_payment(...)`

**Purpose:** Validate sequential transport payments for multiple months

**Validations:**

- Months are consecutive
- No unpaid months before first payment month
- All months within assignment period

---

## Frontend Integration Guide

### 1. Request Example (JavaScript/TypeScript)

```typescript
interface PaymentDetail {
  purpose: "TUITION_FEE" | "BOOK_FEE" | "TRANSPORT_FEE" | "OTHER";
  term_number?: number; // Required for TUITION_FEE: 1, 2, or 3
  paid_amount: number; // > 0, <= 1000000, max 2 decimals
  payment_method: "CASH" | "ONLINE";
  custom_purpose_name?: string; // Required for OTHER
  payment_month?: string; // Required for TRANSPORT_FEE (YYYY-MM-01)
}

interface PayFeeRequest {
  details: PaymentDetail[];
  remarks?: string;
}

async function payFee(admissionNo: string, request: PayFeeRequest) {
  try {
    const response = await fetch(
      `/api/v1/college/income/pay-fee/${admissionNo}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle error response
      throw new Error(data.detail || data.message || "Payment failed");
    }

    // Handle success
    return data;
  } catch (error) {
    console.error("Payment error:", error);
    throw error;
  }
}
```

### 2. Usage Examples

#### Example 1: Pay Tuition Fee (Term 1)

```typescript
const request: PayFeeRequest = {
  details: [
    {
      purpose: "TUITION_FEE",
      term_number: 1,
      paid_amount: 5000.0,
      payment_method: "CASH",
    },
  ],
  remarks: "Term 1 payment",
};

await payFee("ABC123", request);
```

#### Example 2: Pay Multiple Fees

```typescript
const request: PayFeeRequest = {
  details: [
    {
      purpose: "BOOK_FEE",
      paid_amount: 2000.0,
      payment_method: "ONLINE",
    },
    {
      purpose: "TUITION_FEE",
      term_number: 1,
      paid_amount: 5000.0,
      payment_method: "CASH",
    },
  ],
};

await payFee("ABC123", request);
```

#### Example 3: Pay Transport Fee

```typescript
const request: PayFeeRequest = {
  details: [
    {
      purpose: "TRANSPORT_FEE",
      paid_amount: 1500.0,
      payment_method: "CASH",
      payment_month: "2024-01-01", // First day of month
    },
  ],
};

await payFee("ABC123", request);
```

#### Example 4: Pay Multiple Transport Months

```typescript
const request: PayFeeRequest = {
  details: [
    {
      purpose: "TRANSPORT_FEE",
      paid_amount: 1500.0,
      payment_method: "CASH",
      payment_month: "2024-01-01",
    },
    {
      purpose: "TRANSPORT_FEE",
      paid_amount: 1500.0,
      payment_method: "CASH",
      payment_month: "2024-02-01",
    },
  ],
};

await payFee("ABC123", request);
```

### 3. Error Handling

```typescript
async function payFeeWithErrorHandling(
  admissionNo: string,
  request: PayFeeRequest
) {
  try {
    const response = await fetch(
      `/api/v1/college/income/pay-fee/${admissionNo}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Parse error message
      const errorMessage = data.detail || data.message || "Payment failed";

      // Handle specific error types
      if (errorMessage.includes("Student not found")) {
        showError("Student not found. Please check the admission number.");
      } else if (errorMessage.includes("Active enrollment not found")) {
        showError("Student is not enrolled for this academic year.");
      } else if (errorMessage.includes("Payment sequence violation")) {
        showError("Please pay previous terms/months first.");
      } else if (errorMessage.includes("exceeds remaining_balance")) {
        showError("Payment amount exceeds remaining balance.");
      } else if (errorMessage.includes("must be paid in full")) {
        showError(
          "This fee must be paid in full. Partial payments are not allowed."
        );
      } else {
        showError(errorMessage);
      }

      return null;
    }

    // Success
    showSuccess(`Payment successful! Receipt: ${data.context.receipt_no}`);
    return data;
  } catch (error) {
    console.error("Payment error:", error);
    showError("An unexpected error occurred. Please try again.");
    return null;
  }
}
```

### 4. Frontend Validation

```typescript
function validatePaymentDetail(detail: PaymentDetail): string[] {
  const errors: string[] = [];

  // Validate purpose
  if (!detail.purpose) {
    errors.push("Purpose is required");
  }

  // Validate term_number for TUITION_FEE
  if (detail.purpose === "TUITION_FEE") {
    if (!detail.term_number || ![1, 2, 3].includes(detail.term_number)) {
      errors.push("Term number must be 1, 2, or 3 for tuition fee");
    }
  }

  // Validate payment_month for TRANSPORT_FEE
  if (detail.purpose === "TRANSPORT_FEE") {
    if (!detail.payment_month) {
      errors.push("Payment month is required for transport fee");
    } else {
      // Validate format (YYYY-MM-01)
      const date = new Date(detail.payment_month);
      if (date.getDate() !== 1) {
        errors.push(
          "Payment month must be the first day of the month (YYYY-MM-01)"
        );
      }
    }
  }

  // Validate custom_purpose_name for OTHER
  if (detail.purpose === "OTHER") {
    if (
      !detail.custom_purpose_name ||
      detail.custom_purpose_name.trim() === ""
    ) {
      errors.push("Custom purpose name is required for other fees");
    }
  }

  // Validate paid_amount
  if (detail.paid_amount <= 0) {
    errors.push("Payment amount must be greater than 0");
  }
  if (detail.paid_amount > 1000000) {
    errors.push("Payment amount cannot exceed ₹10,00,000");
  }
  // Check decimal places
  if (detail.paid_amount !== Math.round(detail.paid_amount * 100) / 100) {
    errors.push("Payment amount can have maximum 2 decimal places");
  }

  return errors;
}

function validatePaymentRequest(request: PayFeeRequest): string[] {
  const errors: string[] = [];

  // Validate details array
  if (!request.details || request.details.length === 0) {
    errors.push("At least one payment detail is required");
    return errors;
  }

  // Validate each detail
  request.details.forEach((detail, index) => {
    const detailErrors = validatePaymentDetail(detail);
    if (detailErrors.length > 0) {
      errors.push(`Detail ${index + 1}: ${detailErrors.join(", ")}`);
    }
  });

  // Check for duplicate transport payment months
  const transportMonths = request.details
    .filter((d) => d.purpose === "TRANSPORT_FEE" && d.payment_month)
    .map((d) => d.payment_month);

  const uniqueMonths = new Set(transportMonths);
  if (transportMonths.length !== uniqueMonths.size) {
    errors.push("Duplicate payment months found in transport fees");
  }

  return errors;
}
```

### 5. UI Recommendations

1. **Payment Form:**

   - Show available fees with current balance
   - Disable payment buttons for fees that cannot be paid yet
   - Show payment status (Not Paid, Partially Paid, Fully Paid)
   - Auto-fill amounts for book fee (full amount)
   - Validate amounts before submission

2. **Error Display:**

   - Show field-level validation errors
   - Display server error messages clearly
   - Provide actionable error messages
   - Suggest solutions for common errors

3. **Success Handling:**

   - Display receipt number
   - Show payment summary
   - Option to download/print receipt
   - Option to send receipt via email/SMS

4. **Loading States:**
   - Show loading indicator during payment processing
   - Disable form during submission
   - Prevent duplicate submissions

---

## Summary

The `POST /income/pay-fee/{admission_no}` endpoint provides a comprehensive payment processing system with:

- ✅ **Multiple payment types** in single transaction
- ✅ **Comprehensive validation** at all layers
- ✅ **Business rule enforcement** (sequential payments, prerequisites)
- ✅ **Transaction safety** (all-or-nothing)
- ✅ **Clear error messages** for frontend handling
- ✅ **SMS notifications** (non-blocking)
- ✅ **Receipt generation** support

**Key Points for Frontend Developers:**

1. Always validate required fields before submission
2. Handle all error cases gracefully
3. Show payment status and balances before allowing payments
4. Enforce sequential payment rules in UI
5. Validate amounts and formats on frontend
6. Display clear, actionable error messages
7. Handle success cases with receipt information

---

## Additional Resources

- Database Schema: `college.income`, `college.income_details`
- Related Tables: `college.tuition_fee_balances`, `college.transport_monthly_payments`
- Related Functions: See `Design/college_income_functions.sql`
- Receipt Generation: Use `GET /income/{income_id}/receipt` endpoint

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0
