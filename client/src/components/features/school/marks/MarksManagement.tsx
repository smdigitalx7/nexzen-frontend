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
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { StatsCard } from "@/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/components/shared/dashboard/DashboardGrid";
import {
  useMarksStatistics,
  type MarksData,
} from "@/lib/hooks/school";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import ExamMarksManagement from "./ExamMarksManagement";
import TestMarksManagement from "./TestMarksManagement";
import { 
  ExamMarksReport, 
  TestMarksReport,
  StudentMarksSearchView,
  StudentPerformanceSearchView,
} from "./components";
import { useAuthStore } from "@/store/authStore";

const MarksManagementComponent = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("exam-marks");

  // State management for marks data
  const [examMarksData, setExamMarksData] = useState<MarksData[]>([]);
  const [testMarksData, setTestMarksData] = useState<MarksData[]>([]);

  // Separate filter states for Exam Marks - maintains independent state
  const [examSelectedClass, setExamSelectedClass] = useState<number | null>(null);
  const [examSelectedSection, setExamSelectedSection] = useState<number | null>(null);
  const [examSelectedSubject, setExamSelectedSubject] = useState<number | null>(null);
  const [examSelectedGrade, setExamSelectedGrade] = useState("all");
  const [examSelectedExam, setExamSelectedExam] = useState<number | null>(null);

  // Separate filter states for Test Marks - maintains independent state
  const [testSelectedClass, setTestSelectedClass] = useState<number | null>(null);
  const [testSelectedSection, setTestSelectedSection] = useState<number | null>(null);
  const [testSelectedSubject, setTestSelectedSubject] = useState<number | null>(null);
  const [testSelectedGrade, setTestSelectedGrade] = useState("all");
  const [testSelectedTest, setTestSelectedTest] = useState<number | null>(null);

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
    switch (activeTab) {
      case "exam-marks":
        return {
          title: "Marks Management",
          description: "Track exam results and manage academic performance",
        };
      case "test-marks":
        return {
          title: "Tests Management",
          description: "Track test results and manage academic performance",
        };
      case "reports":
        return {
          title: "Marks Reports",
          description: "Generate and view comprehensive marks reports",
        };
      case "student-views":
        return {
          title: "Student Views",
          description: "View individual student marks and performance",
        };
      default:
        return {
          title: "Marks Management",
          description: "Track exam results and manage academic performance",
        };
    }
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

  // Reports tab state
  const [reportsActiveTab, setReportsActiveTab] = useState<"exam" | "test">("exam");
  
  // Student Views tab state
  const [studentViewsActiveTab, setStudentViewsActiveTab] = useState<"marks" | "performance">("marks");

  // Memoized tabs configuration - components receive props but instances stay stable
  // forceMount in TabSwitcher keeps components mounted, preventing remounts
  const tabsConfig = useMemo(
    () => [
      {
        value: "exam-marks",
        label: "Marks",
        icon: GraduationCap,
        content: (
          <ExamMarksManagement 
            key="exam-marks"
            onDataChange={handleExamMarksDataChange}
            selectedClass={examSelectedClass}
            setSelectedClass={setExamSelectedClass}
            selectedSection={examSelectedSection}
            setSelectedSection={setExamSelectedSection}
            selectedSubject={examSelectedSubject}
            setSelectedSubject={setExamSelectedSubject}
            selectedGrade={examSelectedGrade}
            setSelectedGrade={setExamSelectedGrade}
            selectedExam={examSelectedExam}
            setSelectedExam={setExamSelectedExam}
          />
        ),
      },
      {
        value: "test-marks",
        label: "Tests",
        icon: ClipboardList,
        content: (
          <TestMarksManagement 
            key="test-marks"
            onDataChange={handleTestMarksDataChange}
            selectedClass={testSelectedClass}
            setSelectedClass={setTestSelectedClass}
            selectedSection={testSelectedSection}
            setSelectedSection={setTestSelectedSection}
            selectedSubject={testSelectedSubject}
            setSelectedSubject={setTestSelectedSubject}
            selectedGrade={testSelectedGrade}
            setSelectedGrade={setTestSelectedGrade}
            selectedTest={testSelectedTest}
            setSelectedTest={setTestSelectedTest}
          />
        ),
      },
      {
        value: "reports",
        label: "Reports",
        icon: BarChart3,
        content: (
          <div className="space-y-6">
            <TabSwitcher
              tabs={[
                {
                  value: "exam",
                  label: "Exam Reports",
                  icon: GraduationCap,
                  content: <ExamMarksReport />,
                },
                {
                  value: "test",
                  label: "Test Reports",
                  icon: ClipboardList,
                  content: <TestMarksReport />,
                },
              ]}
              activeTab={reportsActiveTab}
              onTabChange={(value) => setReportsActiveTab(value as "exam" | "test")}
            />
          </div>
        ),
      },
      {
        value: "student-views",
        label: "Student Views",
        icon: FileText,
        content: (
          <div className="space-y-6">
            <TabSwitcher
              tabs={[
                {
                  value: "marks",
                  label: "Marks View",
                  icon: FileText,
                  content: <StudentMarksSearchView />,
                },
                {
                  value: "performance",
                  label: "Performance View",
                  icon: BarChart3,
                  content: <StudentPerformanceSearchView />,
                },
              ]}
              activeTab={studentViewsActiveTab}
              onTabChange={(value) => setStudentViewsActiveTab(value as "marks" | "performance")}
            />
          </div>
        ),
      },
    ],
    [
      handleExamMarksDataChange,
      handleTestMarksDataChange,
      examSelectedClass,
      examSelectedSection,
      examSelectedSubject,
      examSelectedGrade,
      examSelectedExam,
      testSelectedClass,
      testSelectedSection,
      testSelectedSubject,
      testSelectedGrade,
      testSelectedTest,
      reportsActiveTab,
      studentViewsActiveTab,
    ]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
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

          {/* Statistics Cards - Only show for Marks and Tests tabs */}
          {(activeTab === "exam-marks" || activeTab === "test-marks") && (
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
          )}

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
