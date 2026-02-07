import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Users, IdCard, MapPin, School, Building2, LayoutGrid } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { TabSwitcher } from "@/common/components/shared";
import { useAuthStore } from "@/core/auth/authStore";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { useFilteredTabs, useDefaultTab } from "@/core/permissions";
import { StudentsTab } from "./StudentsTab";
import { EnrollmentsTab } from "./EnrollmentsTab";
import { TransportTab } from "./TransportTab";
import { PromotionDropoutTab } from "./PromotionDropoutTab";
import SectionMappingTab from "./SectionMappingTab";
import { ArrowUpCircle } from "lucide-react";

const StudentManagement = () => {
  const currentBranch = useAuthStore((state) => state.currentBranch);
  
  // Tabs in hierarchical workflow order: Enrollments → Section Mapping → Transport → Promotion & Dropout
  const allTabs = useMemo(() => [
    {
      value: "enrollments",
      label: "Enrollments",
      icon: IdCard,
      content: <EnrollmentsTab />,
    },
    {
      value: "section-mapping",
      label: "Section Mapping",
      icon: LayoutGrid,
      content: <SectionMappingTab />,
    },
    {
      value: "transport",
      label: "Transport",
      icon: MapPin,
      content: <TransportTab />,
    },
    {
      value: "promotion-dropout",
      label: "Promotion & Dropout",
      icon: ArrowUpCircle,
      content: <PromotionDropoutTab />,
    },
  ], []);

  // Filter tabs based on permissions
  const tabs = useFilteredTabs("students", allTabs);
  
  // Get default tab (enrollments for ACCOUNTANT, section-mapping for others)
  const defaultTab = useDefaultTab("students", "enrollments");
  const { activeTab: activePageTab, setActiveTab: setActivePageTab } =
    useTabNavigation(defaultTab || "enrollments");

  // Auto-select first tab if current tab doesn't exist
  // Optimized to only run when tabs change and ensure stability
  useEffect(() => {
    if (tabs.length === 0) return;
    
    const tabValues = tabs.map(t => t.value);
    const tabExists = tabValues.includes(activePageTab);
    
    if (!tabExists) {
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
      case "promotion-dropout":
        return {
          title: "Promotion & Dropout Management",
          description:
            "Manage student promotions to next academic level and handle dropout records",
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
