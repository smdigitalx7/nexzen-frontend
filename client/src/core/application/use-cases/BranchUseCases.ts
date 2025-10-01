import { BranchRepository } from '../../domain/repositories/BranchRepository';
import { BranchEntity } from '../../domain/entities/Branch';
import { BranchId } from '../../domain/value-objects/BranchId';
import { CreateBranchRequest, UpdateBranchRequest, BranchResponse } from '../dto/BranchDto';

export class BranchUseCases {
  constructor(private branchRepository: BranchRepository) {}

  async getAllBranches(): Promise<BranchResponse[]> {
    const branches = await this.branchRepository.findAll();
    return branches.map(this.mapToResponse);
  }

  async getBranchById(id: number): Promise<BranchResponse | null> {
    const branchEntity = await this.branchRepository.findById(new BranchId(id));
    return branchEntity ? this.mapToResponse(branchEntity) : null;
  }

  async getActiveBranches(): Promise<BranchResponse[]> {
    const branches = await this.branchRepository.findActiveBranches();
    return branches.map(this.mapToResponse);
  }

  async getBranchesByType(branchType: string): Promise<BranchResponse[]> {
    const branches = await this.branchRepository.findByType(branchType);
    return branches.map(this.mapToResponse);
  }

  async createBranch(request: CreateBranchRequest): Promise<BranchResponse> {
    const branchEntity = new BranchEntity(
      new BranchId(0), // Will be set by repository
      request.name,
      request.code,
      request.address || null,
      request.phone || null,
      request.email || null,
      request.branchType,
      true,
      new Date(),
      new Date()
    );

    const savedBranch = await this.branchRepository.save(branchEntity);
    return this.mapToResponse(savedBranch);
  }

  async updateBranch(request: UpdateBranchRequest): Promise<BranchResponse> {
    const existingBranch = await this.branchRepository.findById(new BranchId(request.id));
    if (!existingBranch) {
      throw new Error('Branch not found');
    }

    let updatedBranch = existingBranch;

    if (request.name !== undefined) {
      updatedBranch = updatedBranch.updateName(request.name);
    }

    if (request.code !== undefined) {
      updatedBranch = updatedBranch.updateCode(request.code);
    }

    if (request.address !== undefined) {
      updatedBranch = updatedBranch.updateAddress(request.address);
    }

    if (request.phone !== undefined || request.email !== undefined) {
      updatedBranch = updatedBranch.updateContactInfo(
        request.phone !== undefined ? request.phone : updatedBranch.phone,
        request.email !== undefined ? request.email : updatedBranch.email
      );
    }

    if (request.isActive !== undefined) {
      updatedBranch = request.isActive ? updatedBranch.activate() : updatedBranch.deactivate();
    }

    const savedBranch = await this.branchRepository.update(updatedBranch);
    return this.mapToResponse(savedBranch);
  }

  async deleteBranch(id: number): Promise<void> {
    await this.branchRepository.delete(new BranchId(id));
  }

  async searchBranches(query: string): Promise<BranchResponse[]> {
    const branches = await this.branchRepository.searchBranches(query);
    return branches.map(this.mapToResponse);
  }

  private mapToResponse(branchEntity: BranchEntity): BranchResponse {
    return {
      id: branchEntity.id.getValue(),
      name: branchEntity.name,
      code: branchEntity.code,
      address: branchEntity.address,
      phone: branchEntity.phone,
      email: branchEntity.email,
      branchType: branchEntity.branchType,
      isActive: branchEntity.isActive,
      createdAt: branchEntity.createdAt.toISOString(),
      updatedAt: branchEntity.updatedAt.toISOString(),
    };
  }
}
