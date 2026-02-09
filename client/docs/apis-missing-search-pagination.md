# APIs Missing Search and/or Pagination (Backend)

List of used list/GET APIs that either **do not have backend search** or **do not have backend pagination** for School and College.

**Note:** Backend now supports optional `search` (full-text) on the endpoints in the Summary table below. Frontend has been updated to pass `search` where applicable (Reservations, Admissions, Enrollments, Promotion eligibility, Transport assignments, Income).

---

## School

| # | Section | Endpoint | Missing Search | Missing Pagination |
|---|--------|----------|----------------|--------------------|
| 1 | All Reservations | `GET /school/reservations` | ✓ | — |
| 2 | Student Admissions | `GET /school/admissions` | ✓ (may be ignored) | — |
| 3 | Enrollments | `GET /school/enrollments` | ✓ | — |
| 4 | Transport (Fee Balances) | `GET /school/transport-fee-balances` | ✓ | — |
| 5 | Promotion & Dropout | `GET /school/enrollments/promotion-eligibility` | N/A | N/A |
| 6 | Income | `GET /school/income` | ✓ | — |
| 7 | Fee Balances (Tuition) | `GET /school/tuition-fee-balances` | ✓ | — |
| — | Enrollments (section assignment) | `GET /school/enrollments/for-section-assignment` | ✓ | ✓ |
| — | Unpaid terms report | `GET /school/tuition-fee-balances/reports/unpaid-terms` | ✓ | ✓ |
| — | Recent | `GET /school/reservations/recent` | ✓ | ✓ (limit only) |
| — | Recent | `GET /school/income/recent` | ✓ | ✓ (limit only) |

---

## College

| # | Section | Endpoint | Missing Search | Missing Pagination |
|---|--------|----------|----------------|--------------------|
| 1 | All Reservations | `GET /college/reservations` | ✓ | — |
| 2 | Student Admissions | `GET /college/admissions` | ✓ (may be ignored) | — |
| 3 | Enrollments | `GET /college/student-enrollments` | ✓ | — |
| 4 | Transport | `GET /college/student-transport-payment` | ✓ | ✓ |
| 5 | Promotion & Dropout | `GET /college/student-enrollments/promotion-eligibility` | N/A | N/A |
| 6 | Income | `GET /college/income` | ✓ | — |
| 7 | Fee Balances (Tuition) | `GET /college/tuition-fee-balances` | ✓ | — |
| — | Other income | `GET /college/other-income` | ✓ | — |
| — | Recent | `GET /college/reservations/recent` | ✓ | ✓ (limit only) |
| — | Recent | `GET /college/income/recent` | ✓ | ✓ (limit only) |

---

## Summary

- **Missing search:** Reservations, Admissions (possibly), Enrollments, Transport, Income, Fee Balances (Tuition) in both School and College; plus section-assignment, unpaid-terms, recent, and college other-income.
- **Missing pagination:** School: for-section-assignment, unpaid-terms report, reservations/income recent. College: student-transport-payment (list), reservations/income recent.
- **Missing both:** `GET /college/student-transport-payment` (main list).
