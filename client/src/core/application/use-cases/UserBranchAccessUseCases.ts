import { IUserBranchAccessRepository } from '../../domain/repositories/UserBranchAccessRepository';
import { UserBranchAccessEntity } from '../../domain/entities/UserBranchAccess';
import { UserBranchAccessId } from '../../domain/value-objects/UserBranchAccessId';
import { 
  CreateUserBranchAccessRequest, 
  UpdateUserBranchAccessRequest, 
  UserBranchAccessResponse,
  RevokeUserBranchAccessRequest 
} from '../dto/UserBranchAccessDto';

export class UserBranchAccessUseCases {
  constructor(private userBranchAccessRepository: IUserBranchAccessRepository) {}

  async getAllUserBranchAccesses(): Promise<UserBranchAccessResponse[]> {
    const userBranchAccesses = await this.userBranchAccessRepository.findAll();
    return userBranchAccesses.map(this.mapToResponse);
  }

  async getUserBranchAccessById(id: number): Promise<UserBranchAccessResponse | null> {
    const userBranchAccess = await this.userBranchAccessRepository.findById(new UserBranchAccessId(id));
    return userBranchAccess ? this.mapToResponse(userBranchAccess) : null;
  }

  async getUserBranchAccessesByUserId(userId: number): Promise<UserBranchAccessResponse[]> {
    const userBranchAccesses = await this.userBranchAccessRepository.findByUserId(userId);
    return userBranchAccesses.map(this.mapToResponse);
  }

  async getUserBranchAccessesByBranchId(branchId: number): Promise<UserBranchAccessResponse[]> {
    const userBranchAccesses = await this.userBranchAccessRepository.findByBranchId(branchId);
    return userBranchAccesses.map(this.mapToResponse);
  }

  async createUserBranchAccess(request: CreateUserBranchAccessRequest): Promise<UserBranchAccessResponse> {
    const userBranchAccess = UserBranchAccessEntity.create(
      request.userId,
      request.branchId,
      request.roleId,
      request.isDefault ?? false,
      request.isActive ?? true
    );
    
    const savedUserBranchAccess = await this.userBranchAccessRepository.save(userBranchAccess);
    return this.mapToResponse(savedUserBranchAccess);
  }

  async updateUserBranchAccess(request: UpdateUserBranchAccessRequest): Promise<UserBranchAccessResponse> {
    const existingUserBranchAccess = await this.userBranchAccessRepository.findById(new UserBranchAccessId(request.id));
    if (!existingUserBranchAccess) {
      throw new Error('User branch access not found');
    }

    const updatedUserBranchAccess = existingUserBranchAccess.update(
      request.roleId,
      request.isDefault,
      request.isActive
    );

    const savedUserBranchAccess = await this.userBranchAccessRepository.update(updatedUserBranchAccess);
    return this.mapToResponse(savedUserBranchAccess);
  }

  async revokeUserBranchAccess(request: RevokeUserBranchAccessRequest): Promise<UserBranchAccessResponse> {
    const existingUserBranchAccess = await this.userBranchAccessRepository.findById(new UserBranchAccessId(request.id));
    if (!existingUserBranchAccess) {
      throw new Error('User branch access not found');
    }

    const revokedUserBranchAccess = existingUserBranchAccess.revoke();
    const savedUserBranchAccess = await this.userBranchAccessRepository.update(revokedUserBranchAccess);
    return this.mapToResponse(savedUserBranchAccess);
  }

  async deleteUserBranchAccess(id: number): Promise<void> {
    await this.userBranchAccessRepository.delete(new UserBranchAccessId(id));
  }

  private mapToResponse(userBranchAccess: UserBranchAccessEntity): UserBranchAccessResponse {
    return {
      id: userBranchAccess.id.getValue(),
      userId: userBranchAccess.userId,
      branchId: userBranchAccess.branchId,
      roleId: userBranchAccess.roleId,
      isDefault: userBranchAccess.isDefault,
      isActive: userBranchAccess.isActive,
      createdAt: userBranchAccess.createdAt,
      updatedAt: userBranchAccess.updatedAt,
    };
  }
}
