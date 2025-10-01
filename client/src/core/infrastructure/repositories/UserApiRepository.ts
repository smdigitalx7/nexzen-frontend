import { UserEntity, UserId, Email, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { ApiClient } from '../api/ApiClient';
import { UserResponse } from '../../application/dto/UserDto';

export class UserApiRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findById(id: UserId): Promise<UserEntity | null> {
    try {
      const response = await this.apiClient.get<UserResponse>(`/users/${id.getValue()}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async findAll(): Promise<UserEntity[]> {
    try {
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      return response.data.map(user => this.mapToEntity(user));
    } catch (error) {
      throw error;
    }
  }
  
  async findAllWithRolesAndBranches(): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>('/users/roles-and-branches');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async findByEmail(email: Email): Promise<UserEntity | null> {
    try {
      // Since backend doesn't have email endpoint, get all users and filter
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      const user = response.data.find(u => u.email === email.getValue());
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async findByRole(role: UserRole): Promise<UserEntity[]> {
    try {
      // Since backend doesn't have role endpoint, get all users and filter
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      const users = response.data.filter(u => 
        (role === UserRole.INSTITUTE_ADMIN && u.is_institute_admin) ||
        (role === UserRole.ACADEMIC && !u.is_institute_admin)
      );
      return users.map(user => this.mapToEntity(user));
    } catch (error) {
      throw error;
    }
  }
  
  async findByActiveStatus(isActive: boolean): Promise<UserEntity[]> {
    try {
      // Since backend doesn't have status endpoint, get all users and filter
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      const users = response.data.filter(u => u.is_active === isActive);
      return users.map(user => this.mapToEntity(user));
    } catch (error) {
      throw error;
    }
  }
  
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const response = await this.apiClient.post<UserResponse>('/users/', this.mapToRequest(user));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async update(user: UserEntity): Promise<UserEntity> {
    try {
      const response = await this.apiClient.put<UserResponse>(`/users/${user.id.getValue()}`, this.mapToUpdateRequest(user));
      return this.mapToEntity(response.data);
    } catch (error) {
      throw error;
    }
  }
  
  async delete(id: UserId): Promise<void> {
    try {
      await this.apiClient.delete(`/users/${id.getValue()}`);
    } catch (error) {
      throw error;
    }
  }
  
  async exists(id: UserId): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }
  
  async count(): Promise<number> {
    try {
      // Since backend doesn't have count endpoint, get all users and count
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      return response.data.length;
    } catch (error) {
      throw error;
    }
  }
  
  async countByRole(role: UserRole): Promise<number> {
    try {
      // Since backend doesn't have count by role endpoint, get all users and filter
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      const users = response.data.filter(u => 
        (role === UserRole.INSTITUTE_ADMIN && u.is_institute_admin) ||
        (role === UserRole.ACADEMIC && !u.is_institute_admin)
      );
      return users.length;
    } catch (error) {
      throw error;
    }
  }
  
  async countActiveUsers(): Promise<number> {
    try {
      // Since backend doesn't have count active endpoint, get all users and filter
      const response = await this.apiClient.get<UserResponse[]>('/users/');
      const activeUsers = response.data.filter(u => u.is_active === true);
      return activeUsers.length;
    } catch (error) {
      throw error;
    }
  }
  
  private mapToEntity(response: UserResponse): UserEntity {
    return UserEntity.create(
      response.user_id,
      response.full_name,
      response.email,
      response.is_institute_admin ? UserRole.INSTITUTE_ADMIN : UserRole.ACADEMIC, // Map based on is_institute_admin
      response.is_active
    );
  }
  
  private mapToRequest(user: UserEntity): any {
    return {
      full_name: user.fullName,
      email: user.email.getValue(),
      is_institute_admin: user.role === UserRole.INSTITUTE_ADMIN,
      password: '', // Not included in entity
      confirm_password: ''
    };
  }
  
  private mapToUpdateRequest(user: UserEntity): any {
    return {
      full_name: user.fullName,
      email: user.email.getValue(),
      is_institute_admin: user.role === UserRole.INSTITUTE_ADMIN,
      is_active: user.isActive
    };
  }
}
