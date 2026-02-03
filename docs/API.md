## Excel Mapper

### POST /extraction/excel-mapper/upload
**Upload And Analyze Excel**

**Response:**
```json
{
  "success": true,
  "filename": "IFB WAGES (Motor)_June_2025.xls",
  "file_size": 699904,
  "file_size_mb": 0.67,
  "total_sheets": 5,
  "sheets": [
    {
      "name": "WAGESHEET",
      "total_rows": 36,
      "total_columns": 36,
      "detected_header_row": 5,
      "header_end_row": 7,
      "is_multi_row_header": true,
      "data_rows": 24,
      "headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "..."],
      "main_headers": ["SR. NO.", "PF NUMBERS", "..."],
      "sub_headers": ["BASIC", "SP. ALL.", "H.R.A.", "..."],
      "column_mapping": {
        "A": "SR. NO.",
        "B": "PF NUMBERS",
        "C": "ESIC NO"
      }
    }
  ],
  "file_format": "xls",
  "sheet_relationships": {
    "target_sheets": [
      {
        "name": "WAGESHEET",
        "references_sheets": ["Motor Bill Details", "Payslip"]
      }
    ],
    "source_sheets": ["Motor Bill Details", "Payslip"],
    "relationships": {
      "WAGESHEET": ["Motor Bill Details", "Payslip"]
    }
  },
  "recommendations": {
    "message": "Potential TARGET sheets detected",
    "suggestions": [
      {
        "sheet_name": "WAGESHEET",
        "reason": "Sheet name suggests this is a wage/salary calculation sheet",
        "recommendation": "Use this as your target_sheet when analyzing formulas"
      }
    ]
  }
}
```

---

### POST /extraction/excel-mapper/detect-relationships
**Detect Sheet Relationships** (Optimized)

**Response:** (Simplified - No redundant data)
```json
{
  "success": true,
  "filename": "wage_sheet.xlsx",
  "target_sheet": {
    "name": "WAGESHEET",
    "type": "formula_sheet",
    "source_sheets": ["Motor Bill Details", "Payslip", "pockets"],
    "formula_count": 245
  },
  "metadata": {
    "has_formulas": true,
    "total_source_sheets": 3,
    "total_formulas": 245,
    "file_format": "xlsx"
  }
}
```

**Note:** Response simplified from v1. Previously returned redundant data in `target_sheets`, `source_sheets`, and `relationships` fields. Now provides clean, single-source-of-truth structure.

---

### POST /extraction/excel-mapper/analyze
**Analyze Excel Formulas**

**Note:** Only works with .XLSX files

**Response:**
```json
{
  "mappings": [
    {
      "source_sheet": "Motor Bill Details",
      "source_column": "B",
      "source_field": "NAME OF EMPLOYEE",
      "source_header_row": 6,
      "target_column": "E",
      "target_field": "FULL NAME OF EMPLOYEE",
      "target_header_row": 5,
      "sample_cell": "E10",
      "sample_formula": "='Motor Bill Details'!B10"
    }
  ],
  "source_sheets": ["Motor Bill Details", "Payslip"],
  "metadata": {
    "target_sheet": "WAGESHEET",
    "detected_header_row": 5,
    "columns_found": 36,
    "formulas_found": 245,
    "unique_mappings": 28
  }
}
```

---

### POST /extraction/excel-mapper/export
**Export Excel Mappings**

**Note:** Only works with .XLSX files

**Response:** Excel file download with mapping details

---

## Wage Sheet Configuration

### POST /extraction/wage-sheet-config/extract-and-save
**Extract And Save Headers** (Flattened Response)

**Response:** (Optimized - Flattened structure for easy access)
```json
{
  "id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet_name": "WAGESHEET",
  "file_format": "xls",
  
  "headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "FULL NAME OF EMPLOYEE", "..."],
  "column_mapping": {
    "A": "SR. NO.",
    "B": "PF NUMBERS",
    "C": "ESIC NO"
  },
  "source_sheets": ["Motor Bill Details", "Payslip", "pockets"],
  "main_headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "..."],
  "sub_headers": ["BASIC", "SP. ALL.", "H.R.A.", "..."],
  
  "header_info": {
    "start_row": 5,
    "end_row": 7,
    "is_multi_row": true,
    "total_columns": 36,
    "data_rows": 24
  },
  
  "version": 1,
  "is_active": true,
  "validation_rules": null,
  "description": null,
  "month_year": "June_2025",
  "created_at": "2025-11-26T21:27:25.534132",
  "updated_at": "2025-11-26T21:27:25.534132",
  "created_by": "a7b8c9d0-e29b-41d4-a716-446655440011",
  "updated_by": "a7b8c9d0-e29b-41d4-a716-446655440011"
}
```

