import { UserEntity, UserId, Email, UserRole } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserRequest } from '../../application/dto/UserDto';

export class UserDomainService {
  constructor(private userRepository: UserRepository) {}
  
  async createUser(userData: CreateUserRequest): Promise<UserEntity> {
    // Validate email uniqueness
    const existingUser = await this.userRepository.findByEmail(new Email(userData.email));
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    // Validate password strength
    if (!this.isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }
    
    // Create new user entity
    const user = UserEntity.create(
      0, // Will be assigned by repository
      userData.fullName,
      userData.email,
      userData.role,
      true // Active by default
    );
    
    return this.userRepository.save(user);
  }
  
  async updateUserStatus(userId: UserId, isActive: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Business rule: Cannot deactivate institute admin if it's the only one
    if (!isActive && user.isInstituteAdmin()) {
      const adminUsers = await this.userRepository.findByRole(UserRole.INSTITUTE_ADMIN);
      const activeAdmins = adminUsers.filter(u => u.isActive);
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot deactivate the only institute admin');
      }
    }
    
    const updatedUser = isActive ? user.activate() : user.deactivate();
    return this.userRepository.update(updatedUser);
  }
  
  async updateUser(userId: UserId, updateData: Partial<CreateUserRequest>): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let updatedUser = user;
    
    // Update full name if provided
    if (updateData.fullName && updateData.fullName !== user.fullName) {
      updatedUser = updatedUser.updateFullName(updateData.fullName);
    }
    
    // Update email if provided
    if (updateData.email && updateData.email !== user.email.getValue()) {
      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findByEmail(new Email(updateData.email));
      if (existingUser && !existingUser.id.equals(userId)) {
        throw new Error('Email is already taken by another user');
      }
      updatedUser = updatedUser.updateEmail(updateData.email);
    }
    
    // Update role if provided
    if (updateData.role && updateData.role !== user.role) {
      // Business rule: Cannot change role of the only institute admin
      if (user.isInstituteAdmin()) {
        const adminUsers = await this.userRepository.findByRole(UserRole.INSTITUTE_ADMIN);
        const activeAdmins = adminUsers.filter(u => u.isActive);
        if (activeAdmins.length <= 1) {
          throw new Error('Cannot change role of the only institute admin');
        }
      }
      updatedUser = updatedUser.updateRole(updateData.role);
    }
    
    return this.userRepository.update(updatedUser);
  }
  
  async deleteUser(userId: UserId): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Business rule: Cannot delete institute admin if it's the only one
    if (user.isInstituteAdmin()) {
      const adminUsers = await this.userRepository.findByRole(UserRole.INSTITUTE_ADMIN);
      const activeAdmins = adminUsers.filter(u => u.isActive);
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot delete the only institute admin');
      }
    }
    
    await this.userRepository.delete(userId);
  }
  
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    const allUsers = await this.userRepository.findAll();
    const activeUsers = allUsers.filter(u => u.isActive);
    const inactiveUsers = allUsers.filter(u => !u.isActive);
    
    const usersByRole = {
      [UserRole.INSTITUTE_ADMIN]: allUsers.filter(u => u.role === UserRole.INSTITUTE_ADMIN).length,
      [UserRole.ACADEMIC]: allUsers.filter(u => u.role === UserRole.ACADEMIC).length,
      [UserRole.ACCOUNTANT]: allUsers.filter(u => u.role === UserRole.ACCOUNTANT).length,
    };
    
    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      usersByRole,
    };
  }
  
  private isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}
