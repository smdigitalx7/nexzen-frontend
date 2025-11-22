import { useState } from "react";
import { Building2, UserCheck, Users, FileText } from "lucide-react";
import { TabSwitcher } from "@/common/components/shared";
import type { TabItem } from "@/common/components/shared/TabSwitcher";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { useAuthStore } from "@/core/auth/authStore";
import { Badge } from "@/common/components/ui/badge";
import { AdmissionsList } from "@/features/college/components";
import ConfirmedReservationsTab from "@/features/college/components/admissions/ConfirmedReservationsTab";

const CollegeAdmissionsPage = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("reservations");

  const tabs: TabItem[] = [
    {
      value: "reservations",
      label: "Confirmed Reservations",
      icon: UserCheck,
      content: <ConfirmedReservationsTab />,
    },
    {
      value: "admissions",
      label: "Student Admissions",
      icon: Users,
      content: <AdmissionsList />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">College Admissions</h1>
          <p className="text-muted-foreground">
            Manage student reservations and admissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "COLLEGE" ? (
              <FileText className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </div>

      <TabSwitcher
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default CollegeAdmissionsPage;
