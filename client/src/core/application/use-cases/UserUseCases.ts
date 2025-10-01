import { UserEntity, UserId, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserDomainService } from '../../domain/services/UserDomainService';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserResponse, 
  UserListResponse, 
  UserStatisticsResponse 
} from '../dto/UserDto';

export class UserUseCases {
  constructor(
    private userRepository: UserRepository,
    private userDomainService: UserDomainService
  ) {}
  
  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userDomainService.createUser(request);
      return this.mapToResponse(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateUser(userId: number, request: UpdateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userDomainService.updateUser(new UserId(userId), request);
      return this.mapToResponse(user);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async updateUserStatus(userId: number, isActive: boolean): Promise<UserResponse> {
    try {
      const user = await this.userDomainService.updateUserStatus(new UserId(userId), isActive);
      return this.mapToResponse(user);
    } catch (error) {
      throw new Error(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async deleteUser(userId: number): Promise<void> {
    try {
      await this.userDomainService.deleteUser(new UserId(userId));
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getUserById(userId: number): Promise<UserResponse> {
    try {
      const user = await this.userRepository.findById(new UserId(userId));
      if (!user) {
        throw new Error('User not found');
      }
      return this.mapToResponse(user);
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const users = await this.userRepository.findAll();
      return users.map(user => this.mapToResponse(user));
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllUsersWithRolesAndBranches(): Promise<any[]> {
    try {
      const users = await this.userRepository.findAllWithRolesAndBranches();
      return users;
    } catch (error) {
      throw new Error(`Failed to get users with roles and branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getUsersByRole(role: UserRole): Promise<UserResponse[]> {
    try {
      const users = await this.userRepository.findByRole(role);
      return users.map(user => this.mapToResponse(user));
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getActiveUsers(): Promise<UserResponse[]> {
    try {
      const users = await this.userRepository.findByActiveStatus(true);
      return users.map(user => this.mapToResponse(user));
    } catch (error) {
      throw new Error(`Failed to get active users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getUserStatistics(): Promise<UserStatisticsResponse> {
    try {
      const stats = await this.userDomainService.getUserStatistics();
      return {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        usersByRole: stats.usersByRole,
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async searchUsers(query: string): Promise<UserResponse[]> {
    try {
      const allUsers = await this.userRepository.findAll();
      const filteredUsers = allUsers.filter(user => 
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.getValue().toLowerCase().includes(query.toLowerCase())
      );
      return filteredUsers.map(user => this.mapToResponse(user));
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private mapToResponse(user: UserEntity): UserResponse {
    return {
      user_id: user.id.getValue(),
      full_name: user.fullName,
      email: user.email.getValue(),
      mobile_no: null, // Not available in User entity
      is_institute_admin: user.role === UserRole.INSTITUTE_ADMIN,
      is_active: user.isActive,
      institute_id: 1, // Default value
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      created_by: null, // Not available in User entity
      updated_by: null, // Not available in User entity
    };
  }
}
