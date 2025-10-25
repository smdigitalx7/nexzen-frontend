import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { School, Building2, Users, GraduationCap, Layers, Calendar, FileText, Settings, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useSchoolClasses } from '@/lib/hooks/school/use-school-classes';
import { useSchoolSubjects } from '@/lib/hooks/school/use-school-subjects';
import { useSchoolExams, useSchoolTests } from '@/lib/hooks/school/use-school-exams-tests';
import { useSchoolSectionsByClass } from '@/lib/hooks/school/use-school-sections';
import { useQueries } from "@tanstack/react-query";
import AcademicYearManagement from "@/components/features/school/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/school/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/school/academic/subjects/SubjectsTab";
import { SectionsTab } from "@/components/features/school/academic/sections/SectionsTab";
import { TeachersTab } from "@/components/features/school/academic/teachers/TeachersTab";
import { ExamsTab } from "@/components/features/school/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/school/academic/tests/TestTab";
import { AcademicOverviewCards } from "@/components/features/school/academic/AcademicOverviewCards";
import { useAuthStore } from "@/store/authStore";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  
  // Data fetching hooks
  const { data: backendClasses = [], isLoading: classesLoading, isError: classesError, error: classesErrObj } = useSchoolClasses();
  const { data: backendSubjects = [], isLoading: subjectsLoading, isError: subjectsError, error: subjectsErrObj } = useSchoolSubjects();
  const { data: exams = [], isLoading: examsLoading, isError: examsError, error: examsErrObj } = useSchoolExams();
  const { data: tests = [], isLoading: testsLoading, isError: testsError, error: testsErrObj } = useSchoolTests();

  // Memoized effective classes
  const effectiveClasses = useMemo(() => backendClasses, [backendClasses]);

  // Optimized sections fetching with memoized queries
  const sectionsQueries = useQueries({
    queries: effectiveClasses.map((classItem: any) => ({
      queryKey: ['school', 'sections', 'by-class', classItem.class_id],
      queryFn: async () => {
        const { SchoolSectionsService } = await import('@/lib/services/school/sections.service');
        return SchoolSectionsService.listByClass(classItem.class_id);
      },
      enabled: !!classItem.class_id,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    })),
  });

  // Memoized calculations
  const academicStats = useMemo(() => {
    const totalSections = sectionsQueries.reduce((total: number, query) => {
      const sections = query.data || [];
      return total + sections.length;
    }, 0);

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
  }, [effectiveClasses, backendSubjects, exams, tests, sectionsQueries]);

  // Memoized loading and error states
  const loadingStates = useMemo(() => {
    const sectionsLoading = sectionsQueries.some((query) => query.isLoading);
    const isLoading = classesLoading || subjectsLoading || examsLoading || testsLoading || sectionsLoading;
    const hasError = classesError || subjectsError || examsError || testsError;
    const errorMessage = (
      (classesErrObj as any)?.message ||
      (subjectsErrObj as any)?.message ||
      (examsErrObj as any)?.message ||
      (testsErrObj as any)?.message ||
      undefined
    );

    return { isLoading, hasError, errorMessage };
  }, [classesLoading, subjectsLoading, examsLoading, testsLoading, sectionsQueries, classesError, subjectsError, examsError, testsError, classesErrObj, subjectsErrObj, examsErrObj, testsErrObj]);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("classes");

  // Memoized header content
  const headerContent = useMemo(() => {
    const contentMap = {
      'classes': {
        title: 'Classes Management',
        description: 'Manage academic classes and their subject assignments'
      },
      'sections': {
        title: 'Sections Management',
        description: 'Manage class sections and student groupings'
      },
      'teachers': {
        title: 'Teachers Management',
        description: 'Manage teaching staff and their assignments'
      },
      'subjects': {
        title: 'Subjects Management',
        description: 'Manage academic subjects and their assignments'
      },
      'exams': {
        title: 'Exams Management',
        description: 'Manage academic examinations and schedules'
      },
      'tests': {
        title: 'Tests Management',
        description: 'Manage academic tests and assessments'
      },
      'academic-years': {
        title: 'Academic Years Management',
        description: 'Manage academic years, terms, and academic calendar'
      },
    };

    return contentMap[activeTab as keyof typeof contentMap] || {
      title: 'Academic Management',
      description: 'Comprehensive academic structure and performance management'
    };
  }, [activeTab]);

  // Memoized tab configuration
  const tabsConfig = useMemo(() => [
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
  ], [backendClasses, backendSubjects, currentBranch, searchTerm, selectedBranchType, exams, tests, loadingStates, testsLoading, testsError, testsErrObj]);

  // Memoized callbacks
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

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
