import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  School,
  Building2,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  FileText,
  Settings,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSubjects } from "@/lib/hooks/school/use-school-subjects";
import {
  useSchoolExams,
  useSchoolTests,
} from "@/lib/hooks/school/use-school-exams-tests";
import AcademicYearManagement from "@/components/features/school/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/school/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/school/academic/subjects/SubjectsTab";
import { SectionsTab } from "@/components/features/school/academic/sections/SectionsTab";
import { TeachersTab } from "@/components/features/school/academic/teachers/TeachersTab";
import { ExamsTab } from "@/components/features/school/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/school/academic/tests/TestTab";
import { AcademicOverviewCards } from "@/components/features/school/academic/AcademicOverviewCards";
import { useAuthStore } from "@/store/authStore";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/lib/hooks/use-tab-navigation";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("classes");

  // ✅ LAZY LOADING: Get enabled states at the top level to avoid hook order issues
  const classesEnabled = useTabEnabled(["classes", "sections"]); // Classes needed for sections
  const subjectsEnabled = useTabEnabled("subjects");
  const examsEnabled = useTabEnabled("exams");
  const testsEnabled = useTabEnabled("tests");

  // ✅ LAZY LOADING: Only fetch data for active tab
  const {
    data: backendClasses = [],
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrObj,
  } = useSchoolClasses({
    enabled: classesEnabled,
  });

  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useSchoolSubjects({
    enabled: subjectsEnabled,
  });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useSchoolExams({
    enabled: examsEnabled,
  });

  const {
    data: tests = [],
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
  } = useSchoolTests({
    enabled: testsEnabled,
  });

  // Memoized effective classes
  const effectiveClasses = useMemo(() => backendClasses, [backendClasses]);

  // Memoized calculations
  const academicStats = useMemo(() => {
    const totalSections = 0; // Don't fetch all sections - only fetch when user selects a class in SectionsTab

    const totalClasses = effectiveClasses.length;
    const totalSubjects = backendSubjects.length;
    const totalTests = tests.length;

    const today = new Date();
    const toDate = (v: any) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const activeExams = exams.filter((exam: any) => {
      const d = toDate(exam.exam_date);
      return d ? d >= new Date(today.toDateString()) : false;
    }).length;

    return {
      totalClasses,
      totalSubjects,
      totalSections,
      activeExams,
      totalTests,
    };
  }, [effectiveClasses, backendSubjects, exams, tests]);

  // Memoized loading and error states
  const loadingStates = useMemo(() => {
    const isLoading =
      classesLoading ||
      subjectsLoading ||
      examsLoading ||
      testsLoading;
    const hasError = classesError || subjectsError || examsError || testsError;
    const errorMessage =
      (classesErrObj as any)?.message ||
      (subjectsErrObj as any)?.message ||
      (examsErrObj as any)?.message ||
      (testsErrObj as any)?.message ||
      undefined;

    return { isLoading, hasError, errorMessage };
  }, [
    classesLoading,
    subjectsLoading,
    examsLoading,
    testsLoading,
    classesError,
    subjectsError,
    examsError,
    testsError,
    classesErrObj,
    subjectsErrObj,
    examsErrObj,
    testsErrObj,
  ]);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Memoized header content
  const headerContent = useMemo(() => {
    const contentMap = {
      classes: {
        title: "Classes Management",
        description: "Manage academic classes and their subject assignments",
      },
      sections: {
        title: "Sections Management",
        description: "Manage class sections and student groupings",
      },
      teachers: {
        title: "Teachers Management",
        description: "Manage teaching staff and their assignments",
      },
      subjects: {
        title: "Subjects Management",
        description: "Manage academic subjects and their assignments",
      },
      exams: {
        title: "Exams Management",
        description: "Manage academic examinations and schedules",
      },
      tests: {
        title: "Tests Management",
        description: "Manage academic tests and assessments",
      },
      "academic-years": {
        title: "Academic Years Management",
        description: "Manage academic years, terms, and academic calendar",
      },
    };

    return (
      contentMap[activeTab as keyof typeof contentMap] || {
        title: "Academic Management",
        description:
          "Comprehensive academic structure and performance management",
      }
    );
  }, [activeTab]);

  // Memoized tab configuration
  const tabsConfig = useMemo(
    () => [
      {
        value: "classes",
        label: "Classes",
        icon: Users,
        content: (
          <ClassesTab
            classesWithSubjects={backendClasses}
            classesLoading={loadingStates.isLoading}
            hasError={loadingStates.hasError}
            errorMessage={loadingStates.errorMessage}
          />
        ),
      },
      {
        value: "subjects",
        label: "Subjects",
        icon: GraduationCap,
        content: (
          <SubjectsTab
            backendSubjects={backendSubjects}
            subjectsLoading={loadingStates.isLoading}
            currentBranch={currentBranch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedBranchType={selectedBranchType}
            setSelectedBranchType={setSelectedBranchType}
          />
        ),
      },
      {
        value: "sections",
        label: "Sections",
        icon: Layers,
        content: <SectionsTab />,
      },
      {
        value: "teachers",
        label: "Teachers",
        icon: UserCheck,
        content: <TeachersTab />,
      },
      {
        value: "exams",
        label: "Exams",
        icon: Calendar,
        content: (
          <ExamsTab
            exams={exams}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={loadingStates.isLoading}
            hasError={loadingStates.hasError}
            errorMessage={loadingStates.errorMessage}
          />
        ),
      },
      {
        value: "tests",
        label: "Tests",
        icon: FileText,
        content: (
          <TestTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tests={tests}
            isLoading={testsLoading}
            hasError={testsError}
            errorMessage={(testsErrObj as any)?.message}
          />
        ),
      },
      {
        value: "academic-years",
        label: "Academic Years",
        icon: Settings,
        content: <AcademicYearManagement />,
      },
    ],
    [
      backendClasses,
      backendSubjects,
      currentBranch,
      searchTerm,
      selectedBranchType,
      exams,
      tests,
      loadingStates,
      testsLoading,
      testsError,
      testsErrObj,
    ]
  );

  // ✅ URL-based tab management with persistence
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleBranchTypeChange = useCallback((value: string) => {
    setSelectedBranchType(value);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {headerContent.title}
          </h1>
          <p className="text-muted-foreground">{headerContent.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "SCHOOL" ? (
              <School className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Academic Overview Cards */}
      <AcademicOverviewCards
        totalClasses={academicStats.totalClasses}
        totalSubjects={academicStats.totalSubjects}
        totalSections={academicStats.totalSections}
        activeExams={academicStats.activeExams}
        totalTests={academicStats.totalTests}
        loading={loadingStates.isLoading}
      />

      {/* Tabs */}
      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default AcademicManagement;
