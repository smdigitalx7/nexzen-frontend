import { Api, getApiBaseUrl } from "@/lib/api";
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

const SCHOOL_PREFIX = "/school";

export const SchoolService = {
  // Classes
  listClasses(): Promise<ClassRead[]> {
    return Api.get<ClassRead[]>(`${SCHOOL_PREFIX}/classes/`);
  },
  listClassesWithSubjects(): Promise<ClassWithSubjects[]> {
    return Api.get<ClassWithSubjects[]>(`${SCHOOL_PREFIX}/classes/with-subjects`);
  },
  getClass(id: number): Promise<ClassRead> {
    return Api.get<ClassRead>(`${SCHOOL_PREFIX}/classes/${id}`);
  },
  createClass(payload: ClassCreate): Promise<ClassRead> {
    return Api.post<ClassRead>(`${SCHOOL_PREFIX}/classes/`, payload);
  },
  updateClass(id: number, payload: ClassUpdate): Promise<ClassRead> {
    return Api.put<ClassRead>(`${SCHOOL_PREFIX}/classes/${id}`, payload);
  },

  // Sections
  listSections(classId: number): Promise<SectionRead[]> {
    return Api.get<SectionRead[]>(`${SCHOOL_PREFIX}/classes/${classId}/sections/`);
  },
  getSection(classId: number, id: number): Promise<SectionRead> {
    return Api.get<SectionRead>(`${SCHOOL_PREFIX}/classes/${classId}/sections/${id}`);
  },
  createSection(classId: number, payload: SectionCreate): Promise<SectionRead> {
    return Api.post<SectionRead>(`${SCHOOL_PREFIX}/classes/${classId}/sections/`, payload);
  },
  updateSection(classId: number, id: number, payload: SectionUpdate): Promise<SectionRead> {
    return Api.put<SectionRead>(`${SCHOOL_PREFIX}/classes/${classId}/sections/${id}`, payload);
  },

  // Subjects
  listSubjects(): Promise<SubjectRead[]> {
    return Api.get<SubjectRead[]>(`${SCHOOL_PREFIX}/subjects/`);
  },
  getSubject(id: number): Promise<SubjectRead> {
    return Api.get<SubjectRead>(`${SCHOOL_PREFIX}/subjects/${id}`);
  },
  createSubject(payload: SubjectCreate): Promise<SubjectRead> {
    return Api.post<SubjectRead>(`${SCHOOL_PREFIX}/subjects/`, payload);
  },
  updateSubject(id: number, payload: SubjectUpdate): Promise<SubjectRead> {
    return Api.put<SubjectRead>(`${SCHOOL_PREFIX}/subjects/${id}`, payload);
  },

  // Class Subjects
  listClassSubjects(): Promise<ClassSubjectRead[]> {
    return Api.get<ClassSubjectRead[]>(`${SCHOOL_PREFIX}/class-subjects/`);
  },
  listClassSubjectsByClass(classId: number): Promise<ClassSubjectRead[]> {
    return Api.get<ClassSubjectRead[]>(`${SCHOOL_PREFIX}/class-subjects/classes/${classId}`);
  },
  listClassSubjectsBySubject(subjectId: number): Promise<ClassSubjectRead[]> {
    return Api.get<ClassSubjectRead[]>(`${SCHOOL_PREFIX}/class-subjects/subjects/${subjectId}`);
  },
  createClassSubject(payload: ClassSubjectCreate): Promise<ClassSubjectRead> {
    return Api.post<ClassSubjectRead>(`${SCHOOL_PREFIX}/class-subjects/`, payload);
  },
  updateClassSubjectByClass(classId: number, payload: ClassSubjectUpdate): Promise<ClassSubjectRead> {
    return Api.put<ClassSubjectRead>(`${SCHOOL_PREFIX}/class-subjects/classes/${classId}` , payload);
  },
  updateClassSubjectBySubject(subjectId: number, payload: ClassSubjectUpdate): Promise<ClassSubjectRead> {
    return Api.put<ClassSubjectRead>(`${SCHOOL_PREFIX}/class-subjects/subjects/${subjectId}` , payload);
  },

  // Reservations
  createReservation(form: FormData) {
    return Api.postForm(`${SCHOOL_PREFIX}/reservations/`, form);
  },
  listReservations(query?: { page?: number; page_size?: number; class_id?: number }) {
    return Api.get<{ reservations: any[]; current_page: number; page_size: number; total_pages: number; total_count: number }>(
      `${SCHOOL_PREFIX}/reservations/`,
      query as any,
    );
  },
  getReservation(reservationId: number) {
    return Api.get(`${SCHOOL_PREFIX}/reservations/${reservationId}`);
  },
  updateReservation(reservationId: number, form: FormData) {
    return Api.putForm(`${SCHOOL_PREFIX}/reservations/${reservationId}`, form);
  },
  deleteReservation(reservationId: number) {
    return Api.delete(`${SCHOOL_PREFIX}/reservations/${reservationId}`);
  },
  updateReservationStatus(reservationId: number, status: 'PENDING' | 'ADMITTED' | 'CANCELLED') {
    const fd = new FormData();
    fd.append('status', status);
    return Api.putForm(`${SCHOOL_PREFIX}/reservations/${reservationId}/status`, fd);
  },

  // Tuition Fee Structures
  listTuitionFeeStructures(): Promise<TuitionFeeStructureRead[]> {
    return Api.get<TuitionFeeStructureRead[]>(`${SCHOOL_PREFIX}/tuition-fee-structures/`);
  },
  getTuitionFeeStructure(id: number): Promise<TuitionFeeStructureRead> {
    return Api.get<TuitionFeeStructureRead>(`${SCHOOL_PREFIX}/tuition-fee-structures/${id}`);
  },
  getTuitionFeeStructureByClass(classId: number): Promise<TuitionFeeStructureRead> {
    return Api.get<TuitionFeeStructureRead>(`${SCHOOL_PREFIX}/tuition-fee-structures/class/${classId}`);
  },
  createTuitionFeeStructure(payload: TuitionFeeStructureCreate): Promise<TuitionFeeStructureRead> {
    return Api.post<TuitionFeeStructureRead>(`${SCHOOL_PREFIX}/tuition-fee-structures/`, payload);
  },
  updateTuitionFeeStructure(id: number, payload: TuitionFeeStructureUpdate): Promise<TuitionFeeStructureRead> {
    return Api.put<TuitionFeeStructureRead>(`${SCHOOL_PREFIX}/tuition-fee-structures/${id}`, payload);
  },
};


