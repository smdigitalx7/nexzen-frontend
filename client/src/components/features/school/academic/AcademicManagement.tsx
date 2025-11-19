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
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import {
  useSchoolClasses,
  useSchoolSubjects,
  useSchoolExams,
  useSchoolTests,
} from "@/lib/hooks/school";
import AcademicYearManagement from "@/components/features/school/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/school/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/school/academic/subjects/SubjectsTab";
import { SectionsTab } from "@/components/features/school/academic/sections/SectionsTab";
import { TeachersTab } from "@/components/features/school/academic/teachers/TeachersTab";
import { ExamsTab } from "@/components/features/school/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/school/academic/tests/TestTab";
import { AcademicOverviewCards } from "@/components/features/school/academic/AcademicOverviewCards";
import { useAuthStore } from "@/store/authStore";
import { useGrades } from "@/lib/hooks/general/useGrades";
import GradesTab from "@/components/features/general/grades/GradesTab";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/lib/hooks/use-tab-navigation";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("classes");

  // ✅ OPTIMIZATION: Get enabled states for each tab - only fetch when tab is active
  const classesTabEnabled = useTabEnabled("classes", "classes");
  const subjectsTabEnabled = useTabEnabled("subjects", "classes");
  const examsTabEnabled = useTabEnabled("exams", "classes");
  const testsTabEnabled = useTabEnabled("tests", "classes");
  const sectionsTabEnabled = useTabEnabled("sections", "classes");
  const teachersTabEnabled = useTabEnabled("teachers", "classes");
  const academicYearsTabEnabled = useTabEnabled("academic-years", "classes");
  const gradesTabEnabled = useTabEnabled("grades", "classes");

  // ✅ OPTIMIZATION: Minimal data fetching for cards only (lightweight counts)
  // Cards need minimal data for stats, so we fetch lightweight counts
  // Full data will be fetched by individual tabs when they become active
  const {
    data: backendClasses = [],
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrObj,
  } = useSchoolClasses({
    enabled: true, // Always enabled for cards (minimal data)
  });

  // ✅ OPTIMIZATION: Only fetch full data when respective tabs are active
  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useSchoolSubjects({
    enabled: subjectsTabEnabled, // Only fetch when subjects tab is active
  });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useSchoolExams({
    enabled: examsTabEnabled, // Only fetch when exams tab is active
  });

  const {
    data: tests = [],
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
  } = useSchoolTests({
    enabled: testsTabEnabled, // Only fetch when tests tab is active
  });

  // Memoized effective classes
  const effectiveClasses = useMemo(() => backendClasses, [backendClasses]);

  // ✅ OPTIMIZATION: Removed sections queries - sections are fetched on-demand in SectionsTab when class is selected
  // User requirement: Sections API should NOT be called when Classes tab is active
  // Sections are only fetched when:
  // 1. Sections tab is active AND
  // 2. A specific class is selected in the dropdown
  // This is handled by SectionsTab component itself
  const totalSectionsCount = 0; // Cards will show 0 - sections count is not needed for cards

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

  // ✅ OPTIMIZATION: Loading states - only show loading for cards (classes) and active tab
  // Note: sectionsLoading is excluded from main loading state to avoid blocking UI
  // Sections count will update as data arrives (non-blocking)
  const loadingStates = useMemo(() => {
    // Cards always need classes data, so always show loading for classes
    // Other data only loads when their respective tabs are active
    const isLoading =
      classesLoading ||
      (subjectsTabEnabled && subjectsLoading) ||
      (examsTabEnabled && examsLoading) ||
      (testsTabEnabled && testsLoading);
    const hasError =
      classesError ||
      (subjectsTabEnabled && subjectsError) ||
      (examsTabEnabled && examsError) ||
      (testsTabEnabled && testsError);
    const errorMessage =
      (classesErrObj as any)?.message ||
      (subjectsTabEnabled && (subjectsErrObj as any)?.message) ||
      (examsTabEnabled && (examsErrObj as any)?.message) ||
      (testsTabEnabled && (testsErrObj as any)?.message) ||
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
    subjectsTabEnabled,
    examsTabEnabled,
    testsTabEnabled,
  ]);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [gradesSearchTerm, setGradesSearchTerm] = useState("");

  // ✅ OPTIMIZATION: Grades hooks - only fetch when Grades tab is active
  // User requirement: Grades API should NOT be called when Classes tab is active
  const {
    grades: gradesData = [],
    isLoadingGrades,
    createGrade: createGradeMutation,
    updateGrade: updateGradeMutation,
    deleteGrade: deleteGradeMutation,
  } = useGrades({ enabled: gradesTabEnabled }); // ✅ Only fetch when Grades tab is active

  const handleCreateGrade = (data: any) => {
    createGradeMutation.mutate(data);
  };

  const handleUpdateGrade = (data: { gradeCode: string; data: any }) => {
    updateGradeMutation.mutate(data);
  };

  const handleDeleteGrade = (gradeCode: string) => {
    deleteGradeMutation.mutate(gradeCode);
  };

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
      grades: {
        title: "Grades Management",
        description: "Define grade codes and their percentage ranges",
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
            classesLoading={classesTabEnabled ? classesLoading : false}
            hasError={classesTabEnabled ? classesError : false}
            errorMessage={
              classesTabEnabled ? (classesErrObj as any)?.message : undefined
            }
          />
        ),
      },
      {
        value: "subjects",
        label: "Subjects",
        icon: GraduationCap,
        content: (
          <SubjectsTab
            backendSubjects={subjectsTabEnabled ? backendSubjects : []}
            subjectsLoading={subjectsTabEnabled ? subjectsLoading : false}
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
            exams={examsTabEnabled ? exams : []}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={examsTabEnabled ? examsLoading : false}
            hasError={examsTabEnabled ? examsError : false}
            errorMessage={
              examsTabEnabled ? (examsErrObj as any)?.message : undefined
            }
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
            tests={testsTabEnabled ? tests : []}
            isLoading={testsTabEnabled ? testsLoading : false}
            hasError={testsTabEnabled ? testsError : false}
            errorMessage={
              testsTabEnabled ? (testsErrObj as any)?.message : undefined
            }
          />
        ),
      },
      {
        value: "grades",
        label: "Grades",
        icon: Award,
        content: (
          <GradesTab
            gradesData={gradesData}
            searchTerm={gradesSearchTerm}
            onSearchChange={setGradesSearchTerm}
            onCreateGrade={handleCreateGrade}
            onUpdateGrade={handleUpdateGrade}
            onDeleteGrade={handleDeleteGrade}
            createGradeMutation={createGradeMutation}
            updateGradeMutation={updateGradeMutation}
            deleteGradeMutation={deleteGradeMutation}
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
      gradesData,
      gradesSearchTerm,
      createGradeMutation,
      updateGradeMutation,
      deleteGradeMutation,
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
