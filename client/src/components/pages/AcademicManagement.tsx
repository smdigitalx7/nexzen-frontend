import { useState } from "react";
import { motion } from "framer-motion";
import { School, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useAcademicData, useAcademicFilters } from '@/hooks/academic';
import {
  AcademicOverviewCards,
  ClassesTab,
  SubjectsTab,
  ExamsTab,
  SectionMappingTab,
  TestTab,
} from '../features/academic-management';

const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  
  // Custom hooks for data and filters
  const {
    backendClasses,
    classesWithSubjects,
    backendSubjects,
    allSectionsData,
    exams,
    setExams,
    tests,
    setTests,
    totalClasses,
    totalSubjects,
    activeExams,
    completedExams,
    isLoading,
    hasError,
    errorMessage,
  } = useAcademicData();


  const {
    searchTerm,
    setSearchTerm,
    selectedBranchType,
    setSelectedBranchType,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
  } = useAcademicFilters();

  // Local state
  const [activeTab, setActiveTab] = useState("classes");

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="sections">Section Mapping</TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <ClassesTab
              classesWithSubjects={classesWithSubjects}
              allSectionsData={allSectionsData}
              classesLoading={isLoading}
              classesWithSubjectsLoading={isLoading}
              sectionsLoading={isLoading}
              currentBranch={currentBranch}
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

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <ExamsTab
              exams={exams}
              setExams={setExams}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedBranchType={selectedBranchType}
              setSelectedBranchType={setSelectedBranchType}
              currentBranch={currentBranch}
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
              selectedBranchType={selectedBranchType}
              setSelectedBranchType={setSelectedBranchType}
              currentBranch={currentBranch}
              tests={tests}
              setTests={setTests}
              isLoading={isLoading}
              hasError={hasError}
              errorMessage={errorMessage}
            />
          </TabsContent>

          {/* Section Mapping Tab */}
          <TabsContent value="sections" className="space-y-4">
            <SectionMappingTab
              backendClasses={backendClasses}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AcademicManagement;
