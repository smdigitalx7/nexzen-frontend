# Payment Processing Components

A comprehensive set of animated, reusable UI components for payment processing, confirmation dialogs, and receipt generation in the NexGen ERP system.

## Components Overview

### 1. PaymentProcessor
The main payment processing component with animated states and progress tracking.

**Features:**
- Animated step-by-step payment process
- Real-time progress indicators
- Multiple payment method support
- Error handling and retry functionality
- Auto-processing option

### 2. PaymentConfirmationDialog
A secure confirmation dialog that displays payment details before processing.

**Features:**
- Payment summary with all details
- Security notices and warnings
- Card details masking/unmasking
- Confirmation and cancellation actions

### 3. PaymentSuccess
An animated success screen with transaction details and receipt options.

**Features:**
- Celebration animations
- Transaction details display
- Receipt download options
- Email sharing capabilities

### 4. ReceiptDownload
A comprehensive receipt generation and download component.

**Features:**
- PDF receipt generation via API
- Email delivery options
- Print functionality
- Multiple format support

### 5. PaymentDemo
An interactive demo component showcasing all payment scenarios.

**Features:**
- Multiple payment scenarios
- Interactive demonstrations
- Feature showcase

## Installation & Setup

### 1. API Integration

First, ensure your backend has the payment receipt API endpoints:

```typescript
// Backend API endpoints needed:
POST /api/payment-receipts/generate
GET /api/payment-receipts/{receiptId}/download
GET /api/payment-receipts/transaction/{transactionId}
GET /api/payment-receipts/student/{studentId}
POST /api/payment-receipts/{receiptId}/send-email
GET /api/payment-receipts/stats
```

### 2. Service Configuration

The components use the `PaymentReceiptsService` which integrates with your existing API client:

```typescript
// Already configured in: lib/services/general/payment-receipts.service.ts
// Uses your existing apiClient from lib/api-client
```

### 3. Hooks Integration

The components use React Query hooks for data management:

```typescript
// Available hooks in: lib/hooks/general/use-payment-receipts.ts
import { 
  useGeneratePaymentReceipt,
  useDownloadPaymentReceipt,
  useSendReceiptEmail,
  usePaymentReceipts,
  useStudentPaymentReceipts
} from '@/lib/hooks/general/use-payment-receipts';
```

## Usage Examples

### Basic Payment Processing

```tsx
import { PaymentProcessor, PaymentData } from '@/components/shared/payment';

const MyPaymentPage = () => {
  const paymentData: PaymentData = {
    id: 'payment-123',
    amount: 15000,
    currency: 'INR',
    description: 'Monthly Tuition Fee',
    merchant: 'NexGen Academy',
    paymentMethod: 'card',
    status: 'pending'
  };

  const handlePaymentComplete = (completedPayment: PaymentData) => {
    console.log('Payment completed:', completedPayment);
    // Handle success (redirect, show notification, etc.)
  };

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error);
    // Handle error (show error message, etc.)
  };

  return (
    <PaymentProcessor
      paymentData={paymentData}
      onPaymentComplete={handlePaymentComplete}
      onPaymentFailed={handlePaymentFailed}
      onPaymentCancel={() => console.log('Payment cancelled')}
      autoProcess={false}
      processingDelay={3000}
    />
  );
};
```

### Payment Confirmation Dialog

```tsx
import { PaymentConfirmationDialog } from '@/components/shared/payment';

const PaymentConfirmation = ({ isOpen, onClose, paymentData }) => {
  const handleConfirm = () => {
    // Process payment
    onClose();
  };

  return (
    <PaymentConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      paymentData={paymentData}
      onConfirm={handleConfirm}
      onCancel={() => onClose()}
    />
  );
};
```

### Receipt Download

```tsx
import { ReceiptDownload } from '@/components/shared/payment';

const ReceiptSection = ({ paymentData, isOpen, onClose }) => {
  return (
    <ReceiptDownload
      open={isOpen}
      onOpenChange={onClose}
      paymentData={paymentData}
    />
  );
};
```

### Interactive Demo

```tsx
import { PaymentDemo } from '@/components/shared/payment';

const PaymentDemoPage = () => {
  return <PaymentDemo />;
};
```

## Payment Data Structure

```typescript
interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  timestamp?: Date;
  fees?: number;
  totalAmount?: number;
}
```

## Styling & Theming

The components use your existing design system:
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI components
- Consistent with your existing UI patterns

## Animation Features

- **Step Transitions**: Smooth transitions between payment steps
- **Progress Indicators**: Animated progress bars and loading states
- **Success Celebrations**: Confetti and checkmark animations
- **Error States**: Shake animations for errors
- **Hover Effects**: Interactive hover states
- **Loading States**: Spinner and skeleton animations

## API Integration

The components are designed to work with your existing API structure:

1. **Service Layer**: Uses your existing service pattern
2. **React Query**: Integrates with your query client
3. **Error Handling**: Consistent with your error handling patterns
4. **TypeScript**: Fully typed with your existing types

## Customization

### Payment Methods
Add new payment methods by extending the `paymentMethod` type:

```typescript
type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'your-new-method';
```

### Styling
Customize colors and animations by modifying the Tailwind classes in each component.

### API Endpoints
Modify the service endpoints in `payment-receipts.service.ts` to match your backend.

## Error Handling

The components include comprehensive error handling:
- Network errors
- Validation errors
- Payment processing errors
- Receipt generation errors

## Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interactions

## Performance

- Lazy loading of components
- Optimized animations
- Efficient re-renders
- Minimal bundle size impact

## Testing

The components are designed to be easily testable:
- Isolated component logic
- Mockable API calls
- Accessible test selectors
- Clear prop interfaces

## Future Enhancements

- Multi-currency support
- Recurring payment options
- Payment method management
- Advanced receipt customization
- Payment analytics dashboard
