import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  School,
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
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useCollegeClasses, useCollegeSubjects, useCollegeExams, useCollegeTests, useCollegeGroups, useCollegeCourses } from "@/lib/hooks/college";
import AcademicYearManagement from "@/components/features/college/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/college/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/college/academic/subjects/SubjectsTab";
import { ExamsTab } from "@/components/features/college/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/college/academic/tests/TestTab";
import { GroupsTab } from "@/components/features/college/academic/groups/GroupsTab";
import { CoursesTab } from "@/components/features/college/academic/courses/CoursesTab";
import { TeachersTab } from "@/components/features/college/academic/teachers/TeachersTab";
import { AcademicOverviewCards } from "@/components/features/college/academic/AcademicOverviewCards";
import { useGrades } from "@/lib/hooks/general/useGrades";
import GradesTab from "@/components/features/general/grades/GradesTab";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/lib/hooks/use-tab-navigation";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("classes");

  // ✅ LAZY LOADING: Get enabled states at the top level to avoid hook order issues
  const classesEnabled = useTabEnabled("classes", "classes");
  const subjectsEnabled = useTabEnabled("subjects", "classes");
  const examsEnabled = useTabEnabled("exams", "classes");
  const testsEnabled = useTabEnabled("tests", "classes");
  const groupsEnabled = useTabEnabled("groups", "classes");
  const coursesEnabled = useTabEnabled("courses", "classes");

  // ✅ Always fetch data for cards (not lazy loaded)
  // Cards need data immediately, so we fetch regardless of active tab
  const {
    data: backendClasses = [],
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrObj,
  } = useCollegeClasses({
    enabled: true, // Always enabled for cards
  });

  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useCollegeSubjects({
    enabled: true, // Always enabled for cards
  });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useCollegeExams({
    enabled: true, // Always enabled for cards
  });

  // Note: useCollegeTests, useCollegeGroups, useCollegeCourses from specific hooks (not dropdowns)
  // These are always enabled since they're used in cards
  const {
    data: testsData,
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
    refetch: refetchTests,
  } = useCollegeTests();
  const tests = (testsData || []) as import("@/lib/types/college").CollegeTestRead[];

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrObj,
  } = useCollegeGroups();
  const groups = (groupsData || []) as import("@/lib/types/college").CollegeGroupResponse[];

  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesErrObj,
  } = useCollegeCourses();
  const courses = (coursesData || []) as import("@/lib/types/college").CollegeCourseResponse[];

  // Get effective classes
  const effectiveClasses = backendClasses;

  // Calculate statistics
  const totalClasses = effectiveClasses.length;
  const totalSubjects = backendSubjects.length;
  const totalGroups = groups.length;
  const totalCourses = courses.length;
  const today = new Date();
  const toDate = (v: any) => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  const activeExams = exams.filter((exam: any) => {
    const d = toDate(exam.exam_date);
    return d ? d >= new Date(today.toDateString()) : false;
  }).length;
  const completedExams = exams.filter((exam: any) => {
    const d = toDate(exam.exam_date);
    return d ? d < new Date(today.toDateString()) : false;
  }).length;

  // Loading states
  const isLoading =
    classesLoading ||
    subjectsLoading ||
    examsLoading ||
    testsLoading ||
    groupsLoading ||
    coursesLoading;
  const hasError =
    classesError ||
    subjectsError ||
    examsError ||
    testsError ||
    groupsError ||
    coursesError;
  const errorMessage =
    (classesErrObj as any)?.message ||
    (subjectsErrObj as any)?.message ||
    (examsErrObj as any)?.message ||
    (testsErrObj as any)?.message ||
    (groupsErrObj as any)?.message ||
    (coursesErrObj as any)?.message ||
    undefined;

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [gradesSearchTerm, setGradesSearchTerm] = useState("");

  // Grades hooks (for both school and college)
  const {
    grades: gradesData = [],
    isLoadingGrades,
    createGrade: createGradeMutation,
    updateGrade: updateGradeMutation,
    deleteGrade: deleteGradeMutation,
  } = useGrades();

  const handleCreateGrade = (data: any) => {
    createGradeMutation.mutate(data);
  };

  const handleUpdateGrade = (data: { gradeCode: string; data: any }) => {
    updateGradeMutation.mutate(data);
  };

  const handleDeleteGrade = (gradeCode: string) => {
    deleteGradeMutation.mutate(gradeCode);
  };

  // Dynamic header content based on active tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case "classes":
        return {
          title: "Classes Management",
          description: "Manage academic classes and their subject assignments",
        };
      case "groups":
        return {
          title: "Groups Management",
          description: "Manage student groups and their academic structure",
        };
      case "courses":
        return {
          title: "Courses Management",
          description: "Manage academic courses and their curriculum",
        };
      case "teachers":
        return {
          title: "Teachers Management",
          description: "Manage teaching staff and their assignments",
        };
      case "subjects":
        return {
          title: "Subjects Management",
          description: "Manage academic subjects and their assignments",
        };
      case "exams":
        return {
          title: "Exams Management",
          description: "Manage academic examinations and schedules",
        };
      case "tests":
        return {
          title: "Tests Management",
          description: "Manage academic tests and assessments",
        };
      case "academic-years":
        return {
          title: "Academic Years Management",
          description: "Manage academic years, terms, and academic calendar",
        };
      case "grades":
        return {
          title: "Grades Management",
          description: "Define grade codes and their percentage ranges",
        };
      default:
        return {
          title: "Academic Management",
          description:
            "Comprehensive academic structure and performance management",
        };
    }
  };

  const headerContent = getHeaderContent();

  // ✅ URL-based tab management with persistence
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

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
        totalClasses={totalClasses}
        totalSubjects={totalSubjects}
        activeExams={activeExams}
        completedExams={completedExams}
        totalGroups={totalGroups}
        totalCourses={totalCourses}
      />

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          {
            value: "classes",
            label: "Classes",
            icon: Users,
            content: (
              <ClassesTab
                classesWithSubjects={backendClasses}
                classesLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                hasError={hasError}
                errorMessage={errorMessage}
              />
            ),
          },
          {
            value: "groups",
            label: "Groups",
            icon: Layers,
            content: (
              <GroupsTab
                groupsWithSubjects={groups}
                groupsLoading={groupsLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                hasError={groupsError}
                errorMessage={(groupsErrObj as any)?.message}
              />
            ),
          },
          {
            value: "courses",
            label: "Courses",
            icon: BookOpen,
            content: (
              <CoursesTab
                coursesWithSubjects={courses}
                coursesLoading={coursesLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                hasError={coursesError}
                errorMessage={(coursesErrObj as any)?.message}
              />
            ),
          },
          {
            value: "teachers",
            label: "Teachers",
            icon: UserCheck,
            content: <TeachersTab />,
          },
          {
            value: "subjects",
            label: "Subjects",
            icon: GraduationCap,
            content: (
              <SubjectsTab
                backendSubjects={backendSubjects}
                subjectsLoading={isLoading}
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
                exams={exams}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isLoading}
                hasError={hasError}
                errorMessage={errorMessage}
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
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default AcademicManagement;
