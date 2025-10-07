import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type {
  ClassRead,
  ClassCreate,
  ClassUpdate,
  ClassWithSubjects,
  SectionRead,
  SectionCreate,
  SectionUpdate,
  SubjectRead,
  SubjectCreate,
  SubjectUpdate,
  ClassSubjectRead,
  ClassSubjectCreate,
  ClassSubjectUpdate,
  TuitionFeeStructureRead,
  TuitionFeeStructureCreate,
  TuitionFeeStructureUpdate,
} from "@/lib/types/school";
import { useToast } from "@/hooks/use-toast";
import { EnrollmentsService } from "@/lib/services/enrollments.service";

const keys = {
  classes: ["school", "classes"] as const,
  class: (id: number) => ["school", "classes", id] as const,
  classesWithSubjects: ["school", "classes", "with-subjects"] as const,
  sections: (classId: number) => ["school", "sections", classId] as const,
  section: (classId: number, id: number) => ["school", "sections", classId, id] as const,
  subjects: ["school", "subjects"] as const,
  subject: (id: number) => ["school", "subjects", id] as const,
  classSubjects: ["school", "class-subjects"] as const,
  classSubjectsByClass: (classId: number) => ["school", "class-subjects", "class", classId] as const,
  classSubjectsBySubject: (subjectId: number) => ["school", "class-subjects", "subject", subjectId] as const,
  tuitionFeeStructures: ["school", "tuition-fee-structures"] as const,
  tuitionFeeStructure: (id: number) => ["school", "tuition-fee-structures", id] as const,
  tuitionFeeStructureByClass: (classId: number) => ["school", "tuition-fee-structures", "class", classId] as const,
  students: ["school", "students"] as const,
  student: (id: number) => ["school", "students", id] as const,
  enrollments: (classId: number, filters?: any) => ["school", "classes", classId, "enrollments", filters || {}] as const,
  enrollment: (id: number) => ["school", "enrollments", id] as const,
};

// Classes
export function useClasses() {
  return useQuery<ClassRead[]>({ 
    queryKey: keys.classes, 
    queryFn: async () => {
      const classUseCases = ServiceLocator.getClassUseCases();
      const classes = await classUseCases.getAllClasses();
      
      // Convert clean architecture response to legacy format
      return classes.map(classEntity => ({
        class_id: classEntity.id,
        class_name: classEntity.name,
        description: classEntity.description,
        branch_id: classEntity.branchId,
        is_active: classEntity.isActive,
        created_at: classEntity.createdAt,
        updated_at: classEntity.updatedAt,
        created_by: null,
        updated_by: null,
      }));
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}
export function useClassesWithSubjects() {
  return useQuery<ClassWithSubjects[]>({ 
    queryKey: keys.classesWithSubjects, 
    queryFn: async () => {
      const classUseCases = ServiceLocator.getClassUseCases();
      const classes = await classUseCases.getAllClasses();
      
      // Convert ClassResponse[] to ClassWithSubjects[] format
      return classes.map((classEntity: any) => ({
        class_id: classEntity.id,
        class_name: classEntity.name,
        subjects: [], // TODO: Add subjects support
      }));
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}

export function useClassWithSubjects(classId: number) {
  return useQuery<ClassWithSubjects>({ 
    queryKey: ["school", "classes", classId, "subjects"], 
    queryFn: async (): Promise<ClassWithSubjects> => {
      const apiClient = ServiceLocator.getApiClient();
      const response = await apiClient.get(`/school/classes/${classId}/subjects`);
      return response.data as ClassWithSubjects;
    }, 
    enabled: Number.isFinite(classId) && classId > 0,
    staleTime: QUERY_STALE_TIME 
  });
}
export function useClass(id: number) {
  return useQuery<ClassRead>({ 
    queryKey: keys.class(id), 
    queryFn: async () => {
      console.log(`Fetching class ${id} with clean architecture...`);
      const classUseCases = ServiceLocator.getClassUseCases();
      const classEntity = await classUseCases.getClassById(id);
      
      if (!classEntity) {
        throw new Error('Class not found');
      }
      
      // Convert clean architecture response to legacy format
      return {
        class_id: classEntity.id,
        class_name: classEntity.name,
        description: classEntity.description,
        branch_id: classEntity.branchId,
        is_active: classEntity.isActive,
        created_at: classEntity.createdAt,
        updated_at: classEntity.updatedAt,
        created_by: null,
        updated_by: null,
      };
    }, 
    enabled: Number.isFinite(id) 
  });
}
export function useCreateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: ClassCreate) => {
      console.log("Creating class with clean architecture...");
      const classUseCases = ServiceLocator.getClassUseCases();
      const classEntity = await classUseCases.createClass({
        name: payload.class_name,
        description: undefined, // TODO: Add description support
        branchId: 1, // TODO: Add branch support
      });
      
      // Return the response data directly
      return classEntity;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.classes });
      qc.invalidateQueries({ queryKey: keys.classesWithSubjects });
      toast({ title: "Success", description: `Class "${data.name}" created.` });
    },
  });
}
export function useUpdateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ClassUpdate }) => {
      console.log(`Updating class ${id} with clean architecture...`);
      const classUseCases = ServiceLocator.getClassUseCases();
      const classEntity = await classUseCases.updateClass({
        id,
        name: payload.class_name,
        description: undefined, // TODO: Add description support
        isActive: true, // TODO: Add isActive support
      });
      
      // Return the response data directly
      return classEntity;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.classes });
      qc.invalidateQueries({ queryKey: keys.classesWithSubjects });
      qc.invalidateQueries({ queryKey: keys.class(id) });
      toast({ title: "Success", description: `Class updated.` });
    },
  });
}

