import { memo, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ClipboardList,
  FileText,
  Building2,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { TabSwitcher } from "@/common/components/shared";
import { type MarksData } from "@/features/school/hooks";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import ExamMarksManagement from "./ExamMarksManagement";
import TestMarksManagement from "./TestMarksManagement";
import { 
  ExamMarksReport, 
  TestMarksReport,
  StudentReportView,
} from "./components";
import { useAuthStore } from "@/core/auth/authStore";
import { useFilteredTabs } from "@/core/permissions";

const MarksManagementComponent = () => {
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const { activeTab, setActiveTab } = useTabNavigation("exam-marks");

  // State management for marks data
  const [_examMarksData, setExamMarksData] = useState<MarksData[]>([]);
  const [_testMarksData, setTestMarksData] = useState<MarksData[]>([]);

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
          title: "Reports",
          description: "Exam reports, test reports, and student reports",
        };
      default:
        return {
          title: "Marks Management",
          description: "Track exam results and manage academic performance",
        };
    }
  }, [activeTab]);

  // Reports tab state: Exam Reports | Test Reports | Student Reports
  const [reportsActiveTab, setReportsActiveTab] = useState<"exam" | "test" | "student">("exam");

  // Memoized tabs configuration - components receive props but instances stay stable
  // ✅ OPTIMIZATION: TabSwitcher defaults to forceMount={false}, so inactive tabs are not mounted
  // This ensures queries in ExamMarksManagement and TestMarksManagement only run when their tab is active
  const allTabsConfig = useMemo(
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
          <div className="space-y-4">
            <TabSwitcher
              variant="subtab"
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
                {
                  value: "student",
                  label: "Student Reports",
                  icon: FileText,
                  content: <StudentReportView />,
                },
              ]}
              activeTab={reportsActiveTab}
              onTabChange={(value) => setReportsActiveTab(value as "exam" | "test" | "student")}
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
    ]
  );

  // Filter tabs based on permissions (ACADEMIC should not see Reports tab)
  const tabsConfig = useFilteredTabs("marks", allTabsConfig);

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
