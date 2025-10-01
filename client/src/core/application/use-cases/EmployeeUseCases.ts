import { EmployeeEntity, EmployeeId, EmployeeStatus } from '../../domain/entities/Employee';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository';
import { EmployeeDomainService } from '../../domain/services/EmployeeDomainService';
import { 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest, 
  EmployeeResponse, 
  EmployeeListResponse, 
  EmployeeStatisticsResponse 
} from '../dto/EmployeeDto';

export class EmployeeUseCases {
  constructor(
    private employeeRepository: EmployeeRepository,
    private employeeDomainService: EmployeeDomainService
  ) {}
  
  async createEmployee(request: CreateEmployeeRequest): Promise<EmployeeResponse> {
    try {
      const employee = await this.employeeDomainService.createEmployee(request);
      return this.mapToResponse(employee);
    } catch (error) {
      throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateEmployee(employeeId: number, request: UpdateEmployeeRequest): Promise<EmployeeResponse> {
    try {
      const employee = await this.employeeDomainService.updateEmployee(new EmployeeId(employeeId), request);
      return this.mapToResponse(employee);
    } catch (error) {
      throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateEmployeeStatus(employeeId: number, status: EmployeeStatus): Promise<EmployeeResponse> {
    try {
      const employee = await this.employeeDomainService.updateEmployeeStatus(new EmployeeId(employeeId), status);
      return this.mapToResponse(employee);
    } catch (error) {
      throw new Error(`Failed to update employee status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async deleteEmployee(employeeId: number): Promise<void> {
    try {
      await this.employeeDomainService.deleteEmployee(new EmployeeId(employeeId));
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getEmployeeById(employeeId: number): Promise<EmployeeResponse> {
    try {
      const employee = await this.employeeRepository.findById(new EmployeeId(employeeId));
      if (!employee) {
        throw new Error('Employee not found');
      }
      return this.mapToResponse(employee);
    } catch (error) {
      throw new Error(`Failed to get employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllEmployees(): Promise<EmployeeResponse[]> {
    try {
      console.log('🔍 EmployeeUseCases.getAllEmployees: Starting to fetch employees...');
      // Prefer branch-scoped employees if supported by repository
      const repoAny = this.employeeRepository as any;
      const employees: EmployeeEntity[] = typeof repoAny.findAllByBranch === 'function'
        ? await repoAny.findAllByBranch()
        : await this.employeeRepository.findAll();
      console.log('🔍 EmployeeUseCases.getAllEmployees: Got entities:', employees.length, 'employees');
      
      const mappedResponses = employees.map((employee: EmployeeEntity) => this.mapToResponse(employee));
      console.log('🔍 EmployeeUseCases.getAllEmployees: Mapped responses:', mappedResponses.length, 'employees');
      return mappedResponses;
    } catch (error) {
      console.error('❌ EmployeeUseCases.getAllEmployees: Error fetching employees:', error);
      throw new Error(`Failed to get employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getEmployeesByDepartment(department: string): Promise<EmployeeResponse[]> {
    try {
      const employees = await this.employeeDomainService.getEmployeesByDepartment(department);
      return employees.map((employee: EmployeeEntity) => this.mapToResponse(employee));
    } catch (error) {
      throw new Error(`Failed to get employees by department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getActiveEmployees(): Promise<EmployeeResponse[]> {
    try {
      const employees = await this.employeeDomainService.getActiveEmployees();
      return employees.map((employee: EmployeeEntity) => this.mapToResponse(employee));
    } catch (error) {
      throw new Error(`Failed to get active employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getEmployeeStatistics(): Promise<EmployeeStatisticsResponse> {
    try {
      const stats = await this.employeeDomainService.getEmployeeStatistics();
      return {
        totalEmployees: stats.totalEmployees,
        activeEmployees: stats.activeEmployees,
        inactiveEmployees: stats.inactiveEmployees,
        terminatedEmployees: stats.terminatedEmployees,
        employeesByDepartment: stats.employeesByDepartment,
        employeesByStatus: stats.employeesByStatus,
      };
    } catch (error) {
      throw new Error(`Failed to get employee statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async searchEmployees(query: string): Promise<EmployeeResponse[]> {
    try {
      const allEmployees = await this.employeeRepository.findAll();
      const filteredEmployees = allEmployees.filter((employee: EmployeeEntity) => 
        employee.fullName.toLowerCase().includes(query.toLowerCase()) ||
        employee.email.getValue().toLowerCase().includes(query.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(query.toLowerCase()) ||
        employee.department.toLowerCase().includes(query.toLowerCase()) ||
        employee.position.toLowerCase().includes(query.toLowerCase())
      );
      return filteredEmployees.map((employee: EmployeeEntity) => this.mapToResponse(employee));
    } catch (error) {
      throw new Error(`Failed to search employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private mapToResponse(employee: EmployeeEntity): EmployeeResponse {
    return {
      id: employee.id.getValue(),
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email.getValue(),
      phoneNumber: employee.phoneNumber,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      status: employee.status,
      hireDate: employee.hireDate.toISOString(),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    };
  }
}
