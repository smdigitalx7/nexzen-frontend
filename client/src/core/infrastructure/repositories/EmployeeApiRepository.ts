import { EmployeeEntity, EmployeeId, EmployeeStatus } from '../../domain/entities/Employee';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository';
import { ApiClient } from '../api/ApiClient';
import { EmployeeResponse } from '../../application/dto/EmployeeDto';
import { Email } from '../../domain/entities/User';

export class EmployeeApiRepository implements EmployeeRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findById(id: EmployeeId): Promise<EmployeeEntity | null> {
    try {
      const response = await this.apiClient.get<EmployeeResponse>(`/employees/${id.getValue()}/`);
      return this.mapToEntity(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async findAll(): Promise<EmployeeEntity[]> {
    try {
      console.log('🔍 EmployeeApiRepository.findAll: Starting to fetch employees from API...');
      console.log('🔍 EmployeeApiRepository.findAll: Using endpoint: /employees/with-branches');
      const response = await this.apiClient.get<any[]>('/employees/with-branches');
      console.log('🔍 EmployeeApiRepository.findAll: Got response:', response.data.length, 'employees');
      console.log('🔍 EmployeeApiRepository.findAll: Response data:', response.data);
      
      const mappedEmployees = response.data.map(employee => this.mapToEntity(employee));
      console.log('🔍 EmployeeApiRepository.findAll: Mapped entities:', mappedEmployees.length, 'employees');
      return mappedEmployees;
    } catch (error) {
      console.error('❌ EmployeeApiRepository.findAll: Error fetching employees:', error);
      throw error;
    }
  }

  async findAllByBranch(): Promise<EmployeeEntity[]> {
    try {
      console.log('🔍 EmployeeApiRepository.findAllByBranch: Using endpoint: /employees/branch');
      const response = await this.apiClient.get<any[]>('/employees/branch');
      return response.data.map(employee => this.mapToEntity(employee));
    } catch (error) {
      console.error('❌ EmployeeApiRepository.findAllByBranch: Error fetching branch employees:', error);
      throw error;
    }
  }
  
  async findByStatus(status: EmployeeStatus): Promise<EmployeeEntity[]> {
    try {
      const response = await this.apiClient.get<EmployeeResponse[]>(`/employees/status/${status}/`);
      return response.data.map(employee => this.mapToEntity(employee));
    } catch (error) {
      throw error;
    }
  }
  
  async findByDepartment(department: string): Promise<EmployeeEntity[]> {
    try {
      const response = await this.apiClient.get<EmployeeResponse[]>(`/employees/department/${encodeURIComponent(department)}/`);
      return response.data.map(employee => this.mapToEntity(employee));
    } catch (error) {
      throw error;
    }
  }
  
  async findByPosition(position: string): Promise<EmployeeEntity[]> {
    try {
      const response = await this.apiClient.get<EmployeeResponse[]>(`/employees/position/${encodeURIComponent(position)}/`);
      return response.data.map(employee => this.mapToEntity(employee));
    } catch (error) {
      throw error;
    }
  }
  
  async findActiveEmployees(): Promise<EmployeeEntity[]> {
    try {
      const response = await this.apiClient.get<EmployeeResponse[]>('/employees/active/');
      return response.data.map(employee => this.mapToEntity(employee));
    } catch (error) {
      throw error;
    }
  }
  
  async save(employee: EmployeeEntity): Promise<EmployeeEntity> {
    try {
      const response = await this.apiClient.post<EmployeeResponse>('/employees/', this.mapToRequest(employee));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async update(employee: EmployeeEntity): Promise<EmployeeEntity> {
    try {
      const response = await this.apiClient.put<EmployeeResponse>(`/employees/${employee.id.getValue()}/`, this.mapToUpdateRequest(employee));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async delete(id: EmployeeId): Promise<void> {
    try {
      await this.apiClient.delete(`/employees/${id.getValue()}/`);
    } catch (error) {
      throw error;
    }
  }
  
  async exists(id: EmployeeId): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }
  
  async count(): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>('/employees/count/');
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  async countByStatus(status: EmployeeStatus): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>(`/employees/count/status/${status}/`);
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  async countByDepartment(department: string): Promise<number> {
    try {
      const response = await this.apiClient.get<{ count: number }>(`/employees/count/department/${encodeURIComponent(department)}/`);
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
  
  private mapToEntity(apiData: any): EmployeeEntity {
    console.log('🔍 EmployeeApiRepository.mapToEntity: Mapping API data:', {
      employee_id: apiData.employee_id,
      employee_name: apiData.employee_name,
      employee_code: apiData.employee_code,
      email: apiData.email,
      email_type: typeof apiData.email,
      email_length: apiData.email?.length,
      designation: apiData.designation,
      salary: apiData.salary,
      status: apiData.status,
      date_of_joining: apiData.date_of_joining
    });
    
    try {
      // Map status from backend to frontend enum
      let status: EmployeeStatus;
      switch (apiData.status?.toLowerCase()) {
        case 'active':
          status = EmployeeStatus.ACTIVE;
          break;
        case 'inactive':
          status = EmployeeStatus.INACTIVE;
          break;
        case 'terminated':
          status = EmployeeStatus.TERMINATED;
          break;
        case 'on_leave':
          status = EmployeeStatus.ON_LEAVE;
          break;
        default:
          status = EmployeeStatus.ACTIVE;
      }

      // Validate and handle email
      let email: Email;
      try {
        // Clean and validate email
        const emailValue = apiData.email;
        console.log('🔍 Email validation:', { 
          original: emailValue, 
          type: typeof emailValue, 
          isNull: emailValue === null,
          isUndefined: emailValue === undefined,
          isEmpty: emailValue === '',
          trimmed: emailValue?.trim()
        });
        
        if (emailValue && typeof emailValue === 'string' && emailValue.trim() !== '') {
          email = new Email(emailValue.trim());
        } else {
          // Use a default valid email if none provided or invalid
          console.log('🔍 Using default email for employee:', apiData.employee_name);
          email = new Email('no-email@example.com');
        }
      } catch (error) {
        console.warn('⚠️ Invalid email format, using default:', { 
          original: apiData.email, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        email = new Email('no-email@example.com');
      }

      // Create entity with proper constructor instead of static create
      const entity = new EmployeeEntity(
        new EmployeeId(apiData.employee_id),
        apiData.employee_code,
        apiData.employee_name,
        email,
        apiData.mobile_no || undefined,
        apiData.designation, // department
        apiData.designation, // position
        apiData.salary,
        status,
        new Date(apiData.date_of_joining),
        new Date(apiData.created_at),
        new Date(apiData.updated_at || apiData.created_at)
      );
      
      console.log('🔍 EmployeeApiRepository.mapToEntity: Created entity:', {
        id: entity.id.getValue(),
        employeeId: entity.employeeId,
        fullName: entity.fullName,
        status: entity.status
      });
      
      return entity;
    } catch (error) {
      console.error('❌ EmployeeApiRepository.mapToEntity: Error creating entity:', error);
      throw error;
    }
  }
  
  private mapToRequest(employee: EmployeeEntity): any {
    return {
      employee_name: employee.fullName,
      employee_type: 'PERMANENT', // Default type
      employee_code: employee.employeeId,
      email: employee.email.getValue(),
      designation: employee.position, // Using position as designation
      salary: employee.salary,
      mobile_no: employee.phoneNumber,
      status: 'ACTIVE' // Default status
    };
  }
  
  private mapToUpdateRequest(employee: EmployeeEntity): any {
    return {
      employee_name: employee.fullName,
      email: employee.email.getValue(),
      designation: employee.position, // Using position as designation
      salary: employee.salary,
      mobile_no: employee.phoneNumber,
      status: employee.status
    };
  }
}
