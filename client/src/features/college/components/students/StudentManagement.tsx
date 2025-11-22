import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Users, IdCard, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { TabSwitcher } from "@/common/components/shared";
import { useAuthStore } from "@/core/auth/authStore";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { useFilteredTabs, useDefaultTab } from "@/core/permissions";
import { StudentsTab } from "./StudentsTab";
import { EnrollmentsTab } from "./EnrollmentsTab";
import { TransportTab } from "./TransportTab";

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  
  const allTabs = useMemo(() => [
    {
      value: "enrollments",
      label: "Enrollments",
      icon: IdCard,
      content: <EnrollmentsTab />,
    },
    {
      value: "transport",
      label: "Transport",
      icon: MapPin,
      content: <TransportTab />,
    },
  ], []);

  // Filter tabs based on permissions
  const tabs = useFilteredTabs("students", allTabs);
  
  // Get default tab (enrollments for ACCOUNTANT)
  const defaultTab = useDefaultTab("students", "enrollments");
  const { activeTab: activePageTab, setActiveTab: setActivePageTab } =
    useTabNavigation(defaultTab || "enrollments");

  // Auto-select first tab if current tab doesn't exist
  useEffect(() => {
    const tabExists = tabs.some(tab => tab.value === activePageTab);
    if (!tabExists && tabs.length > 0) {
      setActivePageTab(tabs[0].value);
    }
  }, [activePageTab, setActivePageTab, tabs]);

  // Dynamic header content based on active tab
  const getHeaderContent = () => {
    switch (activePageTab) {
      case "enrollments":
        return {
          title: "Student Enrollments Management",
          description:
            "Manage student enrollments, and edit student details",
        };
      case "transport":
        return {
          title: "Transport Management",
          description:
            "Manage student transport assignments, routes and pickup points",
        };
      default:
        return {
          title: "Student Management",
          description:
            "Manage student records, attendance, and academic progress",
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {headerContent.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {headerContent.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "COLLEGE" ? (
              <Users className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={tabs}
        activeTab={activePageTab}
        onTabChange={setActivePageTab}
      />
    </motion.div>
  );
};

export default StudentManagement;
