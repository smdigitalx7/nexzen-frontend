import { PayrollManagementTemplate } from "@/features/general/components/financial-management/PayrollManagementTemplate";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";

const PayrollManagementPage = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('PayrollManagement Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <PayrollManagementTemplate />
    </ProductionErrorBoundary>
  );
};

export default PayrollManagementPage;
