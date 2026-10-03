import React from "react";
import { HolidaysManagementTemplate } from "@/features/general/components/holiday-management/HolidaysManagementTemplate";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";

export const HolidaysPage: React.FC = () => {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error("HolidaysPage Error Boundary caught error:", error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
      <div className="p-6 space-y-6">
        <HolidaysManagementTemplate />
      </div>
    </ProductionErrorBoundary>
  );
};

export default HolidaysPage;
