# Multiple Payment Form System

A comprehensive payment form system that allows users to add multiple fee payments in a single transaction with real-time validation, purpose-specific input components, and intelligent error handling.

## Features

- **Multi-purpose payment support**: BOOK_FEE, TUITION_FEE, TRANSPORT_FEE, OTHER
- **Sequential payment validation**: Enforces business rules for term-based payments
- **Real-time validation**: Immediate feedback on user input
- **Duplicate prevention**: Prevents adding same payment type multiple times
- **Responsive design**: Works on mobile and desktop devices
- **School & College support**: Different configurations for different institution types

## Architecture

### Shared Components

The system is built with reusable shared components that work for both school and college modules:

```
/components/shared/payment/
├── multiple-payment/
│   ├── MultiplePaymentForm.tsx          # Main orchestrator
│   ├── PurposeSelectionModal.tsx        # Purpose selection interface
│   ├── PaymentItemsList.tsx             # List of payment items
│   ├── PaymentItemCard.tsx              # Individual payment item
│   ├── PaymentSummary.tsx               # Payment summary section
│   └── components/
│       ├── BookFeeComponent.tsx         # Book fee specific form
│       ├── TuitionFeeComponent.tsx      # Tuition fee specific form
│       ├── TransportFeeComponent.tsx    # Transport fee specific form
│       └── OtherComponent.tsx           # Custom payment form
├── validation/
│   ├── PaymentValidation.ts             # Validation utilities
├── types/
│   ├── PaymentTypes.ts                  # Type definitions
├── hooks/
│   ├── useMultiplePayment.ts            # Main payment hook
├── config/
│   ├── PaymentConfig.ts                 # School/College configurations
└── index.ts                             # Main exports
```

### Integration Components

School and college specific wrappers:

```
/components/features/school/fees/multiple-payment/
└── SchoolMultiplePaymentForm.tsx

/components/features/college/fees/multiple-payment/
└── CollegeMultiplePaymentForm.tsx
```

## Usage

### Basic Usage

```tsx
import { SchoolMultiplePaymentForm } from '@/components/features/school/fees/multiple-payment/SchoolMultiplePaymentForm';

const MyComponent = () => {
  const student = {
    studentId: '123',
    admissionNo: 'ADM001',
    name: 'John Doe',
    className: '5th Grade',
    academicYear: '2025-2026'
  };

  const feeBalances = {
    bookFee: { total: 1500, paid: 0, outstanding: 1500 },
    tuitionFee: {
      total: 30000,
      term1: { paid: 0, outstanding: 15000 },
      term2: { paid: 0, outstanding: 15000 }
    },
    transportFee: {
      total: 4000,
      term1: { paid: 0, outstanding: 2000 },
      term2: { paid: 0, outstanding: 2000 }
    }
  };

  const handlePaymentComplete = async (data) => {
    // Process payment data
    console.log('Payment completed:', data);
  };

  return (
    <SchoolMultiplePaymentForm
      student={student}
      feeBalances={feeBalances}
      onPaymentComplete={handlePaymentComplete}
      onCancel={() => console.log('Cancelled')}
    />
  );
};
```

### Using Shared Components Directly

```tsx
import { MultiplePaymentForm } from '@/components/shared/payment';
import { schoolPaymentConfig } from '@/components/shared/payment/config/PaymentConfig';

const MyComponent = () => {
  return (
    <MultiplePaymentForm
      student={student}
      feeBalances={feeBalances}
      config={schoolPaymentConfig}
      onPaymentComplete={handlePaymentComplete}
      onCancel={handleCancel}
    />
  );
};
```

## Configuration

### School Configuration

```typescript
export const schoolPaymentConfig: PaymentFormConfig = {
  institutionType: 'school',
  maxTerms: 2,
  supportedPurposes: ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'],
  validationRules: {
    amountRange: { min: 1, max: 1000000, decimals: 2 },
    termSequence: true,
    duplicatePrevention: true,
    bookFeeFirst: true
  }
};
```

### College Configuration

```typescript
export const collegePaymentConfig: PaymentFormConfig = {
  institutionType: 'college',
  maxTerms: 3,
  supportedPurposes: ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'],
  validationRules: {
    amountRange: { min: 1, max: 1000000, decimals: 2 },
    termSequence: true,
    duplicatePrevention: true,
    bookFeeFirst: true
  }
};
```

