import { useState } from "react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { Users } from "lucide-react";
import AdmissionsList from "@/components/features/school/admissions/AdmissionsList";
import ConfirmedReservationsTab from "@/components/features/school/admissions/ConfirmedReservationsTab";


const SchoolAdmissionsPage = () => {
  const [activeTab, setActiveTab] = useState("reservations");


  const tabs: TabItem[] = [
    {
      value: "reservations",
      label: "Confirmed Reservations",
      icon: Users,
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
          <h1 className="text-3xl font-bold">School Admissions</h1>
          <p className="text-muted-foreground">
            Process confirmed reservations and manage student admissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default SchoolAdmissionsPage;
