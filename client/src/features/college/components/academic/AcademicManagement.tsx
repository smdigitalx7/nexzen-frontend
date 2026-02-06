import { useState, useCallback, useMemo } from "react";
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
import { useGrades } from "@/features/general/hooks/useGrades";
import GradesTab from "@/features/general/components/grades/GradesTab";
import { useTabNavigation, useTabEnabled } from "@/common/hooks/use-tab-navigation";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";
import { Separator } from "@/common/components/ui/separator";
import { TrendingUp, CheckCircle2, Trophy, ArrowRight, Activity } from "lucide-react";

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
    []);

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
    []);

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

  // Memoized header content
  const headerContent = useMemo(() => {
    switch (activeTab) {
      case "classes":
        return {
          title: "Institutional Class Matrix",
          description: "Manage academic classes and subject-stream configurations",
          icon: Users,
          color: "blue"
        };
      case "groups":
        return {
          title: "Academic Group Hierarchy",
          description: "Stucture student groups and specialized academic batches",
          icon: Layers,
          color: "indigo"
        };
      case "courses":
        return {
          title: "Curriculum Repository",
          description: "Manage standard courses and educational framework",
          icon: BookOpen,
          color: "violet"
        };
      case "teachers":
        return {
          title: "Faculty Assignments",
          description: "Coordinate teaching staff and academic responsibilities",
          icon: UserCheck,
          color: "rose"
        };
      case "subjects":
        return {
          title: "Knowledge Base Registry",
          description: "Manage curriculum subjects and disciplinary domains",
          icon: GraduationCap,
          color: "emerald"
        };
      case "exams":
        return {
          title: "Examination Orchestrator",
          description: "Oversee summative assessments and scheduling",
          icon: Calendar,
          color: "amber"
        };
      case "tests":
        return {
          title: "Diagnostic Test Deck",
          description: "Monitor formative assessments and periodic evaluations",
          icon: FileText,
          color: "orange"
        };
      case "grades":
        return {
          title: "Academic Standards Framework",
          description: "Define performance benchmarks and grading rubrics",
          icon: Award,
          color: "cyan"
        };
      case "academic-years":
        return {
          title: "Institutional Calendar",
          description: "Configure academic cycles and session timelines",
          icon: Settings,
          color: "slate"
        };
      default:
        return {
          title: "Academic Intelligence Hub",
          description: "Comprehensive administration of institutional academic structure",
          icon: BookOpen,
          color: "blue"
        };
    }
  }, [activeTab]);

  // Memoized statistics cards
  const statisticsCards = useMemo(() => [
    {
      title: "Total Classes",
      value: totalClasses,
      icon: Users,
      color: "blue" as const,
      description: "Active academic blocks"
    },
    {
      title: "Current Subjects",
      value: totalSubjects,
      icon: GraduationCap,
      color: "emerald" as const,
      description: "Managed curriculum items"
    },
    {
      title: "Academic Groups",
      value: totalGroups,
      icon: Layers,
      color: "indigo" as const,
      description: "Defined functional batches"
    },
    {
      title: "Available Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "violet" as const,
      description: "Primary educational paths"
    },
    {
      title: "Active Evaluations",
      value: activeExams,
      icon: Activity,
      color: "amber" as const,
      description: "Ongoing/Upcoming assessments"
    }
  ], [totalClasses, totalSubjects, totalGroups, totalCourses, activeExams]);

  // ✅ URL-based tab management with persistence
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-5">
          <div className={`h-16 w-16 rounded-2xl bg-${headerContent.color}-50 flex items-center justify-center border border-${headerContent.color}-100 shadow-sm animate-in zoom-in duration-500`}>
            {headerContent.icon && <headerContent.icon className={`h-8 w-8 text-${headerContent.color}-600`} />}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {headerContent.title}
              </h1>
              <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded-lg px-2 py-0.5">
                Module Active
              </Badge>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              {headerContent.description} — <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">{currentBranch?.branch_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
             <Badge variant="outline" className="h-10 rounded-xl px-4 flex items-center gap-2 bg-slate-50 border-slate-200">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-700">{currentBranch?.branch_name}</span>
             </Badge>
        </div>
      </div>

      <Separator className="bg-slate-100/50" />

      {/* Overview Statistics Grid */}
      <DashboardGrid>
        {statisticsCards.map((card: any) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </DashboardGrid>

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