**Note:** Response structure flattened for easier frontend access:
- Direct access: `response.headers`, `response.column_mapping`
- Instead of: `response.header_config.headers`, `response.header_config.column_mapping`
- Raw `header_config` still available for backward compatibility

---

### POST /extraction/wage-sheet-config/preview
**Preview Configuration Without Saving**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- header_row_override: Optional manual override for header start row (1-based)
- header_end_row_override: Optional manual override for header end row (1-based)
- skip_auto_detection: Skip auto-detection and use manual overrides only (default: false)

**Response:**
```json
{
  "preview": true,
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet_name": "WAGESHEET",
  "file_format": "xls",
  "headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "FULL NAME OF EMPLOYEE", "..."],
  "column_mapping": {
    "A": "SR. NO.",
    "B": "PF NUMBERS",
    "C": "ESIC NO"
  },
  "source_sheets": ["Motor Bill Details", "Payslip", "pockets"],
  "main_headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "..."],
  "sub_headers": ["BASIC", "SP. ALL.", "H.R.A.", "..."],
  "header_info": {
    "start_row": 5,
    "end_row": 7,
    "is_multi_row": true,
    "total_columns": 36,
    "data_rows": 24
  },
  "detected_issues": [],
  "warnings": [],
  "recommendations": []
}
```

**Note:** This endpoint previews what the configuration will look like without saving to database. Perfect for first-time setup to see what will be configured before committing.

---

### POST /extraction/wage-sheet-config/validate-upload
**Validate Wage Sheet Upload**

**Response (Valid):**
```json
{
  "is_valid": true,
  "config_exists": true,
  "validation_details": {
    "matching_headers": 36,
    "total_expected_headers": 36,
    "missing_headers": [],
    "extra_headers": [],
    "header_row_match": true,
    "expected_header_row": 5,
    "actual_header_row": 5
  },
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "message": "Wage sheet is valid and matches configuration"
}
```

**Response (Invalid):**
```json
{
  "is_valid": false,
  "config_exists": true,
  "validation_details": {
    "matching_headers": 34,
    "total_expected_headers": 36,
    "missing_headers": ["Old Column 1", "Old Column 2"],
    "extra_headers": ["New Bonus", "New Incentive"],
    "header_row_match": true,
    "expected_header_row": 5,
    "actual_header_row": 5
  },
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "message": "Validation failed: Headers do not match"
}
```

---

### POST /extraction/wage-sheet-config/compare-headers
**Compare Headers With Config**

**Response:**
```json
{
  "config_exists": true,
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "comparison": {
    "added_headers": ["New Bonus Column", "Transport Allowance"],
    "removed_headers": ["Old Deduction"],
    "unchanged_headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "..."],
    "header_row_changed": false,
    "old_header_row": 5,
    "new_header_row": 5,
    "source_sheets_changed": false
  },
  "recommendation": "Headers have changed. Consider updating configuration.",
  "changes_count": {
    "added": 2,
    "removed": 1,
    "total_changes": 3
  }
}
```

---

### POST /extraction/wage-sheet-config/validate-headers
**Validate Header Detection**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- header_row_override: Optional manual override for header start row (1-based)
- header_end_row_override: Optional manual override for header end row (1-based)

**Response:**
```json
{
  "preview": {
    "preview": true,
    "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
    "target_sheet_name": "WAGESHEET",
    "headers": ["SR. NO.", "PF NUMBERS", "..."],
    "header_info": {
      "start_row": 5,
      "end_row": 7,
      "is_multi_row": true
    }
  },
  "detection_details": {
    "confidence": 0.95,
    "alternative_header_rows": [4, 6],
    "merged_cells_detected": true,
    "formula_headers_detected": false,
    "manual_override_used": false
  },
  "recommendations": [
    "Header row detected with high confidence",
    "Consider using row 5 as header start"
  ],
  "warnings": []
}
```

