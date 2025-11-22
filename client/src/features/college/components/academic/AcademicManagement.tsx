import { useState, useCallback } from "react";
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
import { useTabNavigation, useTabEnabled } from "@/common/hooks/use-tab-navigation";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("classes");

  // ✅ OPTIMIZATION: Get enabled states for each tab - only fetch when tab is active
  const classesTabEnabled = useTabEnabled("classes", "classes");
  const groupsTabEnabled = useTabEnabled("groups", "classes");
  const coursesTabEnabled = useTabEnabled("courses", "classes");
  const subjectsTabEnabled = useTabEnabled("subjects", "classes");
  const examsTabEnabled = useTabEnabled("exams", "classes");
  const testsTabEnabled = useTabEnabled("tests", "classes");
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
  } = useCollegeClasses({
    enabled: true, // Always enabled for cards (minimal data)
  });

  // ✅ OPTIMIZATION: Only fetch full data when respective tabs are active
  const {
    data: backendSubjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrObj,
  } = useCollegeSubjects({
    enabled: subjectsTabEnabled, // Only fetch when subjects tab is active
  });

  const {
    data: exams = [],
    isLoading: examsLoading,
    isError: examsError,
    error: examsErrObj,
  } = useCollegeExams({
    enabled: examsTabEnabled, // Only fetch when exams tab is active
  });

  // ✅ OPTIMIZATION: Only fetch when respective tabs are active
  const {
    data: testsData,
    isLoading: testsLoading,
    isError: testsError,
    error: testsErrObj,
  } = useCollegeTests({
    enabled: testsTabEnabled, // Only fetch when tests tab is active
  });
  const tests = (testsData ||
    []) as import("@/features/college/types").CollegeTestRead[];

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrObj,
  } = useCollegeGroups({
    enabled: groupsTabEnabled, // Only fetch when groups tab is active
  });
  const groups = (groupsData ||
    []) as import("@/features/college/types").CollegeGroupResponse[];

  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesErrObj,
  } = useCollegeCourses({
    enabled: coursesTabEnabled, // Only fetch when courses tab is active
  });
  const courses = (coursesData ||
    []) as import("@/features/college/types").CollegeCourseResponse[];

  // Calculate statistics
  const totalClasses = backendClasses.length;
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

  // ✅ OPTIMIZATION: Loading states - only show loading for cards (classes) and active tab
  const isLoading =
    classesLoading ||
    (subjectsTabEnabled && subjectsLoading) ||
    (examsTabEnabled && examsLoading) ||
    (testsTabEnabled && testsLoading) ||
    (groupsTabEnabled && groupsLoading) ||
    (coursesTabEnabled && coursesLoading);
  const hasError =
    classesError ||
    (subjectsTabEnabled && subjectsError) ||
    (examsTabEnabled && examsError) ||
    (testsTabEnabled && testsError) ||
    (groupsTabEnabled && groupsError) ||
    (coursesTabEnabled && coursesError);
  const errorMessage =
    (classesErrObj as any)?.message ||
    (subjectsTabEnabled && (subjectsErrObj as any)?.message) ||
    (examsTabEnabled && (examsErrObj as any)?.message) ||
    (testsTabEnabled && (testsErrObj as any)?.message) ||
    (groupsTabEnabled && (groupsErrObj as any)?.message) ||
    (coursesTabEnabled && (coursesErrObj as any)?.message) ||
    undefined;

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [gradesSearchTerm, setGradesSearchTerm] = useState("");

  // ✅ OPTIMIZATION: Grades hooks - only fetch when Grades tab is active
  // User requirement: Grades API should NOT be called when Classes tab is active
  const {
    grades: gradesData = [],
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
      case "grades":
        return {
          title: "Grades Management",
          description: "Define grade codes and their percentage ranges",
        };
      case "academic-years":
        return {
          title: "Academic Years Management",
          description: "Manage academic years, terms, and academic calendar",
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
                classesLoading={classesTabEnabled ? classesLoading : false}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                hasError={classesTabEnabled ? classesError : false}
                errorMessage={classesTabEnabled ? ((classesErrObj as any)?.message) : undefined}
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
                errorMessage={groupsTabEnabled ? ((groupsErrObj as any)?.message) : undefined}
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
                errorMessage={coursesTabEnabled ? ((coursesErrObj as any)?.message) : undefined}
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
                errorMessage={examsTabEnabled ? ((examsErrObj as any)?.message) : undefined}
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
                errorMessage={testsTabEnabled ? ((testsErrObj as any)?.message) : undefined}
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
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default AcademicManagement;
