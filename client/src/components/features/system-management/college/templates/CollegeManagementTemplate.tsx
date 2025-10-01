import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollegeManagement } from "@/lib/hooks/useCollegeManagement";
import { CollegeStatsCards } from "../components/CollegeStatsCards";
import { GroupsTable } from "../components/GroupsTable";
import { CoursesTable } from "../components/CoursesTable";
import { CombinationsTable } from "../components/CombinationsTable";
import { SectionsTable } from "../components/SectionsTable";

export const CollegeManagementTemplate = () => {
  const {
    // Data
    groups,
    courses,
    combinations,
    sections,
    
    // Computed values
    totalGroups,
    activeGroups,
    totalCourses,
    activeCourses,
    totalCombinations,
    activeCombinations,
    totalSections,
    activeSections,
    
    // UI State
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    
    // Form states
    showGroupForm,
    setShowGroupForm,
    showCourseForm,
    setShowCourseForm,
    showCombinationForm,
    setShowCombinationForm,
    showSectionForm,
    setShowSectionForm,
    
    // Business logic
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleCreateCombination,
    handleUpdateCombination,
    handleDeleteCombination,
    handleCreateSection,
    handleUpdateSection,
    handleDeleteSection,
    
    // Utilities
    formatCurrency,
    
    // User context
    user,
    currentBranch
  } = useCollegeManagement();

  const handleAddGroup = () => {
    console.log("Add group clicked");
    setShowGroupForm(true);
  };

  const handleEditGroup = (group: any) => {
    console.log("Edit group:", group);
    setShowGroupForm(true);
  };

  const handleDeleteGroupClick = (id: number) => {
    console.log("Delete group:", id);
    handleDeleteGroup(id);
  };

  const handleViewGroup = (group: any) => {
    console.log("View group:", group);
  };

  const handleAddCourse = () => {
    console.log("Add course clicked");
    setShowCourseForm(true);
  };

  const handleEditCourse = (course: any) => {
    console.log("Edit course:", course);
    setShowCourseForm(true);
  };

  const handleDeleteCourseClick = (id: number) => {
    console.log("Delete course:", id);
    handleDeleteCourse(id);
  };

  const handleViewCourse = (course: any) => {
    console.log("View course:", course);
  };

  const handleAddCombination = () => {
    console.log("Add combination clicked");
    setShowCombinationForm(true);
  };

  const handleEditCombination = (combination: any) => {
    console.log("Edit combination:", combination);
    setShowCombinationForm(true);
  };

  const handleDeleteCombinationClick = (id: number) => {
    console.log("Delete combination:", id);
    handleDeleteCombination(id);
  };

  const handleViewCombination = (combination: any) => {
    console.log("View combination:", combination);
  };

  const handleAddSection = () => {
    console.log("Add section clicked");
    setShowSectionForm(true);
  };

  const handleEditSection = (section: any) => {
    console.log("Edit section:", section);
    setShowSectionForm(true);
  };

  const handleDeleteSectionClick = (id: number) => {
    console.log("Delete section:", id);
    handleDeleteSection(id);
  };

  const handleViewSection = (section: any) => {
    console.log("View section:", section);
  };

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
            College Management
          </h1>
          <p className="text-muted-foreground">
            Manage groups, courses, combinations, and sections for intermediate education
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* College Overview Cards */}
      <CollegeStatsCards
        totalGroups={totalGroups}
        activeGroups={activeGroups}
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        totalCombinations={totalCombinations}
        activeCombinations={activeCombinations}
        totalSections={totalSections}
        activeSections={activeSections}
        currentBranch={currentBranch}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="combinations">Combinations</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Subject Groups</h2>
                <p className="text-muted-foreground">
                  Manage subject groups for intermediate education
                </p>
              </div>
            </div>
            
            <GroupsTable
              groups={groups}
              isLoading={false}
              onAddGroup={handleAddGroup}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroupClick}
              onViewGroup={handleViewGroup}
              formatCurrency={formatCurrency}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Courses</h2>
                <p className="text-muted-foreground">
                  Manage courses and entrance exam preparations
                </p>
              </div>
            </div>
            
            <CoursesTable
              courses={courses}
              isLoading={false}
              onAddCourse={handleAddCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourseClick}
              onViewCourse={handleViewCourse}
              formatCurrency={formatCurrency}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="combinations" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Group-Course Combinations</h2>
                <p className="text-muted-foreground">
                  Manage combinations of groups and courses
                </p>
              </div>
            </div>
            
            <CombinationsTable
              combinations={combinations}
              isLoading={false}
              onAddCombination={handleAddCombination}
              onEditCombination={handleEditCombination}
              onDeleteCombination={handleDeleteCombinationClick}
              onViewCombination={handleViewCombination}
              formatCurrency={formatCurrency}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Sections</h2>
                <p className="text-muted-foreground">
                  Manage sections for each combination
                </p>
              </div>
            </div>
            
            <SectionsTable
              sections={sections}
              isLoading={false}
              onAddSection={handleAddSection}
              onEditSection={handleEditSection}
              onDeleteSection={handleDeleteSectionClick}
              onViewSection={handleViewSection}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Form Dialogs */}
      {/* Group Form Dialog */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add/Edit Group</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Form dialog implementation coming soon...
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGroupForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowGroupForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Form Dialog */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add/Edit Course</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Form dialog implementation coming soon...
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCourseForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCourseForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Combination Form Dialog */}
      {showCombinationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add/Edit Combination</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Form dialog implementation coming soon...
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCombinationForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCombinationForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section Form Dialog */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add/Edit Section</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Form dialog implementation coming soon...
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSectionForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSectionForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
