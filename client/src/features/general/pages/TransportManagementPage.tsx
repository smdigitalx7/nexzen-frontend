import TransportManagement from "@/features/general/components/transport/TransportManagement";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";

const TransportManagementPage = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('TransportManagement Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <TransportManagement />
    </ProductionErrorBoundary>
  );
};

export default TransportManagementPage;