// Sections
export function useSections(classId: number) {
  // TODO: Implement sections functionality in clean architecture
  return useQuery<SectionRead[]>({ 
    queryKey: keys.sections(classId), 
    queryFn: () => Promise.resolve([]), 
    enabled: Number.isFinite(classId) 
  });
}

// Get sections for all classes
export function useAllClassesSections(classIds: number[]) {
  return useQuery<Record<number, SectionRead[]>>({
    queryKey: ['school', 'sections', 'all', classIds],
    queryFn: async () => {
      const sectionsMap: Record<number, SectionRead[]> = {};
      await Promise.all(
        classIds.map(async (classId) => {
          try {
            const sections: SectionRead[] = []; // TODO: Implement sections functionality
            sectionsMap[classId] = sections;
          } catch (error) {
            sectionsMap[classId] = [];
          }
        })
      );
      return sectionsMap;
    },
    enabled: classIds.length > 0,
  });
}
export function useCreateSection(classId: number) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: SectionCreate) => Promise.resolve({} as SectionRead), // TODO: Implement sections functionality
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sections(classId) });
      toast({ title: "Success", description: `Section created.` });
    },
  });
}
export function useUpdateSection(classId: number) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SectionUpdate }) => Promise.resolve({} as SectionRead), // TODO: Implement sections functionality
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.sections(classId) });
      qc.invalidateQueries({ queryKey: keys.section(classId, id) });
      toast({ title: "Success", description: `Section updated.` });
    },
  });
}

// Subjects
export function useSubjects() {
  return useQuery<SubjectRead[]>({ 
    queryKey: keys.subjects, 
    queryFn: async () => {
      const subjectUseCases = ServiceLocator.getSubjectUseCases();
      const subjects = await subjectUseCases.getAllSubjects();
      
      // Convert clean architecture response to legacy format
      return subjects.map(subjectEntity => ({
        subject_id: subjectEntity.id,
        subject_name: subjectEntity.name,
        subject_code: subjectEntity.code,
        description: subjectEntity.description,
        branch_id: subjectEntity.branchId,
        is_active: subjectEntity.isActive,
        created_at: subjectEntity.createdAt,
        updated_at: subjectEntity.updatedAt,
        created_by: null,
        updated_by: null,
      }));
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}
export function useCreateSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: SubjectCreate) => {
      console.log("Creating subject with clean architecture...");
      const subjectUseCases = ServiceLocator.getSubjectUseCases();
      const subject = await subjectUseCases.createSubject({
        name: payload.subject_name,
        code: payload.subject_name?.toLowerCase().replace(/\s+/g, '_') || 'subject', // Generate code from name
        description: undefined, // TODO: Add description support
        branchId: 1, // TODO: Add branch support
      });
      
      // Return the response data directly
      return subject;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.subjects });
      toast({ title: "Success", description: `Subject created.` });
    },
  });
}
export function useUpdateSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: SubjectUpdate }) => {
      console.log(`Updating subject ${id} with clean architecture...`);
      const subjectUseCases = ServiceLocator.getSubjectUseCases();
      const subject = await subjectUseCases.updateSubject({
        id,
        name: payload.subject_name,
        code: payload.subject_name?.toLowerCase().replace(/\s+/g, '_') || 'subject', // Generate code from name
        description: undefined, // TODO: Add description support
        isActive: true, // TODO: Add isActive support
      });
      
      // Return the response data directly
      return subject;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.subjects });
      qc.invalidateQueries({ queryKey: keys.subject(id) });
      toast({ title: "Success", description: `Subject updated.` });
    },
  });
}

