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
import { useSchoolClasses, useSchoolSubjects, useSchoolExams, useSchoolTests } from "@/lib/hooks/school";
import { useQueries } from "@tanstack/react-query";
import { SchoolDropdownsService } from "@/lib/services/school/dropdowns.service";
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
  const classesEnabled = useTabEnabled(["classes", "sections"], "classes"); // Classes needed for sections
  const subjectsEnabled = useTabEnabled("subjects", "classes");
  const examsEnabled = useTabEnabled("exams", "classes");
  const testsEnabled = useTabEnabled("tests", "classes");

  // ✅ Always fetch data for cards (not lazy loaded)
  // Cards need data immediately, so we fetch regardless of active tab
  const {
    data: backendClasses = [],
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrObj,
  } = useSchoolClasses({
    enabled: true, // Always enabled for cards
  });

  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useSchoolSubjects({
    enabled: true, // Always enabled for cards
  });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useSchoolExams({
    enabled: true, // Always enabled for cards
  });

  const {
    data: tests = [],
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
  } = useSchoolTests({
    enabled: true, // Always enabled for cards
  });

  // Memoized effective classes
  const effectiveClasses = useMemo(() => backendClasses, [backendClasses]);

  // Fetch sections for all classes to calculate total sections (non-blocking)
  // Using dropdown service which is cached and faster
  const sectionsQueries = useQueries({
    queries: effectiveClasses.map((classItem) => ({
      queryKey: ["school-dropdowns", "sections", classItem.class_id],
      queryFn: async () => {
        const response = await SchoolDropdownsService.getSections(classItem.class_id);
        return response.items || [];
      },
      enabled: effectiveClasses.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Only retry once to avoid long waits
    })),
  });

  // Calculate total sections from all queries (non-blocking - updates as data arrives)
  const totalSectionsCount = useMemo(() => {
    return sectionsQueries.reduce((total, query) => {
      if (query.data && Array.isArray(query.data)) {
        return total + query.data.length;
      }
      return total;
    }, 0);
  }, [sectionsQueries]);

  // Memoized calculations
  const academicStats = useMemo(() => {
    const totalClasses = effectiveClasses.length;
    const totalSubjects = backendSubjects.length;
    const totalTests = tests.length;
    const totalSections = totalSectionsCount;

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
  }, [effectiveClasses, backendSubjects, exams, tests, totalSectionsCount]);

  // Memoized loading and error states
  // Note: sectionsLoading is excluded from main loading state to avoid blocking UI
  // Sections count will update as data arrives (non-blocking)
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