**Note:** This endpoint tests header detection on a file without saving. Shows detected headers with confidence scores, alternative header row candidates, and detection details. Perfect for debugging detection issues or manual header row selection.

---

### GET /extraction/wage-sheet-config/factory/{factory_id}/headers
**Get Factory Headers**

**Response:**
```json
{
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet_name": "WAGESHEET",
  "is_multi_row_header": true,
  "header_row_start": 5,
  "header_row_end": 7,
  "headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "FULL NAME OF EMPLOYEE", "..."],
  "main_headers": ["SR. NO.", "PF NUMBERS", "ESIC NO", "..."],
  "sub_headers": ["BASIC", "SP. ALL.", "H.R.A.", "..."],
  "column_mapping": {
    "A": "SR. NO.",
    "B": "PF NUMBERS",
    "C": "ESIC NO"
  },
  "total_columns": 36,
  "source_sheets": ["Motor Bill Details", "Payslip", "pockets"],
  "version": 1,
  "month_year": "June_2025",
  "last_updated": "2025-11-26T21:27:25.534132"
}
```

---

### GET /extraction/wage-sheet-config/factory/{factory_id}
**Get Factory Config**

**Response:**
```json
{
  "id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet_name": "WAGESHEET",
  "file_format": "xls",
  "header_config": {
    "header_row": 5,
    "header_end_row": 7,
    "is_multi_row_header": true,
    "headers": ["SR. NO.", "PF NUMBERS", "..."],
    "main_headers": ["SR. NO.", "PF NUMBERS", "..."],
    "sub_headers": ["BASIC", "SP. ALL.", "..."],
    "column_mapping": {...},
    "source_sheets": ["Motor Bill Details", "Payslip"],
    "total_columns": 36,
    "data_rows": 24
  },
  "version": 1,
  "is_active": true,
  "validation_rules": null,
  "description": null,
  "month_year": "June_2025",
  "created_at": "2025-11-26T21:27:25.534132",
  "updated_at": "2025-11-26T21:27:25.534132",
  "created_by": "a7b8c9d0-e29b-41d4-a716-446655440011",
  "updated_by": "a7b8c9d0-e29b-41d4-a716-446655440011"
}
```

---

### PUT /extraction/wage-sheet-config/{config_id}
**Update Config**

**Response:**
```json
{
  "id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet_name": "WAGESHEET",
  "file_format": "xls",
  "header_config": {...},
  "version": 2,
  "is_active": "true",
  "validation_rules": null,
  "description": "Updated configuration for July 2025",
  "month_year": "July_2025",
  "created_at": "2025-11-26T21:27:25.534132",
  "updated_at": "2025-11-27T10:15:30.123456",
  "created_by": "a7b8c9d0-e29b-41d4-a716-446655440011",
  "updated_by": "a7b8c9d0-e29b-41d4-a716-446655440011"
}
```

---

### GET /extraction/wage-sheet-config/history/factory/{factory_id}
**Get Factory Config History**

**Response:**
```json
{
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "total_configs": 3,
  "configs": [
    {
      "id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
      "version": 3,
      "is_active": true,
      "month_year": "July_2025",
      "created_at": "2025-11-27T10:15:30.123456",
      "updated_at": "2025-11-27T10:15:30.123456"
    },
    {
      "id": "2f6db9fe-2dd3-543f-a24b-d18cc5f53d6a",
      "version": 2,
      "is_active": false,
      "month_year": "June_2025",
      "created_at": "2025-11-26T21:27:25.534132",
      "updated_at": "2025-11-26T21:27:25.534132"
    }
  ]
}
```

---


## Wage Sheet Processing

### POST /extraction/wage-sheet-processing/preview
**Preview Wage Sheet Processing**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- sample_rows: Number of rows to preview (default: 10, max: 100)
- config_id: Optional config ID

**Response:**
```json
{
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "sample_data": [
    {
      "row_number": 1,
      "data": {
        "SR. NO.": "1",
        "FULL NAME OF EMPLOYEE": "JOHN DOE",
        "BASIC": "15000"
      },
      "status": "valid",
      "issues": []
    }
  ],
  "mappings_preview": [
    {
      "source": "Motor Bill Details.NAME OF EMPLOYEE",
      "target": "FULL NAME OF EMPLOYEE",
      "type": "DIRECT"
    }
  ],
  "warnings": [],
  "total_rows_in_file": 100
}
```

---

