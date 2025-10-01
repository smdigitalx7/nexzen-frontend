import { StudentEntity, StudentId, StudentStatus } from '../../domain/entities/Student';
import { StudentRepository } from '../../domain/repositories/StudentRepository';
import { StudentDomainService } from '../../domain/services/StudentDomainService';
import { 
  CreateStudentRequest, 
  UpdateStudentRequest, 
  StudentResponse, 
  StudentListResponse, 
  StudentStatisticsResponse 
} from '../dto/StudentDto';

export class StudentUseCases {
  constructor(
    private studentRepository: StudentRepository,
    private studentDomainService: StudentDomainService
  ) {}
  
  async createStudent(request: CreateStudentRequest): Promise<StudentResponse> {
    try {
      const student = await this.studentDomainService.createStudent({
        ...request,
        dateOfBirth: new Date(request.dateOfBirth)
      });
      return this.mapToResponse(student);
    } catch (error) {
      throw new Error(`Failed to create student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateStudent(studentId: number, request: UpdateStudentRequest): Promise<StudentResponse> {
    try {
      const updateData = {
        ...request,
        dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined
      };
      const student = await this.studentDomainService.updateStudent(new StudentId(studentId), updateData);
      return this.mapToResponse(student);
    } catch (error) {
      throw new Error(`Failed to update student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateStudentStatus(studentId: number, status: StudentStatus): Promise<StudentResponse> {
    try {
      const student = await this.studentDomainService.updateStudentStatus(new StudentId(studentId), status);
      return this.mapToResponse(student);
    } catch (error) {
      throw new Error(`Failed to update student status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async deleteStudent(studentId: number): Promise<void> {
    try {
      await this.studentDomainService.deleteStudent(new StudentId(studentId));
    } catch (error) {
      throw new Error(`Failed to delete student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getStudentById(studentId: number): Promise<StudentResponse> {
    try {
      const student = await this.studentRepository.findById(new StudentId(studentId));
      if (!student) {
        throw new Error('Student not found');
      }
      return this.mapToResponse(student);
    } catch (error) {
      throw new Error(`Failed to get student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllStudents(): Promise<StudentResponse[]> {
    try {
      const students = await this.studentRepository.findAll();
      return students.map(student => this.mapToResponse(student));
    } catch (error) {
      throw new Error(`Failed to get students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getStudentsByClass(classId: number): Promise<StudentResponse[]> {
    try {
      const students = await this.studentDomainService.getStudentsByClass(classId);
      return students.map(student => this.mapToResponse(student));
    } catch (error) {
      throw new Error(`Failed to get students by class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getStudentsBySection(sectionId: number): Promise<StudentResponse[]> {
    try {
      const students = await this.studentDomainService.getStudentsBySection(sectionId);
      return students.map(student => this.mapToResponse(student));
    } catch (error) {
      throw new Error(`Failed to get students by section: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getActiveStudents(): Promise<StudentResponse[]> {
    try {
      const students = await this.studentDomainService.getActiveStudents();
      return students.map(student => this.mapToResponse(student));
    } catch (error) {
      throw new Error(`Failed to get active students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getStudentStatistics(): Promise<StudentStatisticsResponse> {
    try {
      const stats = await this.studentDomainService.getStudentStatistics();
      return {
        totalStudents: stats.totalStudents,
        activeStudents: stats.activeStudents,
        inactiveStudents: stats.inactiveStudents,
        graduatedStudents: stats.graduatedStudents,
        transferredStudents: stats.transferredStudents,
        droppedStudents: stats.droppedStudents,
        studentsByClass: stats.studentsByClass,
        studentsByStatus: stats.studentsByStatus,
      };
    } catch (error) {
      throw new Error(`Failed to get student statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async searchStudents(query: string): Promise<StudentResponse[]> {
    try {
      const allStudents = await this.studentRepository.findAll();
      const filteredStudents = allStudents.filter(student => 
        student.fullName.toLowerCase().includes(query.toLowerCase()) ||
        student.email.getValue().toLowerCase().includes(query.toLowerCase()) ||
        student.studentId.toLowerCase().includes(query.toLowerCase())
      );
      return filteredStudents.map(student => this.mapToResponse(student));
    } catch (error) {
      throw new Error(`Failed to search students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private mapToResponse(student: StudentEntity): StudentResponse {
    return {
      id: student.id.getValue(),
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email.getValue(),
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth.toISOString(),
      address: student.address,
      classId: student.classId,
      sectionId: student.sectionId,
      status: student.status,
      enrollmentDate: student.enrollmentDate.toISOString(),
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  }
}
