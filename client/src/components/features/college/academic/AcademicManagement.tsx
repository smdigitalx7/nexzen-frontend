import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { School, Building2, Users, Layers, BookOpen, GraduationCap, FileText, Calendar, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useCollegeClasses } from '@/lib/hooks/college/use-college-classes';
import { useCollegeSubjects } from '@/lib/hooks/college/use-college-subjects';
import { useCollegeExams } from '@/lib/hooks/college/use-college-exams';
import { useCollegeTests } from '@/lib/hooks/college/use-college-tests';
import { useCollegeGroups } from '@/lib/hooks/college/use-college-groups';
import { useCollegeCourses } from '@/lib/hooks/college/use-college-courses';
import AcademicYearManagement from "@/components/features/college/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/college/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/college/academic/subjects/SubjectsTab";
import { ExamsTab } from "@/components/features/college/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/college/academic/tests/TestTab";
import { GroupsTab } from "@/components/features/college/academic/groups/GroupsTab";
import { CoursesTab } from "@/components/features/college/academic/courses/CoursesTab";
import { AcademicOverviewCards } from "@/components/features/college/academic/AcademicOverviewCards";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  
  // New modular college hooks
  const { data: backendClasses = [], isLoading: classesLoading, isError: classesError, error: classesErrObj } = useCollegeClasses();
  const { data: backendSubjects = [], isLoading: subjectsLoading, isError: subjectsError, error: subjectsErrObj } = useCollegeSubjects();
  const { data: exams = [], isLoading: examsLoading, isError: examsError, error: examsErrObj } = useCollegeExams();
  const { data: tests = [], isLoading: testsLoading, isError: testsError, error: testsErrObj, refetch: refetchTests } = useCollegeTests();
  const { data: groups = [], isLoading: groupsLoading, isError: groupsError, error: groupsErrObj } = useCollegeGroups();
  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, error: coursesErrObj } = useCollegeCourses();

  // Get effective classes
  const effectiveClasses = backendClasses;

  // Calculate statistics
  const totalClasses = effectiveClasses.length;
  const totalSubjects = backendSubjects.length;
  const totalGroups = groups.length;
  const totalCourses = courses.length;
  const today = new Date();
  const toDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };
  const activeExams = exams.filter((exam: any) => {
    const d = toDate(exam.exam_date);
    return d ? d >= new Date(today.toDateString()) : false;
  }).length;
  const completedExams = exams.filter((exam: any) => {
    const d = toDate(exam.exam_date);
    return d ? d < new Date(today.toDateString()) : false;
  }).length;

  // Loading states
  const isLoading = classesLoading || subjectsLoading || examsLoading || testsLoading || groupsLoading || coursesLoading;
  const hasError = classesError || subjectsError || examsError || testsError || groupsError || coursesError;
  const errorMessage = (
    (classesErrObj as any)?.message ||
    (subjectsErrObj as any)?.message ||
    (examsErrObj as any)?.message ||
    (testsErrObj as any)?.message ||
    (groupsErrObj as any)?.message ||
    (coursesErrObj as any)?.message ||
    undefined
  );

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [activeTab, setActiveTab] = useState("classes");

  // Dynamic header content based on active tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'classes':
        return {
          title: 'Classes Management',
          description: 'Manage academic classes and their subject assignments'
        };
      case 'groups':
        return {
          title: 'Groups Management',
          description: 'Manage student groups and their academic structure'
        };
      case 'courses':
        return {
          title: 'Courses Management',
          description: 'Manage academic courses and their curriculum'
        };
      case 'subjects':
        return {
          title: 'Subjects Management',
          description: 'Manage academic subjects and their assignments'
        };
      case 'exams':
        return {
          title: 'Exams Management',
          description: 'Manage academic examinations and schedules'
        };
      case 'tests':
        return {
          title: 'Tests Management',
          description: 'Manage academic tests and assessments'
        };
      case 'academic-years':
        return {
          title: 'Academic Years Management',
          description: 'Manage academic years, terms, and academic calendar'
        };
      default:
        return {
          title: 'Academic Management',
          description: 'Comprehensive academic structure and performance management'
        };
    }
  };

  const headerContent = getHeaderContent();

  // Ensure tests are fetched when Tests tab becomes active
  useEffect(() => {
    if (activeTab === "tests") {
      refetchTests();
    }
  }, [activeTab, refetchTests]);

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
          <p className="text-muted-foreground">
            {headerContent.description}
          </p>
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
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default AcademicManagement;