### POST /extraction/wage-sheet-processing/process
**Process Wage Sheet Data**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- config_id: Optional config ID
- apply_transformations: Apply transformation rules (default: true)
- validate_data: Validate processed data (default: true)
- skip_invalid_rows: Skip invalid rows (default: false)
- max_rows: Maximum rows to process (optional)

**Response:**
```json
{
  "status": "success",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "summary": {
    "total_rows": 100,
    "processed_rows": 98,
    "valid_rows": 95,
    "invalid_rows": 3,
    "skipped_rows": 2,
    "total_columns": 36,
    "mappings_applied": 36,
    "transformations_applied": 5,
    "processing_time_seconds": 2.5
  },
  "validation": {
    "total_issues": 5,
    "errors": 2,
    "warnings": 3,
    "critical_issues": []
  },
  "data": [...],
  "processing_id": "proc_1732712400",
  "processed_at": "2025-11-27T14:00:00Z"
}
```

---

### POST /extraction/wage-sheet-processing/generate
**Generate Final Wage Sheet (Process + Download)**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- config_id: Optional config ID
- output_format: Output format (xlsx, xls, or csv) (default: xlsx)
- include_summary_sheet: Include summary sheet (default: true)
- include_validation_sheet: Include validation results (default: false)

**Response:** Excel file download (StreamingResponse)

**Output File Contains:**
- Sheet 1: Processed Wage Sheet (all data with mappings applied)
- Sheet 2: Processing Summary (optional - statistics)
- Sheet 3: Validation Results (optional - issues found)

**Usage:**
```bash
curl -X POST "/extraction/wage-sheet-processing/generate" \\
  -F "file=@wage_sheet.xls" \\
  -F "factory_id=452f8c72-1af1-4605-a950-06cace1e6a1e" \\
  -F "output_format=xlsx" \\
  -o processed_wage_sheet.xlsx
```

---

### POST /extraction/wage-sheet-processing/process-and-preview
**Process Full File + Return Preview**

**Request:**
- file: Excel wage sheet file
- factory_id: Factory ID
- preview_rows: Number of rows to return (default: 20, max: 100)
- config_id: Optional config ID

**Response:**
```json
{
  "processing_id": "proc_1732712400",
  "status": "success",
  "summary": {...},
  "validation": {...},
  "preview_data": [...],
  "total_rows": 100,
  "preview_rows_shown": 20,
  "message": "Processed 100 rows. Showing first 20 rows."
}
```

---

## Wage Sheet Column Mapping

### GET /extraction/wage-sheet-mapping/source-sheets/{factory_id}
**Get Available Source Sheets**

**Response:**
```json
{
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet": "WAGESHEET",
  "source_sheets": [
    "Motor Bill Details",
    "Payslip",
    "pockets",
    "Bill-Oct-13"
  ],
  "total_source_sheets": 4
}
```

---

### POST /extraction/wage-sheet-mapping/wizard
**Get Mapping Wizard Data**

**Response:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_sheet": "WAGESHEET",
  "target_columns": {
    "A": "SR. NO.",
    "B": "PF NUMBERS",
    "C": "ESIC NO",
    "D": "Uan NO",
    "E": "FULL NAME OF EMPLOYEE"
  },
  "source_sheets": [
    {
      "sheet_name": "Motor Bill Details",
      "total_columns": 44,
      "headers": ["SR. NO.", "NAME OF EMPLOYEE", "PF No", "ESIC", "UAN NO", "..."],
      "column_mapping": {
        "A": "SR. NO.",
        "B": "NAME OF EMPLOYEE",
        "C": "PF No",
        "D": "ESIC",
        "E": "UAN NO"
      },
      "data_rows": 47
    }
  ],
  "existing_mappings": [],
  "suggestions": [
    {
      "target_column": "A",
      "target_column_name": "SR. NO.",
      "source_sheet": "Motor Bill Details",
      "source_column": "A",
      "source_column_name": "SR. NO.",
      "confidence": "high",
      "transformation_type": "DIRECT"
    },
    {
      "target_column": "E",
      "target_column_name": "FULL NAME OF EMPLOYEE",
      "source_sheet": "Motor Bill Details",
      "source_column": "B",
      "source_column_name": "NAME OF EMPLOYEE",
      "confidence": "high",
      "transformation_type": "DIRECT"
    },
    {
      "target_column": "C",
      "target_column_name": "ESIC NO",
      "source_sheet": "Motor Bill Details",
      "source_column": "D",
      "source_column_name": "ESIC",
      "confidence": "medium",
      "transformation_type": "DIRECT"
    }
  ]
}
```

---

### POST /extraction/wage-sheet-mapping/test
**Test a Single Mapping Without Saving**

**Request Body:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "target_column": "E",
  "target_column_name": "FULL NAME OF EMPLOYEE",
  "source_sheet": "Motor Bill Details",
  "source_column": "B",
  "source_column_name": "NAME OF EMPLOYEE",
  "transformation_type": "FORMULA",
  "transformation_rule": {"formula": "UPPER(value)"},
  "validation_rule": {"type": "string", "min_length": 3},
  "sample_data": ["john doe", "jane smith", "bob wilson"]
}
```

