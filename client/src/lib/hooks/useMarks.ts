import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type {
  ExamMarkCreate,
  ExamMarkUpdate,
  ExamMarkRead,
  ExamMarkWithDetails,
  ExamMarkFullReadResponse,
  ExamGroupAndSubjectResponse,
  TestMarkCreate,
  TestMarkUpdate,
  TestMarkRead,
  TestMarkWithDetails,
  TestMarkFullReadResponse,
  TestGroupAndSubjectResponse,
  CreateExamMarkBulk,
  CreateTestMarkBulk,
  ExamMarkBulkCreateResult,
  TestMarkBulkCreateResult,
  ExamMarksQuery,
  TestMarksQuery,
  MarksQuery,
} from "@/lib/types/marks";
import { useToast } from "@/hooks/use-toast";

const keys = {
  examMarks: (query?: ExamMarksQuery) => ["school", "exam-marks", query || {}] as const,
  examMark: (id: number) => ["school", "exam-marks", id] as const,
  testMarks: (query?: TestMarksQuery) => ["school", "test-marks", query || {}] as const,
  testMark: (id: number) => ["school", "test-marks", id] as const,
};

// Exam Marks Hooks
export function useExamMarks(query?: ExamMarksQuery) {
  const queryKey = ['school', 'exam-marks', query ? query : 'idle'] as const;
  return useQuery<ExamGroupAndSubjectResponse[]>({
    queryKey,
    queryFn: async () => {
      const apiClient = ServiceLocator.getApiClient();
      const params = new URLSearchParams();
      
      // class_id is required
      if (query?.class_id) params.append('class_id', query.class_id.toString());
      if (query?.subject_id) params.append('subject_id', query.subject_id.toString());
      if (query?.section_id) params.append('section_id', query.section_id.toString());
      if (query?.exam_id) params.append('exam_id', query.exam_id.toString());

      const response = await apiClient.get(`/school/exam-marks/?${params.toString()}`);
      return response.data as ExamGroupAndSubjectResponse[];
    },
    enabled: !!query?.class_id, // Only run query if class_id is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExamMark(id: number) {
  return useQuery<ExamMarkFullReadResponse>({
    queryKey: keys.examMark(id),
    queryFn: async () => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.get(`/school/exam-marks/${id}`);
      return response.data as ExamMarkFullReadResponse;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateExamMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExamMarkCreate) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.post('/school/exam-marks/', data);
      return response.data as ExamMarkFullReadResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "exam-marks"] });
      toast({
        title: "Success",
        description: "Exam mark created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create exam mark",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateExamMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExamMarkUpdate }) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.put(`/school/exam-marks/${id}`, data);
      return response.data as ExamMarkFullReadResponse;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["school", "exam-marks"] });
      queryClient.invalidateQueries({ queryKey: keys.examMark(id) });
      toast({
        title: "Success",
        description: "Exam mark updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update exam mark",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteExamMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const apiClient = ServiceLocator.getApiClient();
      await apiClient.delete(`/school/exam-marks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "exam-marks"] });
      toast({
        title: "Success",
        description: "Exam mark deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete exam mark",
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreateExamMarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateExamMarkBulk) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.post('/school/exam-marks/bulk-create', data);
      return response.data as ExamMarkBulkCreateResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["school", "exam-marks"] });
      toast({
        title: "Success",
        description: `Bulk created ${result.created_count} exam marks`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to bulk create exam marks",
        variant: "destructive",
      });
    },
  });
}

// Test Marks Hooks
export function useTestMarks(query?: TestMarksQuery) {
  return useQuery<TestGroupAndSubjectResponse[]>({
    queryKey: keys.testMarks(query),
    queryFn: async () => {
      const apiClient = ServiceLocator.getApiClient();
      const params = new URLSearchParams();
      
      // class_id is required
      if (query?.class_id) params.append('class_id', query.class_id.toString());
      if (query?.subject_id) params.append('subject_id', query.subject_id.toString());
      if (query?.section_id) params.append('section_id', query.section_id.toString());
      if (query?.test_id) params.append('test_id', query.test_id.toString());

      const response = await apiClient.get(`/school/test-marks/?${params.toString()}`);
      return response.data as TestGroupAndSubjectResponse[];
    },
    enabled: !!query?.class_id, // Only run query if class_id is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTestMark(id: number) {
  return useQuery<TestMarkFullReadResponse>({
    queryKey: keys.testMark(id),
    queryFn: async () => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.get(`/school/test-marks/${id}`);
      return response.data as TestMarkFullReadResponse;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTestMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TestMarkCreate) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.post('/school/test-marks/', data);
      return response.data as TestMarkFullReadResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "test-marks"] });
      toast({
        title: "Success",
        description: "Test mark created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create test mark",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTestMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TestMarkUpdate }) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.put(`/school/test-marks/${id}`, data);
      return response.data as TestMarkFullReadResponse;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["school", "test-marks"] });
      queryClient.invalidateQueries({ queryKey: keys.testMark(id) });
      toast({
        title: "Success",
        description: "Test mark updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update test mark",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTestMark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const apiClient = ServiceLocator.getApiClient();
      await apiClient.delete(`/school/test-marks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "test-marks"] });
      toast({
        title: "Success",
        description: "Test mark deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete test mark",
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreateTestMarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTestMarkBulk) => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.post('/school/test-marks/bulk-create', data);
      return response.data as TestMarkBulkCreateResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["school", "test-marks"] });
      toast({
        title: "Success",
        description: `Bulk created ${result.created_count} test marks`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to bulk create test marks",
        variant: "destructive",
      });
    },
  });
}
