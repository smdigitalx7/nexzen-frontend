import { useState } from "react";
import { UserCheck, Users } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import AdmissionsList from "@/components/features/college/admissions/AdmissionsList";
import ConfirmedReservationsTab from "@/components/features/college/admissions/ConfirmedReservationsTab";

const CollegeAdmissionsPage = () => {
  const [activeTab, setActiveTab] = useState("reservations");

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