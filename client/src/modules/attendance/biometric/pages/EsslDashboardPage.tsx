import React from "react";
import { EsslDashboard } from "../components/EsslDashboard";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";

const EsslDashboardPage = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('EsslDashboard Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <div className="p-6">
        <EsslDashboard />
      </div>
    </ProductionErrorBoundary>
  );
};

export default EsslDashboardPage;
