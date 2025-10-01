import { StudentEntity, StudentId, StudentStatus } from '../entities/Student';
import { StudentRepository } from '../repositories/StudentRepository';

export interface CreateStudentRequest {
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: Date;
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

export class StudentDomainService {
  constructor(private studentRepository: StudentRepository) {}
  
  async createStudent(studentData: CreateStudentRequest): Promise<StudentEntity> {
    // Validate email uniqueness
    const existingStudents = await this.studentRepository.findAll();
    const emailExists = existingStudents.some(student => student.email.getValue() === studentData.email);
    if (emailExists) {
      throw new Error('Student with this email already exists');
    }
    
    // Validate student ID uniqueness
    const studentIdExists = existingStudents.some(student => student.studentId === studentData.studentId);
    if (studentIdExists) {
      throw new Error('Student with this ID already exists');
    }
    
    // Validate age (must be between 3 and 25)
    const age = this.calculateAge(studentData.dateOfBirth);
    if (age < 3 || age > 25) {
      throw new Error('Student age must be between 3 and 25 years');
    }
    
    // Create new student entity
    const student = StudentEntity.create(
      0, // Will be assigned by repository
      studentData.studentId,
      studentData.fullName,
      studentData.email,
      studentData.dateOfBirth,
      studentData.address,
      studentData.classId,
      studentData.sectionId,
      studentData.phoneNumber
    );
    
    return this.studentRepository.save(student);
  }
  
  async updateStudent(studentId: StudentId, updateData: Partial<CreateStudentRequest>): Promise<StudentEntity> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    let updatedStudent = student;
    
    // Update personal info if provided
    if (updateData.fullName || updateData.email || updateData.phoneNumber !== undefined || updateData.dateOfBirth) {
      updatedStudent = updatedStudent.updatePersonalInfo(
        updateData.fullName || student.fullName,
        updateData.email || student.email.getValue(),
        updateData.phoneNumber,
        updateData.dateOfBirth
      );
    }
    
    // Update address if provided
    if (updateData.address) {
      updatedStudent = updatedStudent.updateAddress(updateData.address);
    }
    
    // Update class/section if provided
    if (updateData.classId || updateData.sectionId) {
      updatedStudent = updatedStudent.transferToClass(
        updateData.classId || student.classId,
        updateData.sectionId || student.sectionId
      );
    }
    
    return this.studentRepository.update(updatedStudent);
  }
  
  async updateStudentStatus(studentId: StudentId, status: StudentStatus): Promise<StudentEntity> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    let updatedStudent: StudentEntity;
    
    switch (status) {
      case StudentStatus.ACTIVE:
        updatedStudent = student.activate();
        break;
      case StudentStatus.INACTIVE:
        updatedStudent = student.deactivate();
        break;
      case StudentStatus.GRADUATED:
        updatedStudent = student.graduate();
        break;
      case StudentStatus.TRANSFERRED:
        updatedStudent = student.transfer();
        break;
      case StudentStatus.DROPPED:
        updatedStudent = student.drop();
        break;
      default:
        throw new Error('Invalid student status');
    }
    
    return this.studentRepository.update(updatedStudent);
  }
  
  async deleteStudent(studentId: StudentId): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Business rule: Cannot delete active students
    if (student.isActive()) {
      throw new Error('Cannot delete active student. Please deactivate or transfer first.');
    }
    
    await this.studentRepository.delete(studentId);
  }
  
  async getStudentStatistics(): Promise<{
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    graduatedStudents: number;
    transferredStudents: number;
    droppedStudents: number;
    studentsByClass: Record<number, number>;
    studentsByStatus: Record<StudentStatus, number>;
  }> {
    const allStudents = await this.studentRepository.findAll();
    const activeStudents = allStudents.filter(student => student.isActive());
    const inactiveStudents = allStudents.filter(student => student.status === StudentStatus.INACTIVE);
    const graduatedStudents = allStudents.filter(student => student.isGraduated());
    const transferredStudents = allStudents.filter(student => student.isTransferred());
    const droppedStudents = allStudents.filter(student => student.isDropped());
    
    const studentsByClass: Record<number, number> = {};
    const studentsByStatus: Record<StudentStatus, number> = {
      [StudentStatus.ACTIVE]: 0,
      [StudentStatus.INACTIVE]: 0,
      [StudentStatus.GRADUATED]: 0,
      [StudentStatus.TRANSFERRED]: 0,
      [StudentStatus.DROPPED]: 0,
    };
    
    allStudents.forEach(student => {
      // Count by class
      studentsByClass[student.classId] = (studentsByClass[student.classId] || 0) + 1;
      
      // Count by status
      studentsByStatus[student.status] = (studentsByStatus[student.status] || 0) + 1;
    });
    
    return {
      totalStudents: allStudents.length,
      activeStudents: activeStudents.length,
      inactiveStudents: inactiveStudents.length,
      graduatedStudents: graduatedStudents.length,
      transferredStudents: transferredStudents.length,
      droppedStudents: droppedStudents.length,
      studentsByClass,
      studentsByStatus,
    };
  }
  
  async getStudentsByClass(classId: number): Promise<StudentEntity[]> {
    return this.studentRepository.findByClass(classId);
  }
  
  async getStudentsBySection(sectionId: number): Promise<StudentEntity[]> {
    return this.studentRepository.findBySection(sectionId);
  }
  
  async getActiveStudents(): Promise<StudentEntity[]> {
    return this.studentRepository.findActiveStudents();
  }
  
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
