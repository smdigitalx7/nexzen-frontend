import { EmployeeManagementTemplate } from "../../features/general/employee-management/templates";
import { ProductionErrorBoundary } from "@/components/shared/ProductionErrorBoundary";

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