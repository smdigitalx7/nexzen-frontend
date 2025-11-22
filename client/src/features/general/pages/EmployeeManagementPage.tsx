import { EmployeeManagementTemplate } from "@/features/general/components/employee-management/templates";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";

const EmployeeManagementPage = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('EmployeeManagement Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <EmployeeManagementTemplate />
    </ProductionErrorBoundary>
  );
};

export default EmployeeManagementPage;