// Class Subjects
export function useClassSubjects() {
  return useQuery<ClassSubjectRead[]>({ queryKey: keys.classSubjects, queryFn: () => Promise.resolve([]), staleTime: QUERY_STALE_TIME }); // TODO: Implement class subjects functionality
}
export function useClassSubjectsByClass(classId: number) {
  return useQuery<ClassSubjectRead[]>({ queryKey: keys.classSubjectsByClass(classId), queryFn: () => Promise.resolve([]), enabled: Number.isFinite(classId) }); // TODO: Implement class subjects functionality
}
export function useClassSubjectsBySubject(subjectId: number) {
  return useQuery<ClassSubjectRead[]>({ queryKey: keys.classSubjectsBySubject(subjectId), queryFn: () => Promise.resolve([]), enabled: Number.isFinite(subjectId) }); // TODO: Implement class subjects functionality
}
export function useCreateClassSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: ClassSubjectCreate) => Promise.resolve({} as ClassSubjectRead), // TODO: Implement class subjects functionality
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.classSubjects });
      toast({ title: "Success", description: `Class-Subject mapping created.` });
    },
  });
}
export function useUpdateClassSubjectByClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ classId, payload }: { classId: number; payload: ClassSubjectUpdate }) => Promise.resolve({} as ClassSubjectRead), // TODO: Implement class subjects functionality
    onSuccess: (_data, { classId }) => {
      qc.invalidateQueries({ queryKey: keys.classSubjectsByClass(classId) });
      toast({ title: "Success", description: `Class-Subject updated for class.` });
    },
  });
}
export function useUpdateClassSubjectBySubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ subjectId, payload }: { subjectId: number; payload: ClassSubjectUpdate }) => Promise.resolve({} as ClassSubjectRead), // TODO: Implement class subjects functionality
    onSuccess: (_data, { subjectId }) => {
      qc.invalidateQueries({ queryKey: keys.classSubjectsBySubject(subjectId) });
      toast({ title: "Success", description: `Class-Subject updated for subject.` });
    },
  });
}

// Tuition Fee Structures
export function useTuitionFeeStructures() {
  return useQuery<TuitionFeeStructureRead[]>({ 
    queryKey: keys.tuitionFeeStructures, 
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<TuitionFeeStructureRead[]>(`/school/tuition-fee-structures/`);
      return res.data as TuitionFeeStructureRead[];
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}
export function useTuitionFeeStructure(id: number) {
  return useQuery<TuitionFeeStructureRead>({ 
    queryKey: keys.tuitionFeeStructure(id), 
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<TuitionFeeStructureRead>(`/school/tuition-fee-structures/${id}`);
      return res.data as TuitionFeeStructureRead;
    }, 
    enabled: Number.isFinite(id) 
  });
}
export function useTuitionFeeStructureByClass(classId: number) {
  return useQuery<TuitionFeeStructureRead>({ 
    queryKey: keys.tuitionFeeStructureByClass(classId), 
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<TuitionFeeStructureRead>(`/school/tuition-fee-structures/class/${classId}`);
      return res.data as TuitionFeeStructureRead;
    }, 
    enabled: Number.isFinite(classId) 
  });
}
export function useCreateTuitionFeeStructure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: TuitionFeeStructureCreate) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.post<TuitionFeeStructureRead>(`/school/tuition-fee-structures/`, payload);
      return res.data as TuitionFeeStructureRead;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tuitionFeeStructures });
      toast({ title: "Success", description: `Tuition fee structure created.` });
    },
  });
}
export function useUpdateTuitionFeeStructure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: TuitionFeeStructureUpdate }) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.put<TuitionFeeStructureRead>(`/school/tuition-fee-structures/${id}`, payload);
      return res.data as TuitionFeeStructureRead;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.tuitionFeeStructures });
      qc.invalidateQueries({ queryKey: keys.tuitionFeeStructure(id) });
      toast({ title: "Success", description: `Tuition fee structure updated.` });
    },
  });
}

// Students hooks
export function useStudents() {
  return useQuery({
    queryKey: keys.students,
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<any>('/school/students/');
      
      // Handle paginated response
      if (res.data && res.data.data) {
        return res.data.data; // Return the students array from paginated response
      }
      return res.data || [];
    },
    staleTime: QUERY_STALE_TIME,
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: keys.student(id),
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<any>(`/school/students/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  });
}

// Enrollments
export function useEnrollments(params: { class_id: number; section_id?: number; admission_no?: string }) {
  const queryKey = keys.enrollments(params.class_id, { section_id: params.section_id || null, admission_no: params.admission_no || null });
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await EnrollmentsService.list(params);
      return res.data || [];
    },
    enabled: Number.isFinite(params.class_id) && params.class_id > 0,
    staleTime: QUERY_STALE_TIME,
  });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: EnrollmentsService.create,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.enrollments(data.class_id) });
      toast({ title: "Success", description: "Enrollment created." });
    },
  });
}

export function useUpdateEnrollment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ class_id, id, payload }: { class_id: number; id: number; payload: any }) => EnrollmentsService.update(class_id, id, payload),
    onSuccess: (data, { class_id, id }) => {
      qc.invalidateQueries({ queryKey: keys.enrollment(id) });
      if (class_id) qc.invalidateQueries({ queryKey: keys.enrollments(class_id) });
      toast({ title: "Success", description: "Enrollment updated." });
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.post<any>('/school/students/', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.students });
      toast({ title: "Success", description: `Student created successfully.` });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.put<any>(`/school/students/${id}`, payload);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.students });
      qc.invalidateQueries({ queryKey: keys.student(id) });
      toast({ title: "Success", description: `Student updated successfully.` });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const api = ServiceLocator.getApiClient();
      const res = await api.delete<any>(`/school/students/${id}`);
      return res.data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: keys.students });
      qc.invalidateQueries({ queryKey: keys.student(id) });
      toast({ title: "Success", description: `Student deleted successfully.` });
    },
  });
}


