import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { 
  GroupRead, 
  GroupCreate, 
  GroupUpdate,
  CourseRead,
  CourseCreate,
  CourseUpdate,
  CombinationRead,
  CombinationCreate,
  CombinationUpdate,
  SectionRead,
  SectionCreate,
  SectionUpdate
} from '@/lib/types/college';

// Mock data for development
const mockGroups: GroupRead[] = [
  {
    id: 1,
    group_name: "MPC",
    group_code: "MPC01",
    description: "Mathematics, Physics, Chemistry",
    group_fee: 5000,
    active: true,
    students_count: 45,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    group_name: "BiPC",
    group_code: "BiPC01",
    description: "Biology, Physics, Chemistry",
    group_fee: 5500,
    active: true,
    students_count: 38,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    group_name: "CEC",
    group_code: "CEC01",
    description: "Commerce, Economics, Civics",
    group_fee: 4000,
    active: true,
    students_count: 52,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

const mockCourses: CourseRead[] = [
  {
    id: 1,
    course_name: "EAMCET",
    course_code: "EAMCET01",
    description: "Engineering, Agriculture and Medical Common Entrance Test",
    course_fee: 3000,
    active: true,
    students_count: 120,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    course_name: "NEET",
    course_code: "NEET01",
    description: "National Eligibility cum Entrance Test",
    course_fee: 3500,
    active: true,
    students_count: 85,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

const mockCombinations: CombinationRead[] = [
  {
    id: 1,
    group_id: 1,
    course_id: 1,
    combination_fee: 8000,
    active: true,
    students_count: 45,
    group_name: "MPC",
    course_name: "EAMCET",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    group_id: 2,
    course_id: 2,
    combination_fee: 9000,
    active: true,
    students_count: 38,
    group_name: "BiPC",
    course_name: "NEET",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

const mockSections: SectionRead[] = [
  {
    id: 1,
    section_name: "A",
    group_course_combination_id: 1,
    max_capacity: 50,
    academic_year: "2024-26",
    active: true,
    current_strength: 45,
    group_name: "MPC",
    course_name: "EAMCET",
    combination_name: "MPC-EAMCET",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    section_name: "B",
    group_course_combination_id: 2,
    max_capacity: 40,
    academic_year: "2024-26",
    active: true,
    current_strength: 38,
    group_name: "BiPC",
    course_name: "NEET",
    combination_name: "BiPC-NEET",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

export const useCollegeManagement = () => {
  const { user, currentBranch } = useAuthStore();
  
  // State management
  const [groups, setGroups] = useState<GroupRead[]>(mockGroups);
  const [courses, setCourses] = useState<CourseRead[]>(mockCourses);
  const [combinations, setCombinations] = useState<CombinationRead[]>(mockCombinations);
  const [sections, setSections] = useState<SectionRead[]>(mockSections);
  
  // UI State
  const [activeTab, setActiveTab] = useState("groups");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showCombinationForm, setShowCombinationForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingCombination, setIsEditingCombination] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  
  const [selectedGroup, setSelectedGroup] = useState<GroupRead | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseRead | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<CombinationRead | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionRead | null>(null);
  
  // Form data
  const [groupFormData, setGroupFormData] = useState<GroupCreate>({
    group_name: "",
    group_code: "",
    description: "",
    group_fee: 0
  });
  
  const [courseFormData, setCourseFormData] = useState<CourseCreate>({
    course_name: "",
    course_code: "",
    description: "",
    course_fee: 0
  });
  
  const [combinationFormData, setCombinationFormData] = useState<CombinationCreate>({
    group_id: 0,
    course_id: 0,
    combination_fee: 0
  });
  
  const [sectionFormData, setSectionFormData] = useState<SectionCreate>({
    section_name: "",
    group_course_combination_id: 0,
    max_capacity: 0,
    academic_year: "2024-26"
  });
  
  // Computed values
  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.active).length;
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.active).length;
  const totalCombinations = combinations.length;
  const activeCombinations = combinations.filter(c => c.active).length;
  const totalSections = sections.length;
  const activeSections = sections.filter(s => s.active).length;
  
  // Filtered data
  const filteredGroups = useMemo(() => {
    return groups.filter(group => 
      group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.group_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);
  
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);
  
  const filteredCombinations = useMemo(() => {
    return combinations.filter(combination => 
      combination.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combination.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinations, searchTerm]);
  
  const filteredSections = useMemo(() => {
    return sections.filter(section => 
      section.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sections, searchTerm]);
  
  // Business logic functions
  const handleCreateGroup = async (data: GroupCreate) => {
    const newId = Math.max(...groups.map(g => g.id)) + 1;
    const newGroup: GroupRead = {
      id: newId,
      ...data,
      active: true,
      students_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setGroups([...groups, newGroup]);
    setShowGroupForm(false);
    setGroupFormData({ group_name: "", group_code: "", description: "", group_fee: 0 });
  };
  
  const handleUpdateGroup = async (id: number, data: GroupUpdate) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, ...data, updated_at: new Date().toISOString() } : group
    ));
    setShowGroupForm(false);
    setIsEditingGroup(false);
    setSelectedGroup(null);
  };
  
  const handleDeleteGroup = async (id: number) => {
    setGroups(groups.filter(group => group.id !== id));
  };
  
  const handleCreateCourse = async (data: CourseCreate) => {
    const newId = Math.max(...courses.map(c => c.id)) + 1;
    const newCourse: CourseRead = {
      id: newId,
      ...data,
      active: true,
      students_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCourses([...courses, newCourse]);
    setShowCourseForm(false);
    setCourseFormData({ course_name: "", course_code: "", description: "", course_fee: 0 });
  };
  
  const handleUpdateCourse = async (id: number, data: CourseUpdate) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, ...data, updated_at: new Date().toISOString() } : course
    ));
    setShowCourseForm(false);
    setIsEditingCourse(false);
    setSelectedCourse(null);
  };
  
  const handleDeleteCourse = async (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
  };
  
  const handleCreateCombination = async (data: CombinationCreate) => {
    const newId = Math.max(...combinations.map(c => c.id)) + 1;
    const group = groups.find(g => g.id === data.group_id);
    const course = courses.find(c => c.id === data.course_id);
    const newCombination: CombinationRead = {
      id: newId,
      ...data,
      active: true,
      students_count: 0,
      group_name: group?.group_name,
      course_name: course?.course_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCombinations([...combinations, newCombination]);
    setShowCombinationForm(false);
    setCombinationFormData({ group_id: 0, course_id: 0, combination_fee: 0 });
  };
  
  const handleUpdateCombination = async (id: number, data: CombinationUpdate) => {
    setCombinations(combinations.map(combination => 
      combination.id === id ? { ...combination, ...data, updated_at: new Date().toISOString() } : combination
    ));
    setShowCombinationForm(false);
    setIsEditingCombination(false);
    setSelectedCombination(null);
  };
  
  const handleDeleteCombination = async (id: number) => {
    setCombinations(combinations.filter(combination => combination.id !== id));
  };
  
  const handleCreateSection = async (data: SectionCreate) => {
    const newId = Math.max(...sections.map(s => s.id)) + 1;
    const combination = combinations.find(c => c.id === data.group_course_combination_id);
    const newSection: SectionRead = {
      id: newId,
      ...data,
      active: true,
      current_strength: 0,
      group_name: combination?.group_name,
      course_name: combination?.course_name,
      combination_name: `${combination?.group_name}-${combination?.course_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSections([...sections, newSection]);
    setShowSectionForm(false);
    setSectionFormData({ section_name: "", group_course_combination_id: 0, max_capacity: 0, academic_year: "2024-26" });
  };
  
  const handleUpdateSection = async (id: number, data: SectionUpdate) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...data, updated_at: new Date().toISOString() } : section
    ));
    setShowSectionForm(false);
    setIsEditingSection(false);
    setSelectedSection(null);
  };
  
  const handleDeleteSection = async (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };
  
  return {
    // Data
    groups: filteredGroups,
    courses: filteredCourses,
    combinations: filteredCombinations,
    sections: filteredSections,
    
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
    
    isEditingGroup,
    setIsEditingGroup,
    isEditingCourse,
    setIsEditingCourse,
    isEditingCombination,
    setIsEditingCombination,
    isEditingSection,
    setIsEditingSection,
    
    selectedGroup,
    setSelectedGroup,
    selectedCourse,
    setSelectedCourse,
    selectedCombination,
    setSelectedCombination,
    selectedSection,
    setSelectedSection,
    
    // Form data
    groupFormData,
    setGroupFormData,
    courseFormData,
    setCourseFormData,
    combinationFormData,
    setCombinationFormData,
    sectionFormData,
    setSectionFormData,
    
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
  };
};
