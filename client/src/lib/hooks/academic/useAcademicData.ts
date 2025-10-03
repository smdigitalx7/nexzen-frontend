import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceLocator } from '@/core';
import { useClasses, useSubjects, useClassesWithSubjects } from '@/lib/hooks/useSchool';

export const useAcademicData = () => {
  // Backend data hooks
  const { data: backendClasses = [], isLoading: classesLoading, isError: classesError, error: classesErrObj } = useClasses();
  const { data: classesWithSubjects = [], isLoading: classesWithSubjectsLoading, isError: classesWithSubjectsError, error: classesWithSubjectsErrObj } = useClassesWithSubjects();
  const { data: backendSubjects = [], isLoading: subjectsLoading, isError: subjectsError, error: subjectsErrObj } = useSubjects();
  
  // Get effective classes
  const effectiveClasses = (classesWithSubjects && classesWithSubjects.length > 0) ? classesWithSubjects : backendClasses;

  // Local state for exams (mock data for now)
  const [exams, setExams] = useState<any[]>([]);

  // Fetch exams from backend API
  const { data: fetchedExams = [], isLoading: examsLoading, isError: examsError, error: examsErrObj } = useQuery({
    queryKey: ['school', 'exams'],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<any[]>('/school/exams/');
      const mapExam = (d: any) => {
        const examDate = d.exam_date || d.examDate || d.date || '';
        return {
          id: d.exam_id || d.id,
          exam_name: d.exam_name || d.name || 'Exam',
          exam_date: examDate,
          pass_marks: d.pass_marks ?? d.passMarks ?? 0,
          max_marks: d.max_marks ?? d.maxMarks ?? 0,
        };
      };
      return Array.isArray(res.data) ? res.data.map(mapExam) : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (fetchedExams && fetchedExams.length >= 0) {
      setExams(fetchedExams);
    }
  }, [fetchedExams]);

  // Calculate statistics
  const totalClasses = effectiveClasses.length;
  const totalSubjects = backendSubjects.length;
  const today = new Date();
  const toDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };
  const activeExams = exams.filter((exam) => {
    const d = toDate(exam.exam_date);
    return d ? d >= new Date(today.toDateString()) : false;
  }).length;
  const completedExams = exams.filter((exam) => {
    const d = toDate(exam.exam_date);
    return d ? d < new Date(today.toDateString()) : false;
  }).length;

  // Fetch tests from backend API
  const { data: fetchedTests = [], isLoading: testsLoading, isError: testsError, error: testsErrObj } = useQuery({
    queryKey: ['school', 'tests'],
    queryFn: async () => {
      try {
        const api = ServiceLocator.getApiClient();
        const res = await api.get<any[]>('/school/tests');
        
        
        const mapTest = (d: any) => ({
          id: d.test_id, // Backend uses test_id, not id
          test_name: d.test_name,
          test_date: d.test_date,
          pass_marks: d.pass_marks,
          max_marks: d.max_marks,
        });
        
        return Array.isArray(res.data) ? res.data.map(mapTest) : [];
      } catch (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const [tests, setTests] = useState<any[]>([]);
  useEffect(() => {
    if (fetchedTests && fetchedTests.length >= 0) {
      setTests(fetchedTests);
    }
  }, [fetchedTests]);

  // Loading states
  const isLoading = classesLoading || classesWithSubjectsLoading || subjectsLoading || examsLoading || testsLoading;
  const hasError = classesError || classesWithSubjectsError || subjectsError || examsError || testsError;
  const errorMessage = (
    (classesErrObj as any)?.message ||
    (classesWithSubjectsErrObj as any)?.message ||
    (subjectsErrObj as any)?.message ||
    (examsErrObj as any)?.message ||
    (testsErrObj as any)?.message ||
    undefined
  );

  return {
    // Data
    backendClasses,
    classesWithSubjects,
    backendSubjects,
    exams,
    setExams,
    tests,
    setTests,
    
    // Statistics
    totalClasses,
    totalSubjects,
    activeExams,
    completedExams,
    
    // Loading states
    isLoading,
    hasError,
    errorMessage,
    classesLoading,
    classesWithSubjectsLoading,
    subjectsLoading,
  };
};