## Validation System

### Real-time Validation

The system provides real-time validation for:

- **Amount validation**: Range, decimal places, required fields
- **Term sequence validation**: Sequential payment enforcement
- **Duplicate prevention**: Prevents duplicate payment types
- **Business rules**: Book fee must be paid first
- **Custom purpose validation**: Required for OTHER payments

### Validation Rules

```typescript
interface ValidationRules {
  amountRange: {
    min: number;
    max: number;
    decimals: number;
  };
  termSequence: boolean;
  duplicatePrevention: boolean;
  bookFeeFirst: boolean;
}
```

## API Integration

### Payment Data Format

The form generates this JSON structure for the API:

```json
{
  "details": [
    {
      "purpose": "BOOK_FEE",
      "paid_amount": 1500.0,
      "payment_method": "CASH"
    },
    {
      "purpose": "TUITION_FEE",
      "term_number": 1,
      "paid_amount": 5000.0,
      "payment_method": "ONLINE"
    },
    {
      "purpose": "OTHER",
      "custom_purpose_name": "Library Fine",
      "paid_amount": 250.0,
      "payment_method": "CASH"
    }
  ],
  "remarks": "Payment for Term 1 including miscellaneous fees"
}
```

### API Endpoints

- **School**: `POST /api/v1/school/income/pay-fee/{admission_no}`
- **College**: `POST /api/v1/college/income/pay-fee/{admission_no}`

## Customization

### Adding New Payment Types

1. Add the new purpose to `PaymentPurpose` type
2. Create a new component in `components/` directory
3. Add configuration to `PaymentConfig.ts`
4. Update the main form to handle the new purpose

### Custom Validation Rules

```typescript
const customValidationRules: ValidationRules = {
  amountRange: { min: 100, max: 50000, decimals: 2 },
  termSequence: false,
  duplicatePrevention: true,
  bookFeeFirst: false
};
```

## Error Handling

### Error Types

```typescript
interface PaymentError {
  type: 'validation' | 'business_rule' | 'not_found' | 'system_error' | 'generic';
  field?: string;
  message: string;
  suggestion: string;
}
```

### Error Display

The system provides user-friendly error messages with suggestions for resolution:

- **Validation errors**: Field-specific error messages
- **Business rule errors**: Explanation of business rules
- **System errors**: Generic error handling with retry options
- **Not found errors**: Clear indication of missing data

## Responsive Design

### Mobile Layout

- Stacked layout for payment items
- Touch-friendly buttons and inputs
- Optimized modal sizes
- Swipe gestures for item management

### Desktop Layout

- Side-by-side layout for better space utilization
- Keyboard shortcuts for power users
- Drag-and-drop for item reordering
- Multi-column forms

## Accessibility

### Keyboard Navigation

- Tab through form elements
- Enter to submit forms
- Escape to close modals
- Arrow keys for radio buttons

### Screen Reader Support

- ARIA labels for all form elements
- Error announcements
- Status updates for dynamic content
- Descriptive button labels

## Testing

### Unit Tests

```typescript
import { PaymentValidator } from '@/components/shared/payment/validation/PaymentValidation';

describe('PaymentValidator', () => {
  it('should validate amount range', () => {
    const result = PaymentValidator.validateAmount(1500, validationRules);
    expect(result.isValid).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MultiplePaymentForm } from '@/components/shared/payment';

describe('MultiplePaymentForm', () => {
  it('should render payment form', () => {
    render(<MultiplePaymentForm {...props} />);
    expect(screen.getByText('Student Information')).toBeInTheDocument();
  });
});
```

## Performance Considerations

- **Lazy loading**: Modal components are loaded on demand
- **Debounced validation**: Real-time validation is debounced
- **Optimistic updates**: UI updates immediately for better perceived performance
- **Efficient re-renders**: Proper memoization and state management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Framer Motion 10+
- Radix UI components
- Tailwind CSS
- TypeScript 4.9+

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include unit tests for new features
4. Update documentation
5. Follow the established naming conventions

## License

This project is licensed under the MIT License.