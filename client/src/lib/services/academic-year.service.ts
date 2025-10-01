import { Api } from "@/lib/api";
import { AcademicYearCreate, AcademicYearUpdate, AcademicYearRead } from '../types/academic-year';

export const AcademicYearService = {
  // Get all academic years
  listAcademicYears: (): Promise<AcademicYearRead[]> => {
    return Api.get<AcademicYearRead[]>('/academic-years/');
  },

  // Get academic year by ID
  getAcademicYear: (id: number): Promise<AcademicYearRead> => {
    return Api.get<AcademicYearRead>(`/academic-years/${id}`);
  },

  // Create new academic year
  createAcademicYear: (data: AcademicYearCreate): Promise<AcademicYearRead> => {
    return Api.post<AcademicYearRead>('/academic-years/', data);
  },

  // Update academic year
  updateAcademicYear: (id: number, data: AcademicYearUpdate): Promise<AcademicYearRead> => {
    return Api.put<AcademicYearRead>(`/academic-years/${id}`, data);
  },

  // Delete academic year
  deleteAcademicYear: (id: number): Promise<boolean> => {
    return Api.delete<boolean>(`/academic-years/${id}`);
  },
};
