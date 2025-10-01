import { useState } from 'react';
import { useCreateClass, useCreateSubject } from '@/lib/hooks/useSchool';

export const useAcademicForms = () => {
  // Form states
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // Form data
  const [newClass, setNewClass] = useState({ class_name: "" });
  const [newSubject, setNewSubject] = useState({
    subject_name: "",
    subject_code: "",
    class_range: "",
    teacher_id: "",
    max_marks: "",
    pass_marks: "",
  });
  const [newExam, setNewExam] = useState({
    exam_name: "",
    exam_type: "",
    class_range: "",
    start_date: "",
    end_date: "",
    pass_marks: "",
    max_marks: "",
  });

  // Mutations
  const createClassMutation = useCreateClass();
  const createSubjectMutation = useCreateSubject();

  // Form handlers
  const handleAddClass = () => {
    if (!newClass.class_name.trim()) {
      console.error("Class name is required");
      return;
    }

    createClassMutation.mutate({
      class_name: newClass.class_name.trim(),
    });

    setNewClass({ class_name: "" });
    setIsAddClassOpen(false);
  };

  const handleAddSubject = () => {
    if (newSubject.subject_name?.trim()) {
      createSubjectMutation.mutate({ subject_name: newSubject.subject_name.trim() });
    }
    setNewSubject({
      subject_name: "",
      subject_code: "",
      class_range: "",
      teacher_id: "",
      max_marks: "",
      pass_marks: "",
    });
    setIsAddSubjectOpen(false);
  };

  const handleAddExam = (setExams: (exams: any[]) => void, exams: any[]) => {
    const newId = Math.max(...exams.map((e) => e.id)) + 1;
    const exam = {
      id: newId,
      exam_name: newExam.exam_name,
      exam_type: newExam.exam_type,
      academic_year_id: 0,
      academic_year: "2024-25",
      class_range: newExam.class_range,
      start_date: newExam.start_date,
      end_date: newExam.end_date,
      pass_marks: parseInt(newExam.pass_marks || "0"),
      max_marks: parseInt(newExam.max_marks || "0"),
      status: "scheduled",
      students_count: 0,
    };

    setExams([...exams, exam]);
    setNewExam({
      exam_name: "",
      exam_type: "",
      class_range: "",
      start_date: "",
      end_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddExamOpen(false);
  };

  // Reset functions
  const resetClassForm = () => {
    setNewClass({ class_name: "" });
    setIsAddClassOpen(false);
  };

  const resetSubjectForm = () => {
    setNewSubject({
      subject_name: "",
      subject_code: "",
      class_range: "",
      teacher_id: "",
      max_marks: "",
      pass_marks: "",
    });
    setIsAddSubjectOpen(false);
  };

  const resetExamForm = () => {
    setNewExam({
      exam_name: "",
      exam_type: "",
      class_range: "",
      start_date: "",
      end_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddExamOpen(false);
  };

  return {
    // Form states
    isAddClassOpen,
    setIsAddClassOpen,
    isAddSubjectOpen,
    setIsAddSubjectOpen,
    isAddExamOpen,
    setIsAddExamOpen,
    
    // Form data
    newClass,
    setNewClass,
    newSubject,
    setNewSubject,
    newExam,
    setNewExam,
    
    // Handlers
    handleAddClass,
    handleAddSubject,
    handleAddExam,
    
    // Reset functions
    resetClassForm,
    resetSubjectForm,
    resetExamForm,
    
    // Loading states
    isCreatingClass: createClassMutation.isPending,
    isCreatingSubject: createSubjectMutation.isPending,
  };
};
