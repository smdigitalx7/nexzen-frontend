import { Container } from './Container';
import { UserUseCases } from '../../application/use-cases/UserUseCases';
import { EmployeeUseCases } from '../../application/use-cases/EmployeeUseCases';
import { StudentUseCases } from '../../application/use-cases/StudentUseCases';
import { BranchUseCases } from '../../application/use-cases/BranchUseCases';
import { AcademicYearUseCases } from '../../application/use-cases/AcademicYearUseCases';
import { AdvanceUseCases } from '../../application/use-cases/AdvanceUseCases';
import { RoleUseCases } from '../../application/use-cases/RoleUseCases';
import { EmployeeAttendanceUseCases } from '../../application/use-cases/EmployeeAttendanceUseCases';
import { EmployeeLeaveUseCases } from '../../application/use-cases/EmployeeLeaveUseCases';
import { PayrollUseCases } from '../../application/use-cases/PayrollUseCases';
import { TransportUseCases } from '../../application/use-cases/TransportUseCases';
import { UserBranchAccessUseCases } from '../../application/use-cases/UserBranchAccessUseCases';
import { ClassUseCases } from '../../application/use-cases/ClassUseCases';
import { SubjectUseCases } from '../../application/use-cases/SubjectUseCases';
import { ApiClient } from '../api/ApiClient';

export class ServiceLocator {
  private static container: Container;
  
  static initialize(config: { apiBaseUrl: string; authToken?: string }): void {
    this.container = Container.getInstance(config);
  }
  
  static getUserUseCases(): UserUseCases {
    this.ensureInitialized();
    return this.container.getUserUseCases();
  }
  
  static getEmployeeUseCases(): EmployeeUseCases {
    this.ensureInitialized();
    return this.container.getEmployeeUseCases();
  }
  
  static getStudentUseCases(): StudentUseCases {
    this.ensureInitialized();
    return this.container.getStudentUseCases();
  }
  
  static getBranchUseCases(): BranchUseCases {
    this.ensureInitialized();
    return this.container.getBranchUseCases();
  }
  
  static getAcademicYearUseCases(): AcademicYearUseCases {
    this.ensureInitialized();
    return this.container.getAcademicYearUseCases();
  }
  
  static getAdvanceUseCases(): AdvanceUseCases {
    this.ensureInitialized();
    return this.container.getAdvanceUseCases();
  }
  
  static getRoleUseCases(): RoleUseCases {
    this.ensureInitialized();
    return this.container.getRoleUseCases();
  }
  
  static getEmployeeAttendanceUseCases(): EmployeeAttendanceUseCases {
    this.ensureInitialized();
    return this.container.getEmployeeAttendanceUseCases();
  }
  
  static getEmployeeLeaveUseCases(): EmployeeLeaveUseCases {
    this.ensureInitialized();
    return this.container.getEmployeeLeaveUseCases();
  }
  
  static getPayrollUseCases(): PayrollUseCases {
    this.ensureInitialized();
    return this.container.getPayrollUseCases();
  }
  
  static getTransportUseCases(): TransportUseCases {
    this.ensureInitialized();
    return this.container.getTransportUseCases();
  }
  
  static getUserBranchAccessUseCases(): UserBranchAccessUseCases {
    this.ensureInitialized();
    return this.container.getUserBranchAccessUseCases();
  }
  
  static getClassUseCases(): ClassUseCases {
    this.ensureInitialized();
    return this.container.getClassUseCases();
  }
  
  static getSubjectUseCases(): SubjectUseCases {
    this.ensureInitialized();
    return this.container.getSubjectUseCases();
  }
  
  static getApiClient(): ApiClient {
    this.ensureInitialized();
    return this.container.getApiClient();
  }
  
  static setAuthToken(token: string): void {
    console.log('ServiceLocator: Setting auth token:', token.substring(0, 20) + '...');
    this.ensureInitialized();
    this.container.setAuthToken(token);
    console.log('ServiceLocator: Auth token set successfully');
  }
  
  static removeAuthToken(): void {
    this.ensureInitialized();
    this.container.removeAuthToken();
  }
  
  static updateConfig(config: { apiBaseUrl?: string; authToken?: string }): void {
    this.ensureInitialized();
    this.container.updateConfig(config);
  }
  
  static reset(): void {
    Container.reset();
    this.container = undefined as any;
  }
  
  private static ensureInitialized(): void {
    if (!this.container) {
      throw new Error('ServiceLocator must be initialized before use. Call ServiceLocator.initialize() first.');
    }
  }
}
