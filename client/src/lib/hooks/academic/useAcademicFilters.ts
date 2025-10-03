import { useState } from 'react';

export const useAcademicFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Filter functions
  const filterClasses = (classes: any[]) => {
    return classes.filter((c) =>
      c.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterSubjects = (subjects: any[], currentBranch: any) => {
    return subjects.filter(
      (subject) =>
        subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedBranchType === "all" ||
          currentBranch?.branch_type?.toLowerCase() === selectedBranchType)
    );
  };

  const filterExams = (exams: any[], currentBranch: any) => {
    return exams.filter(
      (exam) =>
        exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedBranchType === "all" || currentBranch?.branch_type?.toLowerCase() === selectedBranchType)
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBranchType("all");
    setSelectedClass("all");
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedBranchType,
    setSelectedBranchType,
    selectedClass,
    setSelectedClass,
    
    // Filter functions
    filterClasses,
    filterSubjects,
    filterExams,
    resetFilters,
  };
};
