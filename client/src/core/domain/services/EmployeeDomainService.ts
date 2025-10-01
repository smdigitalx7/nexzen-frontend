import { EmployeeEntity, EmployeeId, EmployeeStatus } from '../entities/Employee';
import { EmployeeRepository } from '../repositories/EmployeeRepository';

export interface CreateEmployeeRequest {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  phoneNumber?: string;
}

export class EmployeeDomainService {
  constructor(private employeeRepository: EmployeeRepository) {}
  
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<EmployeeEntity> {
    // Validate email uniqueness
    const existingEmployee = await this.employeeRepository.findAll();
    const emailExists = existingEmployee.some(emp => emp.email.getValue() === employeeData.email);
    if (emailExists) {
      throw new Error('Employee with this email already exists');
    }
    
    // Validate employee ID uniqueness
    const employeeIdExists = existingEmployee.some(emp => emp.employeeId === employeeData.employeeId);
    if (employeeIdExists) {
      throw new Error('Employee with this ID already exists');
    }
    
    // Validate salary
    if (employeeData.salary <= 0) {
      throw new Error('Salary must be greater than 0');
    }
    
    // Create new employee entity
    const employee = EmployeeEntity.create(
      0, // Will be assigned by repository
      employeeData.employeeId,
      employeeData.fullName,
      employeeData.email,
      employeeData.department,
      employeeData.position,
      employeeData.salary,
      employeeData.phoneNumber
    );
    
    return this.employeeRepository.save(employee);
  }
  
  async updateEmployee(employeeId: EmployeeId, updateData: Partial<CreateEmployeeRequest>): Promise<EmployeeEntity> {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    let updatedEmployee = employee;
    
    // Update personal info if provided
    if (updateData.fullName || updateData.phoneNumber !== undefined) {
      updatedEmployee = updatedEmployee.updatePersonalInfo(
        updateData.fullName || employee.fullName,
        updateData.phoneNumber
      );
    }
    
    // Update work info if provided
    if (updateData.department || updateData.position || updateData.salary) {
      updatedEmployee = updatedEmployee.updateWorkInfo(
        updateData.department || employee.department,
        updateData.position || employee.position,
        updateData.salary || employee.salary
      );
    }
    
    return this.employeeRepository.update(updatedEmployee);
  }
  
  async updateEmployeeStatus(employeeId: EmployeeId, status: EmployeeStatus): Promise<EmployeeEntity> {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    let updatedEmployee: EmployeeEntity;
    
    switch (status) {
      case EmployeeStatus.ACTIVE:
        updatedEmployee = employee.activate();
        break;
      case EmployeeStatus.INACTIVE:
        updatedEmployee = employee.deactivate();
        break;
      case EmployeeStatus.TERMINATED:
        updatedEmployee = employee.terminate();
        break;
      case EmployeeStatus.ON_LEAVE:
        updatedEmployee = employee.deactivate(); // For now, treat as inactive
        break;
      default:
        throw new Error('Invalid employee status');
    }
    
    return this.employeeRepository.update(updatedEmployee);
  }
  
  async deleteEmployee(employeeId: EmployeeId): Promise<void> {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Business rule: Cannot delete active employees
    if (employee.isActive()) {
      throw new Error('Cannot delete active employee. Please deactivate or terminate first.');
    }
    
    await this.employeeRepository.delete(employeeId);
  }
  
  async getEmployeeStatistics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    terminatedEmployees: number;
    employeesByDepartment: Record<string, number>;
    employeesByStatus: Record<EmployeeStatus, number>;
  }> {
    const allEmployees = await this.employeeRepository.findAll();
    const activeEmployees = allEmployees.filter(emp => emp.isActive());
    const inactiveEmployees = allEmployees.filter(emp => emp.status === EmployeeStatus.INACTIVE);
    const terminatedEmployees = allEmployees.filter(emp => emp.isTerminated());
    
    const employeesByDepartment: Record<string, number> = {};
    const employeesByStatus: Record<EmployeeStatus, number> = {
      [EmployeeStatus.ACTIVE]: 0,
      [EmployeeStatus.INACTIVE]: 0,
      [EmployeeStatus.TERMINATED]: 0,
      [EmployeeStatus.ON_LEAVE]: 0,
    };
    
    allEmployees.forEach(emp => {
      // Count by department
      employeesByDepartment[emp.department] = (employeesByDepartment[emp.department] || 0) + 1;
      
      // Count by status
      employeesByStatus[emp.status] = (employeesByStatus[emp.status] || 0) + 1;
    });
    
    return {
      totalEmployees: allEmployees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: inactiveEmployees.length,
      terminatedEmployees: terminatedEmployees.length,
      employeesByDepartment,
      employeesByStatus,
    };
  }
  
  async getEmployeesByDepartment(department: string): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findByDepartment(department);
  }
  
  async getActiveEmployees(): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findActiveEmployees();
  }
}
