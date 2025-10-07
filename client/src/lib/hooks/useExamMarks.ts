import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type {
  ExamMarkCreate,
  ExamMarkUpdate,
  ExamMarkRead,
  ExamMarkWithDetails,
  ExamMarkFullReadResponse,
  ExamGroupAndSubjectResponse,
  CreateExamMarkBulk,
  ExamMarkBulkCreateResult,
  ExamMarksQuery,
} from "@/lib/types/exam-marks";
import { useToast } from "@/hooks/use-toast";

const keys = {
  examMarks: (query?: ExamMarksQuery) => {
    if (!query) return ["school", "exam-marks"] as const;
    
    // Create a stable, serializable query key with only defined values
    const stableQuery: Record<string, any> = {
      class_id: query.class_id,
    };
    
    if (query.subject_id !== undefined && query.subject_id !== null && !isNaN(query.subject_id)) {
      stableQuery.subject_id = query.subject_id;
    }
    if (query.section_id !== undefined && query.section_id !== null && !isNaN(query.section_id)) {
      stableQuery.section_id = query.section_id;
    }
    if (query.exam_id !== undefined && query.exam_id !== null && !isNaN(query.exam_id)) {
      stableQuery.exam_id = query.exam_id;
    }
    
    return ["school", "exam-marks", stableQuery] as const;
  },
  examMark: (id: number) => ["school", "exam-marks", id] as const,
};

// Exam Marks Hooks
export function useExamMarks(query?: ExamMarksQuery) {
  // Safely generate query key with error handling
  const queryKey = (() => {
    try {
      return keys.examMarks(query);
    } catch (error) {
      console.warn('Error generating query key for useExamMarks:', error);
      return ["school", "exam-marks", "error"] as const;
    }
  })();

  return useQuery<ExamGroupAndSubjectResponse[]>({
    queryKey,
    queryFn: async () => {
      if (!query?.class_id) {
        return [];
      }
      
      const apiClient = ServiceLocator.getApiClient();
      const params = new URLSearchParams();
      
      // class_id is required
      if (query.class_id) params.append('class_id', query.class_id.toString());
      if (query.subject_id) params.append('subject_id', query.subject_id.toString());
      if (query.section_id) params.append('section_id', query.section_id.toString());
      if (query.exam_id) params.append('exam_id', query.exam_id.toString());

      const response = await apiClient.get(`/school/exam-marks/?${params.toString()}`);
      const data = response.data as ExamGroupAndSubjectResponse[];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!query?.class_id, // Only run query if class_id is provided
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useExamMark(id: number) {
  // Safely generate query key with error handling
  const queryKey = (() => {
    try {
      return keys.examMark(id);
    } catch (error) {
      console.warn('Error generating query key for useExamMark:', error);
      return ["school", "exam-marks", "error"] as const;
    }
  })();

  return useQuery<ExamMarkFullReadResponse>({
    queryKey,
    queryFn: async () => {
      if (!id || id <= 0) {
        throw new Error('Invalid exam mark ID');
      }
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.get(`/school/exam-marks/${id}`);
      return response.data as ExamMarkFullReadResponse;
    },
    enabled: !!id && id > 0,
    staleTime: QUERY_STALE_TIME,
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