**Response:**
```json
{
  "preview": true,
  "mapping_valid": true,
  "transformation_result": ["JOHN DOE", "JANE SMITH", "BOB WILSON"],
  "validation_results": [
    {
      "input": "john doe",
      "output": "JOHN DOE",
      "valid": true,
      "errors": []
    }
  ],
  "errors": [],
  "warnings": [],
  "sample_input": ["john doe", "jane smith", "bob wilson"],
  "sample_output": ["JOHN DOE", "JANE SMITH", "BOB WILSON"]
}
```

**Note:** Test how a mapping will work before saving it. Validates the mapping configuration, applies transformation to sample data, runs validation rules, and shows preview of results. Does NOT save to database.

---

### POST /extraction/wage-sheet-mapping/validate-bulk
**Validate Bulk Mappings Before Creating**

**Request Body:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "mappings": [
    {
      "target_column": "A",
      "target_column_name": "SR. NO.",
      "source_sheet": "Motor Bill Details",
      "source_column": "A",
      "source_column_name": "SR. NO.",
      "transformation_type": "DIRECT"
    },
    {
      "target_column": "E",
      "target_column_name": "FULL NAME OF EMPLOYEE",
      "source_sheet": "Motor Bill Details",
      "source_column": "B",
      "source_column_name": "NAME OF EMPLOYEE",
      "transformation_type": "DIRECT"
    }
  ]
}
```

**Response:**
```json
{
  "preview": true,
  "total_mappings": 2,
  "valid_mappings": 2,
  "invalid_mappings": 0,
  "conflicts": [],
  "validation_results": [
    {
      "mapping_index": 0,
      "valid": true,
      "errors": []
    },
    {
      "mapping_index": 1,
      "valid": true,
      "errors": []
    }
  ],
  "warnings": [],
  "errors": []
}
```

**Note:** Validate all mappings before creating them. Checks for conflicts (duplicates, etc.), shows validation results per mapping, and provides summary statistics. Does NOT save to database.

---

### POST /extraction/wage-sheet-mapping/preview-bulk
**Preview Bulk Mappings Without Saving**

**Request Body:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "mappings": [
    {
      "target_column": "D",
      "target_column_name": "Employee ID",
      "source_sheet": "Motor Bill Details",
      "source_column": "A",
      "source_column_name": "Worker ID",
      "transformation_type": "DIRECT"
    },
    {
      "target_column": "E",
      "target_column_name": "Basic Salary",
      "source_sheet": "Motor Bill Details",
      "source_column": "F",
      "source_column_name": "Basic Pay",
      "transformation_type": "DIRECT"
    }
  ]
}
```

**Response:**
```json
{
  "preview": true,
  "total_mappings": 25,
  "valid_mappings": 23,
  "invalid_mappings": 2,
  "conflicts": [
    {
      "target_column": "F",
      "conflict_type": "duplicate",
      "existing_mapping": "uuid-1",
      "new_mapping": "uuid-2"
    }
  ],
  "validation_results": [
    {
      "mapping_index": 0,
      "valid": true,
      "errors": []
    },
    {
      "mapping_index": 1,
      "valid": false,
      "errors": ["Invalid target column letter: 'ZZ'"]
    }
  ],
  "warnings": ["Duplicate mapping detected for column F"],
  "errors": [
    {
      "mapping_index": 1,
      "field": "target_column",
      "value": "ZZ",
      "error": "Invalid target column letter: 'ZZ'. Must be a valid Excel column",
      "severity": "error"
    }
  ],
  "sample_data": null
}
```

