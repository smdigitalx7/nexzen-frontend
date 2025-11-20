import UserManagement from "../../features/general/user-management/UserManagement";
import { ProductionErrorBoundary } from "@/components/shared/ProductionErrorBoundary";

const UserManagementPage = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('UserManagement Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <UserManagement />
    </ProductionErrorBoundary>
  );
};

export default UserManagementPage;
