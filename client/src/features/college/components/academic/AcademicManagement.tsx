import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  Settings,
  UserCheck,
  Award,
} from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { TabSwitcher } from "@/common/components/shared";
import { useAuthStore } from "@/core/auth/authStore";
import {
  useCollegeClasses,
  useCollegeSubjects,
  useCollegeExams,
  useCollegeTests,
  useCollegeGroups,
  useCollegeCourses,
  useCollegeEnrollmentsAcademicTotal,
} from "@/features/college/hooks";
import AcademicYearManagement from "@/features/college/components/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/features/college/components/academic/classes/ClassesTab";
import { SubjectsTab } from "@/features/college/components/academic/subjects/SubjectsTab";
import { ExamsTab } from "@/features/college/components/academic/exams/ExamsTab";
import { TestTab } from "@/features/college/components/academic/tests/TestTab";
import { GroupsTab } from "@/features/college/components/academic/groups/GroupsTab";
import { CoursesTab } from "@/features/college/components/academic/courses/CoursesTab";
import { TeachersTab } from "@/features/college/components/academic/teachers/TeachersTab";
import { AcademicOverviewCards } from "@/features/college/components/academic/AcademicOverviewCards";
import { useGrades } from "@/features/general/hooks/useGrades";
import GradesTab from "@/features/general/components/grades/GradesTab";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/common/hooks/use-tab-navigation";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("classes");

  const classesTabEnabled = useTabEnabled("classes", "classes");
  const groupsTabEnabled = useTabEnabled("groups", "classes");
  const coursesTabEnabled = useTabEnabled("courses", "classes");
  const subjectsTabEnabled = useTabEnabled("subjects", "classes");
  const examsTabEnabled = useTabEnabled("exams", "classes");
  const testsTabEnabled = useTabEnabled("tests", "classes");
  const gradesTabEnabled = useTabEnabled("grades", "classes");

  // Stats cards: single API GET /college/student-enrollments/dashboard/academic-total (refreshes on any Academic CRUD)
  const {
    data: academicTotal,
    isLoading: academicTotalLoading,
    isError: academicTotalError,
    error: academicTotalErrObj,
  } = useCollegeEnrollmentsAcademicTotal({ enabled: true });

  const {
    data: backendClasses = [],
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrObj,
  } = useCollegeClasses({ enabled: true });

  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useCollegeSubjects({ enabled: subjectsTabEnabled });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useCollegeExams({ enabled: examsTabEnabled });

  const {
    data: testsData,
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
  } = useCollegeTests({ enabled: testsTabEnabled });
  const tests = testsData ?? [];

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrObj,
  } = useCollegeGroups({ enabled: groupsTabEnabled });
  const groups = (groupsData ?? []) as import("@/features/college/types").CollegeGroupResponse[];

  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesErrObj,
  } = useCollegeCourses({ enabled: coursesTabEnabled });
  const courses = coursesData ?? [];

  // Stats for cards: from academic-total API for classes, subjects, exams, tests; groups/courses from list hooks
  const academicStats = useMemo(() => {
    const fromApi = academicTotal
      ? {
          totalClasses: academicTotal.classes_count ?? 0,
          totalSubjects: academicTotal.subjects_count ?? 0,
          activeExams: academicTotal.exams_count ?? 0,
          totalTests: academicTotal.tests_count ?? 0,
        }
      : { totalClasses: 0, totalSubjects: 0, activeExams: 0, totalTests: 0 };
    return {
      ...fromApi,
      totalGroups: groups.length,
      totalCourses: Array.isArray(courses) ? courses.length : 0,
    };
  }, [academicTotal, groups, courses]);

  const loadingStates = useMemo(() => {
    const isLoading =
      academicTotalLoading ||
      classesLoading ||
      (subjectsTabEnabled && subjectsLoading) ||
      (examsTabEnabled && examsLoading) ||
      (testsTabEnabled && testsLoading) ||
      (groupsTabEnabled && groupsLoading) ||
      (coursesTabEnabled && coursesLoading);
    const hasError =
      academicTotalError ||
      classesError ||
      (subjectsTabEnabled && subjectsError) ||
      (examsTabEnabled && examsError) ||
      (testsTabEnabled && testsError) ||
      (groupsTabEnabled && groupsError) ||
      (coursesTabEnabled && coursesError);
    const errorMessage =
      (academicTotalErrObj as Error | undefined)?.message ||
      (classesErrObj as Error | undefined)?.message ||
      (subjectsTabEnabled && (subjectsErrObj as Error | undefined)?.message) ||
      (examsTabEnabled && (examsErrObj as Error | undefined)?.message) ||
      (testsTabEnabled && (testsErrObj as Error | undefined)?.message) ||
      (groupsTabEnabled && (groupsErrObj as Error | undefined)?.message) ||
      (coursesTabEnabled && (coursesErrObj as Error | undefined)?.message) ||
      undefined;
    return { isLoading, hasError, errorMessage };
  }, [
    academicTotalLoading,
    academicTotalError,
    academicTotalErrObj,
    classesLoading,
    subjectsLoading,
    examsLoading,
    testsLoading,
    groupsLoading,
    coursesLoading,
    classesError,
    subjectsError,
    examsError,
    testsError,
    groupsError,
    coursesError,
    classesErrObj,
    subjectsErrObj,
    examsErrObj,
    testsErrObj,
    groupsErrObj,
    coursesErrObj,
    subjectsTabEnabled,
    examsTabEnabled,
    testsTabEnabled,
    groupsTabEnabled,
    coursesTabEnabled,
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [gradesSearchTerm, setGradesSearchTerm] = useState("");

  const {
    grades: gradesData = [],
    createGrade: createGradeMutation,
    updateGrade: updateGradeMutation,
    deleteGrade: deleteGradeMutation,
  } = useGrades({ enabled: gradesTabEnabled });

  const handleCreateGrade = useCallback(
    (data: import("@/features/general/types/grades").GradeCreate) => {
      createGradeMutation.mutate(data);
    },
    [createGradeMutation]
  );

  const handleUpdateGrade = useCallback(
    (data: { gradeCode: string; data: unknown }) => {
      updateGradeMutation.mutate(data);
    },
    [updateGradeMutation]
  );

  const handleDeleteGrade = useCallback(
    (gradeCode: string) => {
      deleteGradeMutation.mutate(gradeCode);
    },
    [deleteGradeMutation]
  );

  const headerContent = useMemo(() => {
    const contentMap: Record<
      string,
      { title: string; description: string }
    > = {
      classes: {
        title: "Classes Management",
        description: "Manage academic classes and subject-stream configurations",
      },
      groups: {
        title: "Groups Management",
        description: "Structure student groups and specialized academic batches",
      },
      courses: {
        title: "Courses Management",
        description: "Manage standard courses and educational framework",
      },
      lecturers: {
        title: "Lecturers Management",
        description: "Manage lecturers and their assignments",
      },
      subjects: {
        title: "Subjects Management",
        description: "Manage curriculum subjects and disciplinary domains",
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
      contentMap[activeTab] ?? {
        title: "Academic Management",
        description: "Comprehensive academic structure and performance management",
      }
    );
  }, [activeTab]);

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
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            hasError={classesTabEnabled ? classesError : false}
            errorMessage={
              classesTabEnabled ? (classesErrObj as Error)?.message : undefined
            }
          />
        ),
      },
      {
        value: "groups",
        label: "Groups",
        icon: Layers,
        content: (
          <GroupsTab
            groupsWithSubjects={groupsTabEnabled ? groups : []}
            groupsLoading={groupsTabEnabled ? groupsLoading : false}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            hasError={groupsTabEnabled ? groupsError : false}
            errorMessage={
              groupsTabEnabled ? (groupsErrObj as Error)?.message : undefined
            }
          />
        ),
      },
      {
        value: "courses",
        label: "Courses",
        icon: BookOpen,
        content: (
          <CoursesTab
            coursesWithSubjects={coursesTabEnabled ? courses : []}
            coursesLoading={coursesTabEnabled ? coursesLoading : false}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            hasError={coursesTabEnabled ? coursesError : false}
            errorMessage={
              coursesTabEnabled ? (coursesErrObj as Error)?.message : undefined
            }
          />
        ),
      },
      {
        value: "lecturers",
        label: "Lecturers",
        icon: UserCheck,
        content: <TeachersTab />,
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
              examsTabEnabled ? (examsErrObj as Error)?.message : undefined
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
              testsTabEnabled ? (testsErrObj as Error)?.message : undefined
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
      groups,
      courses,
      exams,
      tests,
      currentBranch,
      searchTerm,
      selectedBranchType,
      gradesData,
      gradesSearchTerm,
      classesTabEnabled,
      groupsTabEnabled,
      coursesTabEnabled,
      subjectsTabEnabled,
      examsTabEnabled,
      testsTabEnabled,
      classesLoading,
      groupsLoading,
      coursesLoading,
      subjectsLoading,
      examsLoading,
      testsLoading,
      classesError,
      groupsError,
      coursesError,
      subjectsError,
      examsError,
      testsError,
      classesErrObj,
      groupsErrObj,
      coursesErrObj,
      subjectsErrObj,
      examsErrObj,
      testsErrObj,
      handleCreateGrade,
      handleUpdateGrade,
      handleDeleteGrade,
      createGradeMutation,
      updateGradeMutation,
      deleteGradeMutation,
    ]
  );

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header – same layout as School */}
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
            <Building2 className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Academic Overview Cards – same pattern as School */}
      <AcademicOverviewCards
        totalClasses={academicStats.totalClasses}
        totalSubjects={academicStats.totalSubjects}
        totalGroups={academicStats.totalGroups}
        totalCourses={academicStats.totalCourses}
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
