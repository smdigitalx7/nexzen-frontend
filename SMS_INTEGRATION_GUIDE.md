# SMS Integration Guide for Frontend Developers

This guide provides comprehensive documentation for integrating with the SMS-related APIs in the NexZen ERP Backend system. It covers all endpoints, request/response formats, validation rules, and error handling.

---

## Table of Contents

1. [SMS Templates API](#sms-templates-api)
2. [SMS Configuration API](#sms-configuration-api)
3. [Announcements API](#announcements-api)
4. [SMS Reports API](#sms-reports-api)
5. [Common Error Responses](#common-error-responses)
6. [Authentication & Authorization](#authentication--authorization)

---

## SMS Templates API

### Base URL
`/api/v1/public/sms-templates`

### Overview
The SMS Templates API allows you to manage SMS templates that are used for sending DLT-compliant SMS messages. Templates can be categorized as either `AUTO` (system-generated) or `MANUAL` (user-created). Only `MANUAL` templates are returned by the list endpoint and can be used for announcements.

---

### 1. Get All Templates

**Endpoint:** `GET /api/v1/public/sms-templates`

**Description:** Retrieves all manual SMS templates for the current institute.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Request Parameters:** None

**Response:** `200 OK`
```json
[
  {
    "template_id": 1,
    "institute_id": 5,
    "template_key": "EXAM_SCHEDULE",
    "template_name": "Exam Schedule Notification",
    "dlt_template_id": "10071234567890",
    "message": 123456,
    "content": "Dear {var1}, your exam schedule for {var2} is available.",
    "variable_names": ["var1", "var2"],
    "category": "MANUAL",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:45:00Z"
  }
]
```

**Possible Errors:**
- `400 Bad Request`: Institute ID is required (if user payload is missing institute_id)
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 2. Get Template by ID

**Endpoint:** `GET /api/v1/public/sms-templates/{template_id}`

**Description:** Retrieves a specific SMS template by its ID.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Path Parameters:**
- `template_id` (integer, required): The ID of the template to retrieve

**Response:** `200 OK`
```json
{
  "template_id": 1,
  "institute_id": 5,
  "template_key": "EXAM_SCHEDULE",
  "template_name": "Exam Schedule Notification",
  "dlt_template_id": "10071234567890",
  "message": 123456,
  "content": "Dear {var1}, your exam schedule for {var2} is available.",
  "variable_names": ["var1", "var2"],
  "category": "MANUAL",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-20T14:45:00Z"
}
```

**Possible Errors:**
- `404 Not Found`: Template not found or doesn't belong to the user's institute
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 3. Create Template

**Endpoint:** `POST /api/v1/public/sms-templates`

**Description:** Creates a new SMS template for the current institute.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Request Body:**
```json
{
  "template_key": "PAYMENT_REMINDER",
  "template_name": "Payment Reminder",
  "dlt_template_id": "10071234567891",
  "message": 123457,
  "content": "Dear {student_name}, your payment of {amount} for {fee_type} is due on {due_date}.",
  "variable_names": ["student_name", "amount", "fee_type", "due_date"],
  "category": "MANUAL",
  "is_active": true
}
```

**Field Validations:**
- `template_key` (string, required, max 50 chars): Unique key identifier (e.g., "PAYMENT", "OTP")
- `template_name` (string, required, max 100 chars): Human-readable display name
- `dlt_template_id` (string, required, max 50 chars): DLT Template ID from provider (e.g., "10071234567890")
- `message` (integer, optional): 6-digit Message ID
- `content` (string, required): Template content with placeholders (e.g., "{var1}", "{var2}")
- `variable_names` (array of strings, optional, default: []): List of variable names in order
- `category` (enum, optional, default: "AUTO"): Either "AUTO" or "MANUAL"
- `is_active` (boolean, optional, default: true): Whether the template is active

**Response:** `201 Created`
```json
{
  "template_id": 2,
  "institute_id": 5,
  "template_key": "PAYMENT_REMINDER",
  "template_name": "Payment Reminder",
  "dlt_template_id": "10071234567891",
  "message": 123457,
  "content": "Dear {student_name}, your payment of {amount} for {fee_type} is due on {due_date}.",
  "variable_names": ["student_name", "amount", "fee_type", "due_date"],
  "category": "MANUAL",
  "is_active": true,
  "created_at": "2025-01-26T10:00:00Z",
  "updated_at": null
}
```

**Possible Errors:**
- `400 Bad Request`: 
  - Institute ID is required
  - Validation errors (missing required fields, invalid enum values, string length violations)
  - Duplicate template_key for the institute (unique constraint violation)
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 4. Update Template

**Endpoint:** `PUT /api/v1/public/sms-templates/{template_id}`

**Description:** Updates an existing SMS template. All fields are optional - only provided fields will be updated.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Path Parameters:**
- `template_id` (integer, required): The ID of the template to update

**Request Body:** (All fields optional)
```json
{
  "template_name": "Updated Payment Reminder",
  "content": "Dear {student_name}, please pay {amount} by {due_date}.",
  "variable_names": ["student_name", "amount", "due_date"],
  "is_active": false
}
```

**Field Validations:**
- `template_name` (string, optional, max 100 chars)
- `dlt_template_id` (string, optional, max 50 chars)
- `message` (integer, optional)
- `content` (string, optional)
- `variable_names` (array of strings, optional)
- `category` (enum, optional): "AUTO" or "MANUAL"
- `is_active` (boolean, optional)

**Response:** `200 OK`
```json
{
  "template_id": 2,
  "institute_id": 5,
  "template_key": "PAYMENT_REMINDER",
  "template_name": "Updated Payment Reminder",
  "dlt_template_id": "10071234567891",
  "message": 123457,
  "content": "Dear {student_name}, please pay {amount} by {due_date}.",
  "variable_names": ["student_name", "amount", "due_date"],
  "category": "MANUAL",
  "is_active": false,
  "created_at": "2025-01-26T10:00:00Z",
  "updated_at": "2025-01-26T11:30:00Z"
}
```

**Possible Errors:**
- `404 Not Found`: Template not found or doesn't belong to the user's institute
- `400 Bad Request`: Validation errors (invalid enum values, string length violations)
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 5. Delete Template

**Endpoint:** `DELETE /api/v1/public/sms-templates/{template_id}`

**Description:** Deletes an SMS template.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Path Parameters:**
- `template_id` (integer, required): The ID of the template to delete

**Response:** `200 OK`
```json
{
  "message": "Template deleted successfully"
}
```

**Possible Errors:**
- `404 Not Found`: Template not found or doesn't belong to the user's institute
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

## SMS Configuration API

### Base URL
`/api/v1/public/sms-config`

### Overview
The SMS Configuration API manages SMS provider settings for an institute. This includes API keys, routing options, DLT settings, and sender IDs. The API key is encrypted in the database and never exposed in responses.

---

### 1. Get SMS Configuration

**Endpoint:** `GET /api/v1/public/sms-config`

**Description:** Retrieves the SMS configuration for the current institute.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Request Parameters:** None

**Response:** `200 OK`
```json
{
  "sms_config_id": 1,
  "institute_id": 5,
  "sms_api_key": null,
  "sms_route": "dlt",
  "sms_flash": false,
  "dlt_entity_id": "1234567890123456",
  "sender_id": "NZNEDU",
  "is_active": true,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-20T14:00:00Z"
}
```

**Important Notes:**
- `sms_api_key` is always `null` in responses for security reasons (it's encrypted in the database)
- The API key is only used internally when sending SMS

**Possible Errors:**
- `404 Not Found`: SMS configuration not found for the institute
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 2. Create SMS Configuration

**Endpoint:** `POST /api/v1/public/sms-config`

**Description:** Creates SMS configuration for the current institute.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Request Body:**
```json
{
  "sms_api_key": "your-api-key-here",
  "sms_route": "dlt",
  "sms_flash": false,
  "dlt_entity_id": "1234567890123456",
  "sender_id": "NZNEDU",
  "is_active": true
}
```

**Field Validations:**
- `sms_api_key` (string, optional, max 255 chars): SMS provider API key (will be encrypted)
- `sms_route` (string, required, default: "dlt"): Must be one of: `"q"`, `"dlt"`, `"dlt_manual"`, `"otp"`
- `sms_flash` (boolean, optional, default: false): Send flash SMS
- `dlt_entity_id` (string, optional, max 50 chars): DLT Entity ID for compliance
- `sender_id` (string, required, default: "NZNEDU", max 20 chars): Global Sender ID / Header
- `is_active` (boolean, optional, default: true): Whether the configuration is active

**Response:** `201 Created`
```json
{
  "sms_config_id": 1,
  "institute_id": 5,
  "sms_api_key": null,
  "sms_route": "dlt",
  "sms_flash": false,
  "dlt_entity_id": "1234567890123456",
  "sender_id": "NZNEDU",
  "is_active": true,
  "created_at": "2025-01-26T10:00:00Z",
  "updated_at": null
}
```

**Possible Errors:**
- `400 Bad Request`: 
  - Validation errors (invalid `sms_route` value, string length violations)
  - Institute ID is required
- `409 Conflict`: SMS configuration already exists for the institute
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

### 3. Update SMS Configuration

**Endpoint:** `PUT /api/v1/public/sms-config`

**Description:** Updates SMS configuration for the current institute. All fields are optional - only provided fields will be updated.

**Authentication:** Required - `INSTITUTE_ADMIN` or `ADMIN` role

**Request Body:** (All fields optional)
```json
{
  "sms_api_key": "new-api-key-here",
  "sms_route": "dlt_manual",
  "sms_flash": true,
  "dlt_entity_id": "9876543210987654",
  "sender_id": "MYINST",
  "is_active": false
}
```

**Field Validations:**
- `sms_api_key` (string, optional, max 255 chars)
- `sms_route` (string, optional): Must be one of: `"q"`, `"dlt"`, `"dlt_manual"`, `"otp"` (if provided)
- `sms_flash` (boolean, optional)
- `dlt_entity_id` (string, optional, max 50 chars)
- `sender_id` (string, optional, max 20 chars)
- `is_active` (boolean, optional)

**Response:** `200 OK`
```json
{
  "sms_config_id": 1,
  "institute_id": 5,
  "sms_api_key": null,
  "sms_route": "dlt_manual",
  "sms_flash": true,
  "dlt_entity_id": "9876543210987654",
  "sender_id": "MYINST",
  "is_active": false,
  "created_at": "2025-01-26T10:00:00Z",
  "updated_at": "2025-01-26T12:00:00Z"
}
```

**Possible Errors:**
- `404 Not Found`: SMS configuration not found for the institute
- `400 Bad Request`: Validation errors (invalid `sms_route` value, string length violations)
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role

---

## Announcements API

### Base URL
`/api/v1/public/announcements`

### Overview
The Announcements API allows you to send bulk SMS announcements to students based on their class or transport route. The system resolves recipient phone numbers based on the selected audience category and enqueues the SMS sending job asynchronously.

**Important Note About SMS Content:**
- The actual SMS message sent to recipients comes from the **template's content** (stored in the database), NOT from the `content` field in the request
- The `template_key` identifies which template to use
- The `template_variables` fill in placeholders in the template's content
- The `title` and `content` fields in the request are required but are **NOT currently used** for SMS sending - they may be intended for future database storage or logging

---

### Send Bulk Announcement

**Endpoint:** `POST /api/v1/public/announcements/send-bulk`

**Description:** Sends bulk announcement SMS to students based on Class or Transport Route. The request is processed asynchronously - the API returns immediately after queuing the job.

**Authentication:** Required - `ADMIN` or `INSTITUTE_ADMIN` role

**Request Body:**
```json
{
  "audience_category": "CLASS",
  "audience_ids": [12, 13, 15],
  "template_key": "EXAM_SCHEDULE",
  "template_variables": {
    "var1": "Exam Schedule",
    "var2": "20th Jan"
  },
  "title": "Exam Update",
  "content": "The exam schedule has been updated. Please check the portal for details."
}
```

**Field Validations:**

1. **`audience_category`** (enum, required):
   - Must be either `"CLASS"` or `"TRANSPORT"`
   - Determines how recipients are resolved:
     - `"CLASS"`: Recipients are students enrolled in the specified classes
     - `"TRANSPORT"`: Recipients are students assigned to the specified transport route

2. **`audience_ids`** (array of integers, optional):
   - For `"CLASS"` category:
     - Can be `null` or empty array to send to ALL classes in the branch
     - Can contain multiple class IDs: `[12, 13, 15]`
   - For `"TRANSPORT"` category:
     - **MUST contain exactly ONE bus route ID**: `[5]`
     - Cannot be `null` or empty
     - Cannot contain more than one ID
   - Validation: If `audience_category` is `"TRANSPORT"`, the system validates that exactly one ID is provided

3. **`template_key`** (string, required):
   - Must be a valid `template_key` from an active `MANUAL` SMS template
   - The template must belong to the user's institute
   - **Important:** Use `template_key` (not `template_id`) in the request
   - The template must have `is_active: true` to be usable
   - Example: `"EXAM_SCHEDULE"`, `"PAYMENT_REMINDER"`, `"ANNOUNCEMENT"`
   - **How to get valid template keys:** Call `GET /api/v1/public/sms-templates` and filter by `is_active: true`

4. **`template_variables`** (object/dictionary, optional, default: `{}`):
   - Key-value pairs for DLT template placeholders
   - Keys should match the `variable_names` from the selected template
   - Example: If template has `variable_names: ["var1", "var2"]`, provide `{"var1": "value1", "var2": "value2"}`
   - Values must be strings

5. **`title`** (string, required, max 100 chars):
   - Announcement title/heading
   - **Current Usage:** This field is passed through the system but is **NOT currently used** in the SMS sending process
   - **Purpose:** Intended for future database storage, logging, or tracking purposes
   - **Note:** The field is required but may not affect the actual SMS message sent

6. **`content`** (string, required):
   - Full announcement content/message
   - **Important:** This field is **NOT used** as the SMS message content
   - **Actual SMS Content:** The SMS message is generated from the selected template's `content` field (from the database) with `template_variables` filled in
   - **Purpose:** This field is passed through the system but may be intended for future database storage or logging
   - **Note:** The actual SMS text comes from the template, not from this field

**How SMS Message is Constructed Using Template Variables:**

**Important:** The actual SMS message sent to recipients is **NOT** from the `content` field in the request. Instead, it follows a DLT (Distributed Ledger Technology) compliant process:

**Step-by-Step Process:**

1. **Template Retrieval:**
   - The system retrieves the template from the database using `template_key`
   - The template contains:
     - `dlt_template_id`: The DLT-registered template ID (e.g., "10071234567890")
     - `message`: The 6-digit message ID (if available)
     - `content`: The template content with placeholders (e.g., "Your {var1} exam is on {var2}.")
     - `variable_names`: Array defining the order of variables (e.g., `["var1", "var2"]`)

2. **Variable Processing:**
   - The system uses the `_build_dlt_variables()` function to process user-provided variables
   - This function:
     - Takes the template's `variable_names` array (defines the order)
     - Takes the user's `template_variables` dictionary (provides the values)
     - Creates a pipe-separated string in the exact order specified by `variable_names`
   
3. **Variable String Creation:**
   ```python
   # Template has: variable_names = ["exam_name", "date"]
   # User provides: template_variables = {"exam_name": "Math", "date": "2025-02-15"}
   # Result: "Math|2025-02-15"
   ```
   - The order is critical - variables must match the order in `variable_names`
   - Missing variables are replaced with empty strings
   - All values are converted to strings

4. **SMS Provider API Call:**
   - The system sends to the SMS provider (Fast2SMS):
     - `message_id`: The DLT message ID (from template)
     - `variables_values`: The pipe-separated variable string (e.g., "Math|2025-02-15")
     - `sender_id`: The approved sender ID
     - `numbers`: Comma-separated phone numbers
   
5. **DLT Template Replacement:**
   - The SMS provider (Fast2SMS) receives the variables and matches them to the DLT-registered template
   - The provider replaces placeholders in the DLT template with the provided values
   - The final SMS is sent to recipients

**Complete Example:**

**Template in Database:**
```json
{
  "template_key": "EXAM_SCHEDULE",
  "dlt_template_id": "10071234567890",
  "message": 123456,
  "content": "Your {var1} exam is scheduled on {var2}. Please be present.",
  "variable_names": ["var1", "var2"]
}
```

**User Request:**
```json
{
  "template_key": "EXAM_SCHEDULE",
  "template_variables": {
    "var1": "Mathematics",
    "var2": "2025-02-15"
  }
}
```

**Backend Processing:**
1. Retrieves template with `variable_names: ["var1", "var2"]`
2. Builds variable string: `"Mathematics|2025-02-15"` (pipe-separated, in order)
3. Sends to SMS provider:
   ```json
   {
     "message": 123456,
     "variables_values": "Mathematics|2025-02-15",
     "sender_id": "NZNEDU",
     "numbers": "9876543210,9876543211"
   }
   ```

**SMS Provider Processing:**
- Fast2SMS receives the variables and matches them to DLT template ID 10071234567890
- Replaces `{var1}` with "Mathematics" and `{var2}` with "2025-02-15"
- **Final SMS sent to recipients:** "Your Mathematics exam is scheduled on 2025-02-15. Please be present."

**Visual Flow Diagram:**

```
User Request
    ↓
{
  "template_key": "EXAM_SCHEDULE",
  "template_variables": {
    "var1": "Mathematics",
    "var2": "2025-02-15"
  }
}
    ↓
Backend: Fetch Template from Database
    ↓
Template Retrieved:
{
  "variable_names": ["var1", "var2"],
  "message": 123456,
  "dlt_template_id": "10071234567890"
}
    ↓
Backend: _build_dlt_variables() Function
    ↓
Process:
1. Get variable order from template.variable_names: ["var1", "var2"]
2. Extract values from template_variables in that order:
   - var1 → "Mathematics"
   - var2 → "2025-02-15"
3. Join with pipe separator: "Mathematics|2025-02-15"
    ↓
Backend: Send to SMS Provider (Fast2SMS)
    ↓
API Payload:
{
  "message": 123456,
  "variables_values": "Mathematics|2025-02-15",
  "sender_id": "NZNEDU",
  "numbers": "9876543210,9876543211"
}
    ↓
SMS Provider: Match to DLT Template
    ↓
DLT Template (registered with provider):
"Your {var1} exam is scheduled on {var2}. Please be present."
    ↓
SMS Provider: Replace Variables
    ↓
Final SMS Sent:
"Your Mathematics exam is scheduled on 2025-02-15. Please be present."
```

**Key Points:**
- **Variable Order is Critical:** The order in `variable_names` determines the order in the pipe-separated string
- **Template Content in Database:** The `content` field in the database is for reference only - the actual template is registered with the SMS provider (DLT)
- **Variable Replacement Location:** Variable replacement happens on the SMS provider side, not in the backend
- **Missing Variables:** If a variable is missing from `template_variables`, an empty string is used (which may cause the SMS to fail DLT validation)
- **Type Conversion:** All variable values are converted to strings before sending (numbers, dates, etc. become strings)
- **Pipe Separator:** Variables are joined with `|` (pipe) character - this is the DLT standard format
- **DLT Compliance:** The template must be pre-registered with the SMS provider and approved by DLT authorities

**The `_build_dlt_variables()` Function Logic:**

```python
def _build_dlt_variables(template, data_map, default_order=None):
    # 1. Get the variable order from template
    vars_list = template.variable_names if template and template.variable_names else default_order
    
    # 2. If no variables, return empty string
    if not vars_list:
        return ""
    
    # 3. Build pipe-separated string in the exact order
    # For each variable name in vars_list, get its value from data_map
    # If variable not found, use empty string ""
    return "|".join(str(data_map.get(var, "")) for var in vars_list)
```

**Example Scenarios:**

**Scenario 1: All Variables Provided**
- Template: `variable_names: ["name", "amount", "date"]`
- User: `template_variables: {"name": "John", "amount": "₹5000", "date": "2025-02-01"}`
- Result: `"John|₹5000|2025-02-01"`

**Scenario 2: Missing Variable**
- Template: `variable_names: ["name", "amount", "date"]`
- User: `template_variables: {"name": "John", "date": "2025-02-01"}` (missing "amount")
- Result: `"John||2025-02-01"` (empty string for missing variable)

**Scenario 3: Extra Variables (Ignored)**
- Template: `variable_names: ["name", "date"]`
- User: `template_variables: {"name": "John", "date": "2025-02-01", "extra": "ignored"}`
- Result: `"John|2025-02-01"` (only variables in `variable_names` are used)

**Scenario 4: Wrong Order (Still Works)**
- Template: `variable_names: ["name", "date"]`
- User: `template_variables: {"date": "2025-02-01", "name": "John"}` (different order)
- Result: `"John|2025-02-01"` (order follows `variable_names`, not user's dict order)

The `content` field in the request is passed through but not used for SMS content. It may be intended for future database storage or logging purposes.

**How Audience Resolution Works:**

- **For CLASS category:**
  - If `audience_ids` is `null` or empty: All active students in all classes of the current branch are selected
  - If `audience_ids` contains class IDs: Only students enrolled in those specific classes are selected
  - Phone numbers are resolved from: `father_or_guardian_mobile` or `mother_or_guardian_mobile` (whichever is available)

- **For TRANSPORT category:**
  - Exactly one bus route ID must be provided in `audience_ids`
  - Only students assigned to that specific transport route are selected
  - Phone numbers are resolved from: `father_or_guardian_mobile` or `mother_or_guardian_mobile` (whichever is available)
  - Only active transport assignments are considered

**Response:** `202 Accepted`
```json
{
  "success": true,
  "message": "Announcement queued for 150 recipients",
  "recipient_count": 150
}
```

**Possible Errors:**

- `400 Bad Request`:
  - Missing required fields (`audience_category`, `template_key`, `title`, `content`)
  - Invalid `audience_category` value (not "CLASS" or "TRANSPORT")
  - For `"TRANSPORT"` category: `audience_ids` is missing, empty, or contains more than one ID
  - `title` exceeds 100 characters
  - Validation error: "For TRANSPORT category, exactly one audience ID must be selected."

- `404 Not Found`:
  - Branch not found
  - Template not found (invalid `template_key` or template doesn't belong to institute)
  - No recipients found for the selected audience

- `400 Bad Request` (from service):
  - "No recipients found for the selected audience" - No students match the criteria
  - "Branch not found" - Current branch is invalid

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have required role (`ADMIN` or `INSTITUTE_ADMIN`)

**Frontend Implementation Notes for Announcements:**

1. **Audience Category Dropdown:**
   - Provide a dropdown with two options:
     - `"CLASS"` - Send to students by class
     - `"TRANSPORT"` - Send to students by transport route
   - Default to `"CLASS"` if not specified

2. **Audience Selection Based on Category:**

   **When `audience_category = "CLASS"`:**
   - Show a multi-select dropdown or checkbox list of available classes
   - Allow selecting multiple classes or "All Classes" option
   - If "All Classes" is selected, send `audience_ids` as `null` or empty array
   - If specific classes are selected, send array of class IDs: `[12, 13, 15]`

   **When `audience_category = "TRANSPORT"`:**
   - Show a single-select dropdown of available transport routes (bus routes)
   - User MUST select exactly one route
   - Send array with single ID: `[5]`
   - Disable the form submission if no route is selected
   - Show validation message: "Please select exactly one transport route"

3. **Template Selection:**

   **Fetching Templates:**
   - Use endpoint: `GET /api/v1/public/sms-templates`
   - This endpoint automatically returns only `MANUAL` category templates for the current institute
   - The response is an array of template objects

   **Template Filtering:**
   - The API already filters by `category: "MANUAL"`, so you don't need to filter by category
   - **You MUST filter by `is_active: true`** on the frontend to show only active templates
   - Only active templates can be used for sending announcements
   - Inactive templates should be hidden or disabled in the dropdown

   **Template Dropdown Implementation:**
   - **Display Value:** Show `template_name` in the dropdown (user-friendly name)
   - **Actual Value:** Use `template_key` as the value to send in the request
   - Example dropdown structure:
     ```javascript
     // Template object from API
     {
       template_id: 1,
       template_key: "EXAM_SCHEDULE",
       template_name: "Exam Schedule Notification",
       is_active: true,
       variable_names: ["var1", "var2"]
     }
     
     // Dropdown option
     <option value="EXAM_SCHEDULE">Exam Schedule Notification</option>
     ```

   **Template Selection Workflow:**
   1. On page load, fetch templates: `GET /api/v1/public/sms-templates`
   2. Filter results to show only where `is_active === true`
   3. Populate dropdown with `template_name` as display and `template_key` as value
   4. When user selects a template:
      - Store the selected template object (for accessing `variable_names` and `content`)
      - Show template preview (optional but recommended)
      - Dynamically generate variable input fields (see Template Variables section below)
   5. On form submission, send `template_key` (not `template_id`) in the request

   **Template Preview (Recommended):**
   - When a template is selected, display:
     - Template name: `template_name`
     - Template content: `content` (shows placeholders like `{var1}`, `{var2}`)
     - DLT Template ID: `dlt_template_id` (for reference)
     - Variable count: Number of variables in `variable_names` array
   - This helps users understand what variables they need to provide

   **Empty State Handling:**
   - If no active templates are found, show message: "No active templates available. Please create a template first."
   - Disable the announcement form if no templates are available
   - Provide a link/button to create a new template

4. **Template Variables Input:**

   **Understanding Template Variables:**
   - Templates can have placeholders in their content (e.g., `{var1}`, `{student_name}`)
   - The `variable_names` array defines which variables the template expects **and their order**
   - Each variable in `variable_names` corresponds to a placeholder in the DLT-registered template
   - Variables are replaced by the SMS provider (Fast2SMS) when the SMS is sent
   - **Important:** The order of variables in `variable_names` is critical - it determines how values are sent to the SMS provider
   - See the "How SMS Message is Constructed Using Template Variables" section above for detailed explanation

   **Dynamic Variable Input Generation:**
   - When a template is selected, check the `variable_names` array
   - For each variable name, create a corresponding input field
   - Example workflow:
     ```javascript
     // Selected template
     {
       template_key: "PAYMENT_REMINDER",
       variable_names: ["student_name", "amount", "due_date"],
       content: "Dear {student_name}, pay {amount} by {due_date}."
     }
     
     // Generate inputs:
     // 1. Input for "student_name" with label "Student Name"
     // 2. Input for "amount" with label "Amount"
     // 3. Input for "due_date" with label "Due Date"
     ```

   **Variable Input Field Requirements:**
   - **Field Type:** Text input (all variables are strings)
   - **Label:** Use the variable name, formatted for display (e.g., `student_name` → "Student Name")
   - **Required:** All variables should be marked as required (template won't work without them)
   - **Validation:** Ensure no empty values before submission
   - **Order:** Maintain the order from `variable_names` array (important for DLT compliance)

   **Building template_variables Object:**
   - Collect all variable inputs into a key-value object
   - Keys must exactly match the variable names from `variable_names`
   - Values are strings (user input)
   - Example:
     ```javascript
     // User inputs:
     student_name: "John Doe"
     amount: "₹5000"
     due_date: "2025-02-01"
     
     // Resulting template_variables:
     {
       "student_name": "John Doe",
       "amount": "₹5000",
       "due_date": "2025-02-01"
     }
     ```

   **Templates Without Variables:**
   - If `variable_names` is an empty array `[]`, no variable inputs are needed
   - The `template_variables` object can be empty `{}` or omitted
   - The template content will be sent as-is

   **Variable Validation:**
   - Before form submission, validate that:
     - All variables from `variable_names` have corresponding values
     - No extra variables are provided (only include variables from `variable_names`)
     - All values are non-empty strings
   - Show validation errors if any variable is missing

   **Example Complete Flow:**
   1. User selects template "Payment Reminder" (`template_key: "PAYMENT_REMINDER"`)
   2. Template has `variable_names: ["student_name", "amount", "due_date"]`
   3. Frontend generates 3 input fields:
      - "Student Name" (for `student_name`)
      - "Amount" (for `amount`)
      - "Due Date" (for `due_date`)
   4. User fills in: "John Doe", "₹5000", "2025-02-01"
   5. On submit, send:
      ```json
      {
        "template_key": "PAYMENT_REMINDER",
        "template_variables": {
          "student_name": "John Doe",
          "amount": "₹5000",
          "due_date": "2025-02-01"
        }
      }
      ```

5. **Form Validation:**
   - Validate that `title` doesn't exceed 100 characters (required field, but not used in SMS)
   - Validate that `content` is not empty (required field, but not used in SMS - actual SMS comes from template)
   - For TRANSPORT category, ensure exactly one `audience_ids` is selected
   - Validate that all required `template_variables` are provided (match `variable_names` from template)
   - Ensure `template_key` is selected (required field - this determines the actual SMS content)
   - Validate that selected template is active (should be filtered, but double-check)
   - **Note:** The `title` and `content` fields are required but don't affect the SMS message - the template's content is what gets sent

6. **Success Handling:**
   - The API returns `202 Accepted` (not `200 OK`) because the job is queued
   - Show the `recipient_count` to the user: "Announcement will be sent to X recipients"
   - Optionally, show a message that SMS sending is in progress

**Complete Template Selection Example:**

Here's a step-by-step example of how template selection should work:

**Step 1: Fetch Templates on Page Load**
```javascript
// API Call
GET /api/v1/public/sms-templates

// Response
[
  {
    "template_id": 1,
    "template_key": "EXAM_SCHEDULE",
    "template_name": "Exam Schedule Notification",
    "is_active": true,
    "variable_names": ["exam_name", "date"],
    "content": "Your {exam_name} exam is scheduled on {date}."
  },
  {
    "template_id": 2,
    "template_key": "PAYMENT_REMINDER",
    "template_name": "Payment Reminder",
    "is_active": true,
    "variable_names": ["student_name", "amount", "due_date"],
    "content": "Dear {student_name}, please pay {amount} by {due_date}."
  },
  {
    "template_id": 3,
    "template_key": "GENERAL_ANNOUNCEMENT",
    "template_name": "General Announcement",
    "is_active": false,  // Inactive - should be filtered out
    "variable_names": [],
    "content": "This is a general announcement."
  }
]
```

**Step 2: Filter and Display in Dropdown**
```javascript
// Filter active templates only
const activeTemplates = templates.filter(t => t.is_active === true);

// Dropdown HTML
<select name="template_key" id="template-select">
  <option value="">-- Select Template --</option>
  <option value="EXAM_SCHEDULE">Exam Schedule Notification</option>
  <option value="PAYMENT_REMINDER">Payment Reminder</option>
</select>
```

**Step 3: Handle Template Selection**
```javascript
// When user selects a template
const selectedTemplate = activeTemplates.find(
  t => t.template_key === selectedValue
);

// Show template preview
Template: Exam Schedule Notification
Content: "Your {exam_name} exam is scheduled on {date}."
Variables Required: 2 (exam_name, date)

// Generate variable inputs
<div>
  <label>Exam Name</label>
  <input name="template_variables[exam_name]" required />
</div>
<div>
  <label>Date</label>
  <input name="template_variables[date]" required />
</div>
```

**Step 4: Form Submission**
```javascript
// Collect form data
const formData = {
  audience_category: "CLASS",
  audience_ids: [12, 13],
  template_key: "EXAM_SCHEDULE",  // Use template_key, not template_id
  template_variables: {
    exam_name: "Final Exams",
    date: "2025-02-15"
  },
  title: "Exam Schedule Update",
  content: "The exam schedule has been updated..."
};

// Submit to API
POST /api/v1/public/announcements/send-bulk
```

**Important Notes:**
- Always use `template_key` (not `template_id`) in the request
- The API endpoint `/sms-templates` already filters by `MANUAL` category, so you only get usable templates
- You must still filter by `is_active: true` on the frontend
- Template variables are case-sensitive - use exact variable names from `variable_names`
- If a template has no variables (`variable_names: []`), you can send empty `template_variables: {}`

**Template Selection Troubleshooting:**

**Issue: "Template not found" error (404)**
- **Cause:** The `template_key` doesn't exist or doesn't belong to the institute
- **Solution:** 
  - Verify the template exists by calling `GET /api/v1/public/sms-templates`
  - Ensure you're using `template_key` (string) not `template_id` (number)
  - Check that the template belongs to the current institute
  - Verify the template is active (`is_active: true`)

**Issue: Template dropdown is empty**
- **Cause:** No active MANUAL templates exist for the institute
- **Solution:**
  - Check if templates exist: `GET /api/v1/public/sms-templates`
  - If templates exist but are inactive, activate them or create new ones
  - If no templates exist, create a template first using `POST /api/v1/public/sms-templates`

**Issue: Template variables not working**
- **Cause:** Variable names don't match or variables are missing
- **Solution:**
  - Ensure `template_variables` keys exactly match the `variable_names` from the template
  - Check for typos or case sensitivity issues
  - Verify all required variables are provided (none should be empty)
  - The order of variables doesn't matter, but the names must match exactly

**Issue: Template shows in list but can't be selected**
- **Cause:** Template might be inactive
- **Solution:**
  - Filter templates by `is_active: true` before displaying
  - Check template status in the response from `GET /api/v1/public/sms-templates`
  - Inactive templates should be hidden or shown as disabled in the dropdown

**Issue: Wrong template being used**
- **Cause:** Using `template_id` instead of `template_key`
- **Solution:**
  - Always use `template_key` (string) in the request, not `template_id` (number)
  - Example: Use `"EXAM_SCHEDULE"` not `1`
  - Double-check the value being sent matches the `template_key` from the selected template object

---

## SMS Reports API

### Base URL
`/api/v1/public/sms-reports`

### Overview
The SMS Reports API provides access to SMS delivery reports and analytics from the SMS provider (Fast2SMS). These endpoints help track SMS delivery status and analyze SMS usage.

---

### 1. Get Delivery Report

**Endpoint:** `GET /api/v1/public/sms-reports/delivery/{request_id}`

**Description:** Retrieves detailed delivery report for a specific SMS request ID. This shows the delivery status for each phone number in the batch.

**Authentication:** Required - `INSTITUTE_ADMIN` role only

**Path Parameters:**
- `request_id` (string, required): The request ID returned from the SMS provider when sending SMS

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Delivery report retrieved successfully",
  "data": [
    {
      "request_id": "1234567890abcdef",
      "route": "dlt",
      "delivery_status": [
        {
          "sender_id": "NZNEDU",
          "number": "9876543210",
          "status": "DELIVERED",
          "updated_at": "2025-01-26T10:30:00Z",
          "mobile": "9876543210",
          "status_description": "Message delivered successfully",
          "sent_time": "2025-01-26T10:25:00Z",
          "sent_timestamp": "1737887100"
        },
        {
          "sender_id": "NZNEDU",
          "number": "9876543211",
          "status": "FAILED",
          "updated_at": "2025-01-26T10:30:00Z",
          "mobile": "9876543211",
          "status_description": "Invalid number",
          "sent_time": "2025-01-26T10:25:00Z",
          "sent_timestamp": "1737887100"
        }
      ]
    }
  ]
}
```

**Possible Errors:**
- `404 Not Found`: Request ID not found
- `400 Bad Request`: 
  - SMS configuration not found for the institute
  - Request ID is required
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have `INSTITUTE_ADMIN` role

**Note:** This endpoint is restricted to `INSTITUTE_ADMIN` role only (not available to `ADMIN` role).

---

### 2. Get SMS Analytics

**Endpoint:** `GET /api/v1/public/sms-reports/analytics`

**Description:** Retrieves SMS analytics logs for the institute within a specified date range. Useful for tracking SMS usage, delivery rates, and costs.

**Authentication:** Required - `INSTITUTE_ADMIN` role only

**Query Parameters:**
- `from_date` (date, required, format: `YYYY-MM-DD`): Start date for the analytics report
- `to_date` (date, required, format: `YYYY-MM-DD`): End date for the analytics report
- `sender_id` (string, optional): Filter by specific Sender ID

**Example Request:**
```
GET /api/v1/public/sms-reports/analytics?from_date=2025-01-20&to_date=2025-01-26&sender_id=NZNEDU
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": [
    {
      "request_id": "1234567890abcdef",
      "route": "dlt",
      "delivery_status": [
        {
          "sender_id": "NZNEDU",
          "mobile": "9876543210",
          "status": "DELIVERED",
          "status_description": "Message delivered successfully",
          "dlr_attempt": "1",
          "sms_language": "English",
          "character_count": "120",
          "sms_count": "1",
          "amount_debited": "0.50",
          "sent_timestamp": "1737887100",
          "sent_time": "2025-01-26T10:25:00Z"
        }
      ]
    }
  ]
}
```

**Field Descriptions:**
- `request_id`: Unique identifier for the SMS batch
- `route`: SMS route used (e.g., "dlt", "dlt_manual")
- `delivery_status`: Array of individual message details
  - `sender_id`: Sender ID used
  - `mobile`: Phone number
  - `status`: Delivery status (e.g., "DELIVERED", "FAILED", "PENDING")
  - `status_description`: Human-readable status description
  - `dlr_attempt`: Delivery report attempt number
  - `sms_language`: Language of the SMS
  - `character_count`: Number of characters in the message
  - `sms_count`: Number of SMS parts (for long messages)
  - `amount_debited`: Cost charged for this SMS
  - `sent_timestamp`: Unix timestamp when SMS was sent
  - `sent_time`: Human-readable timestamp

**Possible Errors:**
- `400 Bad Request`: 
  - Missing required query parameters (`from_date`, `to_date`)
  - Invalid date format (must be `YYYY-MM-DD`)
  - SMS configuration not found for the institute
  - Date range exceeds provider limits (usually max 3 days)
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have `INSTITUTE_ADMIN` role

**Important Notes:**
- Date range is usually limited by the SMS provider (e.g., maximum 3 days)
- Dates should be in `YYYY-MM-DD` format
- The `sender_id` filter is optional - omit it to get analytics for all sender IDs

---

## Common Error Responses

All endpoints may return the following common errors:

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```
**Cause:** Missing or invalid authentication token in the request headers.

**Solution:** Ensure the request includes a valid Bearer token in the `Authorization` header:
```
Authorization: Bearer <your-token>
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```
**Cause:** User doesn't have the required role for the endpoint.

**Solution:** 
- Check user roles: `INSTITUTE_ADMIN` or `ADMIN` for most endpoints
- `INSTITUTE_ADMIN` only for SMS Reports endpoints
- Contact system administrator to assign appropriate roles

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```
**Cause:** The requested resource (template, configuration, etc.) doesn't exist or doesn't belong to the user's institute.

**Solution:** Verify the resource ID and ensure it belongs to the current institute.

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "template_key"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Cause:** Request body validation failed (missing required fields, invalid types, constraint violations).

**Solution:** Review the validation rules for each field and ensure the request body matches the expected schema.

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
**Cause:** Unexpected server error.

**Solution:** Contact the backend team with the error details and request information.

---

## Authentication & Authorization

### Authentication
All endpoints require authentication via Bearer token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

### Authorization Roles

**SMS Templates API:**
- Required roles: `INSTITUTE_ADMIN` or `ADMIN`

**SMS Configuration API:**
- Required roles: `INSTITUTE_ADMIN` or `ADMIN`

**Announcements API:**
- Required roles: `ADMIN` or `INSTITUTE_ADMIN`

**SMS Reports API:**
- Required role: `INSTITUTE_ADMIN` only (more restrictive)

### Institute Context
All endpoints automatically use the `institute_id` from the authenticated user's token. Users can only access resources belonging to their institute.

---

## Best Practices for Frontend Integration

1. **Error Handling:**
   - Always handle all possible error responses
   - Display user-friendly error messages
   - Log errors for debugging

2. **Loading States:**
   - Show loading indicators during API calls
   - For announcements, inform users that SMS sending is asynchronous

3. **Form Validation:**
   - Validate inputs on the frontend before submission
   - Match backend validation rules (string lengths, required fields, enum values)
   - Show real-time validation feedback

4. **Template Management:**
   - Cache template list to reduce API calls
   - Refresh template list after create/update/delete operations
   - Show template details (variables, content) when selecting templates

5. **Announcements:**
   - Dynamically show/hide audience selection based on `audience_category`
   - Enforce single selection for TRANSPORT category
   - Validate template variables match the selected template
   - Show recipient count preview if possible

6. **Date Handling:**
   - Use `YYYY-MM-DD` format for date inputs
   - Validate date ranges (e.g., from_date <= to_date)
   - Handle timezone considerations if needed

7. **Security:**
   - Never expose API keys in frontend code
   - Store authentication tokens securely
   - Implement token refresh logic

---

## Summary

This integration guide covers all SMS-related endpoints in the NexZen ERP Backend:

- **SMS Templates**: CRUD operations for managing SMS templates
- **SMS Configuration**: Managing SMS provider settings
- **Announcements**: Sending bulk SMS to students by class or transport route
- **SMS Reports**: Tracking delivery status and analytics

All endpoints require proper authentication and authorization. The system automatically scopes resources to the user's institute. For announcements, ensure proper handling of audience categories and template variables based on the selected template.
