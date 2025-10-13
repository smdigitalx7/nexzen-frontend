import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { School, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            Academic Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive academic structure and performance management
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
      />

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <ClassesTab
              classesWithSubjects={backendClasses}
              classesLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              hasError={hasError}
              errorMessage={errorMessage}
            />
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <SubjectsTab
              backendSubjects={backendSubjects}
              subjectsLoading={isLoading}
              currentBranch={currentBranch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedBranchType={selectedBranchType}
              setSelectedBranchType={setSelectedBranchType}
            />
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <SectionsTab />
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <ExamsTab
              exams={exams}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              hasError={hasError}
              errorMessage={errorMessage}
            />
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <TestTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              tests={tests}
              isLoading={testsLoading}
              hasError={testsError}
              errorMessage={(testsErrObj as any)?.message}
            />
          </TabsContent>

          {/* Academic Years Tab */}
          <TabsContent value="academic-years" className="space-y-4">
            <AcademicYearManagement />
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
};

export default AcademicManagement;
