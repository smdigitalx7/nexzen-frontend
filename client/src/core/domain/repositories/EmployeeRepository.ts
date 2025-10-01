import { EmployeeEntity, EmployeeId, EmployeeStatus } from '../entities/Employee';

export interface EmployeeRepository {
  findById(id: EmployeeId): Promise<EmployeeEntity | null>;
  findAll(): Promise<EmployeeEntity[]>;
  findAllByBranch(): Promise<EmployeeEntity[]>;
  findByStatus(status: EmployeeStatus): Promise<EmployeeEntity[]>;
  findByDepartment(department: string): Promise<EmployeeEntity[]>;
  findByPosition(position: string): Promise<EmployeeEntity[]>;
  findActiveEmployees(): Promise<EmployeeEntity[]>;
  save(employee: EmployeeEntity): Promise<EmployeeEntity>;
  update(employee: EmployeeEntity): Promise<EmployeeEntity>;
  delete(id: EmployeeId): Promise<void>;
  exists(id: EmployeeId): Promise<boolean>;
  count(): Promise<number>;
  countByStatus(status: EmployeeStatus): Promise<number>;
  countByDepartment(department: string): Promise<number>;
}
