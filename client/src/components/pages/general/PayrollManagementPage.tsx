import { PayrollManagementTemplate } from "../../features/general/financial-management/PayrollManagementTemplate";
import { ProductionErrorBoundary } from "@/components/shared/ProductionErrorBoundary";

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
