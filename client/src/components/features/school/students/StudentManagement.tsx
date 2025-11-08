import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Users, IdCard, MapPin, School, Building2, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import { StudentsTab } from "./StudentsTab";
import { EnrollmentsTab } from "./EnrollmentsTab";
import { TransportTab } from "./TransportTab";
import SectionMappingTab from "./SectionMappingTab";

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab: activePageTab, setActiveTab: setActivePageTab } =
    useTabNavigation("section-mapping");

  const tabs = useMemo(() => [
    {
      value: "section-mapping",
      label: "Section Mapping",
      icon: LayoutGrid,
      content: <SectionMappingTab />,
    },
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
      case "students":
        return {
          title: "Student Management",
          description:
            "Manage student records, attendance, and academic progress",
        };
      case "enrollments":
        return {
          title: "Enrollment Management",
          description:
            "Manage student enrollments, course assignments, and academic records",
        };
      case "transport":
        return {
          title: "Transport Management",
          description:
            "Manage student transport assignments, routes, and fee balances",
        };
      case "section-mapping":
        return {
          title: "Section Mapping",
          description:
            "Map students to sections and manage section assignments",
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
      <div className="flex items-start justify-between">
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
            {currentBranch?.branch_type === "SCHOOL" ? (
              <Users className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </div>

      <TabSwitcher
        tabs={tabs}
        activeTab={activePageTab}
        onTabChange={setActivePageTab}
      />
    </motion.div>
  );
};

export default StudentManagement;
