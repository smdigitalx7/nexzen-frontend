import { StudentStatus } from '../../domain/entities/Student';

export interface CreateStudentRequest {
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  classId: number;
  sectionId: number;
  phoneNumber?: string;
}

export interface UpdateStudentRequest {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  classId?: number;
  sectionId?: number;
  phoneNumber?: string;
  status?: StudentStatus;
}

export interface StudentResponse {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  classId: number;
  sectionId: number;
  status: StudentStatus;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentListResponse {
  students: StudentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface StudentStatisticsResponse {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  graduatedStudents: number;
  transferredStudents: number;
  droppedStudents: number;
  studentsByClass: Record<number, number>;
  studentsByStatus: Record<StudentStatus, number>;
}