**Note:** Preview all mappings before bulk create. Validates all mappings, checks for conflicts (duplicates, etc.), shows validation results per mapping, and provides summary statistics. Does NOT save to database.

---

### POST /extraction/wage-sheet-mapping/create
**Create Column Mapping**

**Request Body:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "target_column": "E",
  "target_column_name": "FULL NAME OF EMPLOYEE",
  "source_sheet": "Motor Bill Details",
  "source_column": "B",
  "source_column_name": "NAME OF EMPLOYEE",
  "transformation_type": "DIRECT",
  "description": "Map employee name from Motor Bill Details"
}
```

**Response:**
```json
{
  "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_column": "E",
  "target_column_name": "FULL NAME OF EMPLOYEE",
  "source_sheet": "Motor Bill Details",
  "source_column": "B",
  "source_column_name": "NAME OF EMPLOYEE",
  "transformation_type": "DIRECT",
  "transformation_rule": null,
  "validation_rule": null,
  "mapping_order": 0,
  "is_active": "true",
  "description": "Map employee name from Motor Bill Details",
  "created_at": "2025-11-27T11:00:00.000000",
  "updated_at": "2025-11-27T11:00:00.000000",
  "created_by": "a7b8c9d0-e29b-41d4-a716-446655440011",
  "updated_by": "a7b8c9d0-e29b-41d4-a716-446655440011"
}
```

---

### POST /extraction/wage-sheet-mapping/bulk-create
**Create Bulk Mappings**

**Request Body:**
```json
{
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "mappings": [
    {
      "target_column": "A",
      "target_column_name": "SR. NO.",
      "source_sheet": "Motor Bill Details",
      "source_column": "A",
      "source_column_name": "SR. NO.",
      "transformation_type": "DIRECT"
    },
    {
      "target_column": "E",
      "target_column_name": "FULL NAME OF EMPLOYEE",
      "source_sheet": "Motor Bill Details",
      "source_column": "B",
      "source_column_name": "NAME OF EMPLOYEE",
      "transformation_type": "DIRECT"
    }
  ]
}
```

**Response:** (Optimized - No audit fields)
```json
[
  {
    "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
    "target_column": "A",
    "target_column_name": "SR. NO.",
    "source_sheet": "Motor Bill Details",
    "source_column": "A",
    "source_column_name": "SR. NO.",
    "transformation_type": "DIRECT",
    "mapping_order": 0,
    "is_active": true,
    "description": null
  },
  {
    "id": "4h8fd0hg-4ff5-765h-c46d-f30ee7h75f8c",
    "target_column": "E",
    "target_column_name": "FULL NAME OF EMPLOYEE",
    "source_sheet": "Motor Bill Details",
    "source_column": "B",
    "source_column_name": "NAME OF EMPLOYEE",
    "transformation_type": "DIRECT",
    "mapping_order": 1,
    "is_active": true,
    "description": null
  }
]
```

---

### GET /extraction/wage-sheet-mapping/config/{config_id}
**Get Config Mappings** (Paginated - Simplified)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 100, max: 100, mapped to `size` internally)

**Response:** (Optimized - No audit fields + Pagination metadata)
```json
{
  "data": [
    {
      "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
      "target_column": "A",
      "target_column_name": "SR. NO.",
      "source_sheet": "Motor Bill Details",
      "source_column": "A",
      "source_column_name": "SR. NO.",
      "transformation_type": "DIRECT",
      "mapping_order": 0,
      "is_active": true,
      "description": null
    },
    {
      "id": "4h8fd0hg-4ff5-765h-c46d-f30ee7h75f8c",
      "target_column": "E",
      "target_column_name": "FULL NAME OF EMPLOYEE",
      "source_sheet": "Motor Bill Details",
      "source_column": "B",
      "source_column_name": "NAME OF EMPLOYEE",
      "transformation_type": "DIRECT",
      "mapping_order": 1,
      "is_active": true,
      "description": null
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "size": 100,
    "pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

**Note:** This endpoint returns a simplified response without audit fields (created_at, updated_at, created_by, updated_by) for better performance. For full details with audit info, use `GET /{mapping_id}`.

---

### GET /extraction/wage-sheet-mapping/{mapping_id}
**Get Mapping Detail** (Full Response)

**Response:** (Complete - Includes all fields + audit)
```json
{
  "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_column": "A",
  "target_column_name": "SR. NO.",
  "source_sheet": "Motor Bill Details",
  "source_column": "A",
  "source_column_name": "SR. NO.",
  "transformation_type": "DIRECT",
  "transformation_rule": null,
  "validation_rule": null,
  "mapping_order": 0,
  "is_active": true,
  "description": null,
  "created_at": "2025-11-27T11:00:00.000000",
  "updated_at": "2025-11-27T11:00:00.000000"
}
```

---

### PUT /extraction/wage-sheet-mapping/{mapping_id}
**Update Mapping**

**Request Body:**
```json
{
  "transformation_type": "FORMULA",
  "transformation_rule": {"formula": "UPPER(value)"},
  "description": "Convert name to uppercase"
}
```

**Response:**
```json
{
  "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
  "config_id": "1e5ca8fd-1cc2-432e-913a-c07bb4e42c59",
  "factory_id": "452f8c72-1af1-4605-a950-06cace1e6a1e",
  "target_column": "E",
  "target_column_name": "FULL NAME OF EMPLOYEE",
  "source_sheet": "Motor Bill Details",
  "source_column": "B",
  "source_column_name": "NAME OF EMPLOYEE",
  "transformation_type": "FORMULA",
  "transformation_rule": {"formula": "UPPER(value)"},
  "validation_rule": null,
  "mapping_order": 0,
  "is_active": "true",
  "description": "Convert name to uppercase",
  "created_at": "2025-11-27T11:00:00.000000",
  "updated_at": "2025-11-27T12:30:00.000000",
  "created_by": "a7b8c9d0-e29b-41d4-a716-446655440011",
  "updated_by": "a7b8c9d0-e29b-41d4-a716-446655440011"
}
```

---

### PUT /extraction/wage-sheet-mapping/bulk-update
**Bulk Update Mappings**

**Description:** Update multiple column mappings at once. Perfect for monthly updates where multiple mappings need to change.

**Request Body:**
```json
{
  "mappings": [
    {
      "mapping_id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
      "transformation_type": "FORMULA",
      "transformation_rule": {"formula": "UPPER(value)"},
      "description": "Convert to uppercase"
    },
    {
      "mapping_id": "4h8fd0hg-4ff5-765h-c46d-f30ee7h75f8c",
      "source_column": "G",
      "source_column_name": "Updated Bonus Column",
      "description": "Bonus column moved from F to G"
    },
    {
      "mapping_id": "5i9ge1ih-5gg6-876i-d57e-g41ff8i86g9d",
      "is_active": false
    }
  ]
}
```

**Response:** (Optimized - No audit fields)
```json
[
  {
    "id": "3g7ec9gf-3ee4-654g-b35c-e29dd6g64e7b",
    "target_column": "E",
    "target_column_name": "FULL NAME OF EMPLOYEE",
    "source_sheet": "Motor Bill Details",
    "source_column": "B",
    "source_column_name": "NAME OF EMPLOYEE",
    "transformation_type": "FORMULA",
    "mapping_order": 0,
    "is_active": true,
    "description": "Convert to uppercase"
  },
  {
    "id": "4h8fd0hg-4ff5-765h-c46d-f30ee7h75f8c",
    "target_column": "F",
    "target_column_name": "BONUS",
    "source_sheet": "Motor Bill Details",
    "source_column": "G",
    "source_column_name": "Updated Bonus Column",
    "transformation_type": "DIRECT",
    "mapping_order": 1,
    "is_active": true,
    "description": "Bonus column moved from F to G"
  }
]
```

**Use Cases:**
- Monthly wage sheet format updates
- Changing transformation rules for multiple columns
- Updating source columns when template changes
- Batch editing descriptions and validation rules

**Note:** 
- Only fields provided in the request will be updated
- All updates are committed as a single transaction
- Response is optimized without audit fields. Use `GET /{mapping_id}` for full details

---

### DELETE /extraction/wage-sheet-mapping/{mapping_id}
**Delete Mapping**

**Response:**
```json
{
  "success": true,
  "message": "Mapping deleted successfully"
}
```

---

### DELETE /extraction/wage-sheet-mapping/config/{config_id}/all
**Delete All Config Mappings**

**Response:**
```json
{
  "success": true,
  "message": "Deleted 15 mapping(s)",
  "deleted_count": 15
}
```