import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { School, Building2, Users, GraduationCap, Layers, Calendar, FileText, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useAuthStore } from "@/store/authStore";
import { useSchoolClasses } from '@/lib/hooks/school/use-school-classes';
import { useSchoolSubjects } from '@/lib/hooks/school/use-school-subjects';
import { useSchoolExams, useSchoolTests } from '@/lib/hooks/school/use-school-exams-tests';
import AcademicYearManagement from "@/components/features/school/academic/academic-years/AcademicYearManagement";
import { ClassesTab } from "@/components/features/school/academic/classes/ClassesTab";
import { SubjectsTab } from "@/components/features/school/academic/subjects/SubjectsTab";
import { SectionsTab } from "@/components/features/school/academic/sections/SectionsTab";
import { ExamsTab } from "@/components/features/school/academic/exams/ExamsTab";
import { TestTab } from "@/components/features/school/academic/tests/TestTab";
import { AcademicOverviewCards } from "@/components/features/school/academic/AcademicOverviewCards";

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  
  // New modular school hooks
  const { data: backendClasses = [], isLoading: classesLoading, isError: classesError, error: classesErrObj } = useSchoolClasses();
  const { data: backendSubjects = [], isLoading: subjectsLoading, isError: subjectsError, error: subjectsErrObj } = useSchoolSubjects();
  const { data: exams = [], isLoading: examsLoading, isError: examsError, error: examsErrObj } = useSchoolExams();
  const { data: tests = [], isLoading: testsLoading, isError: testsError, error: testsErrObj, refetch: refetchTests } = useSchoolTests();

  // Get effective classes
  const effectiveClasses = backendClasses;

  // Calculate statistics
  const totalClasses = effectiveClasses.length;
  const totalSubjects = backendSubjects.length;
  const totalTests = tests.length;
  
  // Calculate total sections from classes (assuming each class has sections)
  const totalSections = effectiveClasses.reduce((total: number, classItem: any) => {
    return total + (classItem.sections?.length || 0);
  }, 0);
  
  const today = new Date();
  const toDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };
  const activeExams = exams.filter((exam: any) => {
    const d = toDate(exam.exam_date);
    return d ? d >= new Date(today.toDateString()) : false;
  }).length;

  // Loading states
  const isLoading = classesLoading || subjectsLoading || examsLoading || testsLoading;
  const hasError = classesError || subjectsError || examsError || testsError;
  const errorMessage = (
    (classesErrObj as any)?.message ||
    (subjectsErrObj as any)?.message ||
    (examsErrObj as any)?.message ||
    (testsErrObj as any)?.message ||
    undefined
  );

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("classes");

  // Dynamic header content based on active tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'classes':
        return {
          title: 'Classes Management',
          description: 'Manage academic classes and their subject assignments'
        };
      case 'sections':
        return {
          title: 'Sections Management',
          description: 'Manage class sections and student groupings'
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
        totalSections={totalSections}
        activeExams={activeExams}
        totalTests={totalTests}
        loading={isLoading}
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
                hasError={hasError}
                errorMessage={errorMessage}
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
            value: "sections",
            label: "Sections",
            icon: Layers,
            content: <SectionsTab />,
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
