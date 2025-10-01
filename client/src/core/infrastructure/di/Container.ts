import { UserRepository } from '../../domain/repositories/UserRepository';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository';
import { StudentRepository } from '../../domain/repositories/StudentRepository';
import { BranchRepository } from '../../domain/repositories/BranchRepository';
import { AcademicYearRepository } from '../../domain/repositories/AcademicYearRepository';
import { IAdvanceRepository } from '../../domain/repositories/AdvanceRepository';
import { EmployeeAttendanceRepository } from '../../domain/repositories/EmployeeAttendanceRepository';
import { EmployeeLeaveRepository } from '../../domain/repositories/EmployeeLeaveRepository';
import { PayrollRepository } from '../../domain/repositories/PayrollRepository';
import { RoleRepository } from '../../domain/repositories/RoleRepository';
import { TransportRepository } from '../../domain/repositories/TransportRepository';
import { IUserBranchAccessRepository } from '../../domain/repositories/UserBranchAccessRepository';
import { ClassRepository } from '../../domain/repositories/ClassRepository';
import { SubjectRepository } from '../../domain/repositories/SubjectRepository';
import { UserDomainService } from '../../domain/services/UserDomainService';
import { EmployeeDomainService } from '../../domain/services/EmployeeDomainService';
import { StudentDomainService } from '../../domain/services/StudentDomainService';
import { UserUseCases } from '../../application/use-cases/UserUseCases';
import { EmployeeUseCases } from '../../application/use-cases/EmployeeUseCases';
import { StudentUseCases } from '../../application/use-cases/StudentUseCases';
import { BranchUseCases } from '../../application/use-cases/BranchUseCases';
import { AcademicYearUseCases } from '../../application/use-cases/AcademicYearUseCases';
import { AdvanceUseCases } from '../../application/use-cases/AdvanceUseCases';
import { EmployeeAttendanceUseCases } from '../../application/use-cases/EmployeeAttendanceUseCases';
import { EmployeeLeaveUseCases } from '../../application/use-cases/EmployeeLeaveUseCases';
import { PayrollUseCases } from '../../application/use-cases/PayrollUseCases';
import { RoleUseCases } from '../../application/use-cases/RoleUseCases';
import { TransportUseCases } from '../../application/use-cases/TransportUseCases';
import { UserBranchAccessUseCases } from '../../application/use-cases/UserBranchAccessUseCases';
import { ClassUseCases } from '../../application/use-cases/ClassUseCases';
import { SubjectUseCases } from '../../application/use-cases/SubjectUseCases';
import { ApiClient } from '../api/ApiClient';
import { UserApiRepository } from '../repositories/UserApiRepository';
import { EmployeeApiRepository } from '../repositories/EmployeeApiRepository';
import { StudentApiRepository } from '../repositories/StudentApiRepository';
import { BranchApiRepository } from '../repositories/BranchApiRepository';
import { AcademicYearApiRepository } from '../repositories/AcademicYearApiRepository';
import { AdvanceApiRepository } from '../repositories/AdvanceApiRepository';
import { RoleApiRepository } from '../repositories/RoleApiRepository';
import { EmployeeAttendanceApiRepository } from '../repositories/EmployeeAttendanceApiRepository';
import { EmployeeLeaveApiRepository } from '../repositories/EmployeeLeaveApiRepository';
import { PayrollApiRepository } from '../repositories/PayrollApiRepository';
import { TransportApiRepository } from '../repositories/TransportApiRepository';
import { UserBranchAccessApiRepository } from '../repositories/UserBranchAccessApiRepository';
import { ClassApiRepository } from '../repositories/ClassApiRepository';
import { SubjectApiRepository } from '../repositories/SubjectApiRepository';

export interface ContainerConfig {
  apiBaseUrl: string;
  authToken?: string;
}

