import { motion } from "framer-motion";
import { Users, IdCard, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import { StudentsTab } from "./StudentsTab";
import { EnrollmentsTab } from "./EnrollmentsTab";
import { TransportTab } from "./TransportTab";

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab: activePageTab, setActiveTab: setActivePageTab } =
    useTabNavigation("students");

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
            Student Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student records, attendance, and academic progress
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
        tabs={[
          // {
          //   value: "students",
          //   label: "Students",
          //   icon: Users,
          //   content: <StudentsTab />,
          // },
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
        ]}
        activeTab={activePageTab}
        onTabChange={setActivePageTab}
      />
    </motion.div>
  );
};

export default StudentManagement;
