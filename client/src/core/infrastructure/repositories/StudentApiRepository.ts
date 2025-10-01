import { StudentEntity, StudentId, StudentStatus } from '../../domain/entities/Student';
import { StudentRepository } from '../../domain/repositories/StudentRepository';
import { ApiClient } from '../api/ApiClient';
import { StudentResponse } from '../../application/dto/StudentDto';

export class StudentApiRepository implements StudentRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findById(id: StudentId): Promise<StudentEntity | null> {
    try {
      const response = await this.apiClient.get<StudentResponse>(`/students/${id.getValue()}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async findAll(): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>('/students/');
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async findByStatus(status: StudentStatus): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>(`/students/status/${status}`);
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async findByClass(classId: number): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>(`/students/class/${classId}`);
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async findBySection(sectionId: number): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>(`/students/section/${sectionId}`);
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async findByClassAndSection(classId: number, sectionId: number): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>(`/students/class/${classId}/section/${sectionId}`);
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async findActiveStudents(): Promise<StudentEntity[]> {
    try {
      const response = await this.apiClient.get<StudentResponse[]>('/students/active');
      return response.data.map(student => this.mapToEntity(student));
    } catch (error) {
      throw error;
    }
  }
  
  async save(student: StudentEntity): Promise<StudentEntity> {
    try {
      const response = await this.apiClient.post<StudentResponse>('/students/', this.mapToRequest(student));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async update(student: StudentEntity): Promise<StudentEntity> {
    try {
      const response = await this.apiClient.put<StudentResponse>(`/students/${student.id.getValue()}`, this.mapToUpdateRequest(student));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async delete(id: StudentId): Promise<void> {
    try {
      await this.apiClient.delete(`/students/${id.getValue()}`);
    } catch (error) {
      throw error;
    }
  }
  
  async exists(id: StudentId): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }
  
  async count(): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>('/students/count');
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  async countByStatus(status: StudentStatus): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>(`/students/count/status/${status}`);
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  async countByClass(classId: number): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>(`/students/count/class/${classId}`);
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  async countBySection(sectionId: number): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>(`/students/count/section/${sectionId}`);
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  private mapToEntity(response: StudentResponse): StudentEntity {
    return StudentEntity.create(
      response.id,
      response.studentId,
      response.fullName,
      response.email,
      new Date(response.dateOfBirth),
      response.address,
      response.classId,
      response.sectionId,
      response.phoneNumber
    );
  }
  
  private mapToRequest(student: StudentEntity): any {
    return {
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email.getValue(),
      dateOfBirth: student.dateOfBirth.toISOString(),
      address: student.address,
      classId: student.classId,
      sectionId: student.sectionId,
      phoneNumber: student.phoneNumber
    };
  }
  
  private mapToUpdateRequest(student: StudentEntity): any {
    return {
      fullName: student.fullName,
      email: student.email.getValue(),
      dateOfBirth: student.dateOfBirth.toISOString(),
      address: student.address,
      classId: student.classId,
      sectionId: student.sectionId,
      phoneNumber: student.phoneNumber,
      status: student.status
    };
  }
}
