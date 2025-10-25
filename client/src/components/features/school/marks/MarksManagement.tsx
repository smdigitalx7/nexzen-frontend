import { memo, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ClipboardList,
  FileText,
  Calculator,
  Target,
  Building2,
  TrophyIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { StatsCard } from "@/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/components/shared/dashboard/DashboardGrid";
import {
  useMarksStatistics,
  type MarksData,
} from "@/lib/hooks/school/use-marks-statistics";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import ExamMarksManagement from "./ExamMarksManagement";
import TestMarksManagement from "./TestMarksManagement";
import { useAuthStore } from "@/store/authStore";

const MarksManagementComponent = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("exam-marks");

  // State management for marks data
  const [examMarksData, setExamMarksData] = useState<MarksData[]>([]);
  const [testMarksData, setTestMarksData] = useState<MarksData[]>([]);

  // Memoized current marks data
  const currentMarksData = useMemo(
    () => (activeTab === "exam-marks" ? examMarksData : testMarksData),
    [activeTab, examMarksData, testMarksData]
  );

  // Calculate statistics for current active tab
  const statistics = useMarksStatistics(currentMarksData);

  // Memoized tab change handler
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  // Memoized exam marks data handler
  const handleExamMarksDataChange = useCallback((data: MarksData[]) => {
    setExamMarksData(data);
  }, []);

  // Memoized test marks data handler
  const handleTestMarksDataChange = useCallback((data: MarksData[]) => {
    setTestMarksData(data);
  }, []);

  // Memoized header content
  const headerContent = useMemo(() => {
    const isExamMarks = activeTab === "exam-marks";
    return {
      title: isExamMarks ? "Marks Management" : "Tests Management",
      description: isExamMarks
        ? "Track exam results and manage academic performance"
        : "Track test results and manage academic performance",
    };
  }, [activeTab]);

  // Memoized statistics cards
  const statisticsCards = useMemo(
    () => [
      {
        title: `Total ${activeTab === "exam-marks" ? "Marks" : "Tests"}`,
        value: statistics.totalMarks,
        icon: FileText,
        color: "blue" as const,
      },
      {
        title: "Avg Score",
        value: `${statistics.avgPercentage}%`,
        icon: Calculator,
        color: "green" as const,
      },
      {
        title: "Pass Rate",
        value: `${statistics.passPercentage}%`,
        icon: Target,
        color: "purple" as const,
      },
      {
        title: "Top Score",
        value: `${statistics.topScore}%`,
        icon: TrophyIcon,
        color: "orange" as const,
      },
    ],
    [activeTab, statistics]
  );

  // Memoized tabs configuration
  const tabsConfig = useMemo(
    () => [
      {
        value: "exam-marks",
        label: "Marks",
        icon: GraduationCap,
        content: (
          <ExamMarksManagement onDataChange={handleExamMarksDataChange} />
        ),
      },
      {
        value: "test-marks",
        label: "Tests",
        icon: ClipboardList,
        content: (
          <TestMarksManagement onDataChange={handleTestMarksDataChange} />
        ),
      },
    ],
    [handleExamMarksDataChange, handleTestMarksDataChange]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {headerContent.title}
              </h1>
              <p className="text-slate-600 mt-1">{headerContent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {currentBranch?.branch_type === "SCHOOL" ? (
                  <GraduationCap className="h-3 w-3" />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
                {currentBranch?.branch_name}
              </Badge>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardGrid columns={4} gap="md">
              {statisticsCards.map((card, index) => (
                <StatsCard
                  key={`${card.title}-${index}`}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  variant="elevated"
                  size="md"
                />
              ))}
            </DashboardGrid>
          </motion.div>

          {/* Main Content */}
          <TabSwitcher
            tabs={tabsConfig}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MarksManagementComponent;