export class Container {
  private static instance: Container;
  private config: ContainerConfig;
  private apiClient!: ApiClient;
  private userRepository!: UserRepository;
  private employeeRepository!: EmployeeRepository;
  private studentRepository!: StudentRepository;
  private branchRepository!: BranchRepository;
  private academicYearRepository!: AcademicYearRepository;
  private advanceRepository!: IAdvanceRepository;
  private employeeAttendanceRepository!: EmployeeAttendanceRepository;
  private employeeLeaveRepository!: EmployeeLeaveRepository;
  private payrollRepository!: PayrollRepository;
  private roleRepository!: RoleRepository;
  private transportRepository!: TransportRepository;
  private userBranchAccessRepository!: IUserBranchAccessRepository;
  private classRepository!: ClassRepository;
  private subjectRepository!: SubjectRepository;
  private userDomainService!: UserDomainService;
  private employeeDomainService!: EmployeeDomainService;
  private studentDomainService!: StudentDomainService;
  private userUseCases!: UserUseCases;
  private employeeUseCases!: EmployeeUseCases;
  private studentUseCases!: StudentUseCases;
  private branchUseCases!: BranchUseCases;
  private academicYearUseCases!: AcademicYearUseCases;
  private advanceUseCases!: AdvanceUseCases;
  private employeeAttendanceUseCases!: EmployeeAttendanceUseCases;
  private employeeLeaveUseCases!: EmployeeLeaveUseCases;
  private payrollUseCases!: PayrollUseCases;
  private roleUseCases!: RoleUseCases;
  private transportUseCases!: TransportUseCases;
  private userBranchAccessUseCases!: UserBranchAccessUseCases;
  private classUseCases!: ClassUseCases;
  private subjectUseCases!: SubjectUseCases;
  
  private constructor(config: ContainerConfig) {
    this.config = config;
    this.initializeServices();
  }
  
  static getInstance(config?: ContainerConfig): Container {
    if (!Container.instance) {
      if (!config) {
        throw new Error('Container must be initialized with config on first call');
      }
      Container.instance = new Container(config);
    }
    return Container.instance;
  }
  
  static reset(): void {
    Container.instance = undefined as any;
  }
  
  private initializeServices(): void {
    // Initialize API client
    console.log('🔧 Container: Initializing ApiClient with baseUrl:', this.config.apiBaseUrl);
    this.apiClient = new ApiClient(this.config.apiBaseUrl);
    if (this.config.authToken) {
      this.apiClient.setAuthToken(this.config.authToken);
    }
    console.log('🔧 Container: ApiClient initialized with baseUrl:', this.apiClient['baseUrl']);
    
    // Initialize repositories
    this.userRepository = new UserApiRepository(this.apiClient);
    this.employeeRepository = new EmployeeApiRepository(this.apiClient);
    this.studentRepository = new StudentApiRepository(this.apiClient);
    this.branchRepository = new BranchApiRepository(this.apiClient);
    this.academicYearRepository = new AcademicYearApiRepository(this.apiClient);
    this.advanceRepository = new AdvanceApiRepository(this.apiClient);
    this.roleRepository = new RoleApiRepository(this.apiClient);
    this.employeeAttendanceRepository = new EmployeeAttendanceApiRepository(this.apiClient);
    this.employeeLeaveRepository = new EmployeeLeaveApiRepository(this.apiClient);
    this.payrollRepository = new PayrollApiRepository(this.apiClient);
    this.transportRepository = new TransportApiRepository(this.apiClient);
    this.userBranchAccessRepository = new UserBranchAccessApiRepository(this.apiClient);
    this.classRepository = new ClassApiRepository(this.apiClient);
    this.subjectRepository = new SubjectApiRepository(this.apiClient);
    
    // Initialize domain services
    this.userDomainService = new UserDomainService(this.userRepository);
    this.employeeDomainService = new EmployeeDomainService(this.employeeRepository);
    this.studentDomainService = new StudentDomainService(this.studentRepository);
    
    // Initialize use cases
    this.userUseCases = new UserUseCases(this.userRepository, this.userDomainService);
    this.employeeUseCases = new EmployeeUseCases(this.employeeRepository, this.employeeDomainService);
    this.studentUseCases = new StudentUseCases(this.studentRepository, this.studentDomainService);
    this.branchUseCases = new BranchUseCases(this.branchRepository);
    this.academicYearUseCases = new AcademicYearUseCases(this.academicYearRepository);
    this.advanceUseCases = new AdvanceUseCases(this.advanceRepository);
    this.roleUseCases = new RoleUseCases(this.roleRepository);
    this.employeeAttendanceUseCases = new EmployeeAttendanceUseCases(this.employeeAttendanceRepository);
    this.employeeLeaveUseCases = new EmployeeLeaveUseCases(this.employeeLeaveRepository);
    this.payrollUseCases = new PayrollUseCases(this.payrollRepository);
    this.transportUseCases = new TransportUseCases(this.transportRepository);
    this.userBranchAccessUseCases = new UserBranchAccessUseCases(this.userBranchAccessRepository);
    this.classUseCases = new ClassUseCases(this.classRepository);
    this.subjectUseCases = new SubjectUseCases(this.subjectRepository);
  }
  
