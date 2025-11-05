import { useState } from "react";
import { Building2, UserCheck, Users, FileText } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { AdmissionsList } from "@/components/features/college";
import ConfirmedReservationsTab from "@/components/features/college/admissions/ConfirmedReservationsTab";

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