  // Getters for repositories
  getUserRepository(): UserRepository {
    return this.userRepository;
  }
  
  getEmployeeRepository(): EmployeeRepository {
    return this.employeeRepository;
  }
  
  getStudentRepository(): StudentRepository {
    return this.studentRepository;
  }
  
  getBranchRepository(): BranchRepository {
    return this.branchRepository;
  }
  
  getAcademicYearRepository(): AcademicYearRepository {
    return this.academicYearRepository;
  }
  
  // Getters for domain services
  getUserDomainService(): UserDomainService {
    return this.userDomainService;
  }
  
  getEmployeeDomainService(): EmployeeDomainService {
    return this.employeeDomainService;
  }
  
  getStudentDomainService(): StudentDomainService {
    return this.studentDomainService;
  }
  
  // Getters for use cases
  getUserUseCases(): UserUseCases {
    return this.userUseCases;
  }
  
  getEmployeeUseCases(): EmployeeUseCases {
    return this.employeeUseCases;
  }
  
  getStudentUseCases(): StudentUseCases {
    return this.studentUseCases;
  }
  
  getBranchUseCases(): BranchUseCases {
    return this.branchUseCases;
  }
  
  getAcademicYearUseCases(): AcademicYearUseCases {
    return this.academicYearUseCases;
  }
  
  getAdvanceUseCases(): AdvanceUseCases {
    return this.advanceUseCases;
  }
  
  getRoleUseCases(): RoleUseCases {
    return this.roleUseCases;
  }
  
  getEmployeeAttendanceUseCases(): EmployeeAttendanceUseCases {
    return this.employeeAttendanceUseCases;
  }
  
  getEmployeeLeaveUseCases(): EmployeeLeaveUseCases {
    return this.employeeLeaveUseCases;
  }
  
  getPayrollUseCases(): PayrollUseCases {
    return this.payrollUseCases;
  }
  
  getTransportUseCases(): TransportUseCases {
    return this.transportUseCases;
  }
  
  getUserBranchAccessUseCases(): UserBranchAccessUseCases {
    return this.userBranchAccessUseCases;
  }
  
  getClassUseCases(): ClassUseCases {
    return this.classUseCases;
  }
  
  getSubjectUseCases(): SubjectUseCases {
    return this.subjectUseCases;
  }
  
  // API client management
  getApiClient(): ApiClient {
    return this.apiClient;
  }
  
  setAuthToken(token: string): void {
    console.log('Container: Setting auth token in ApiClient:', token.substring(0, 20) + '...');
    this.apiClient.setAuthToken(token);
    console.log('Container: Auth token set successfully');
  }
  
  removeAuthToken(): void {
    this.apiClient.removeAuthToken();
  }
  
  updateConfig(config: Partial<ContainerConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.apiBaseUrl) {
      this.apiClient.setBaseUrl(config.apiBaseUrl);
    }
    if (config.authToken !== undefined) {
      if (config.authToken) {
        this.apiClient.setAuthToken(config.authToken);
      } else {
        this.apiClient.removeAuthToken();
      }
    }
  }
  
  getConfig(): ContainerConfig {
    return { ...this.config };
  }
}
