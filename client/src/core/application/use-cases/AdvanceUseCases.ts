import { IAdvanceRepository } from '../../domain/repositories/AdvanceRepository';
import { AdvanceEntity, AdvanceStatus } from '../../domain/entities/Advance';
import { AdvanceId } from '../../domain/value-objects/AdvanceId';
import { 
  CreateAdvanceRequest, 
  UpdateAdvanceRequest, 
  UpdateAdvanceStatusRequest,
  UpdateAdvanceAmountPaidRequest,
  AdvanceResponse,
  AdvanceListResponse 
} from '../dto/AdvanceDto';

export class AdvanceUseCases {
  constructor(private advanceRepository: IAdvanceRepository) {}

  async getAllAdvances(): Promise<AdvanceListResponse> {
    const advances = await this.advanceRepository.findAll();
    const advanceResponses = advances.map(this.mapToResponse);
    
    return {
      data: advanceResponses,
      total: advanceResponses.length,
      pages: 1,
      current_page: 1
    };
  }

  async getAdvancesByBranch(branchId: number): Promise<AdvanceListResponse> {
    const advances = await this.advanceRepository.findByBranchId(branchId);
    const advanceResponses = advances.map(this.mapToResponse);
    
    return {
      data: advanceResponses,
      total: advanceResponses.length,
      pages: 1,
      current_page: 1
    };
  }

  async getAdvanceById(id: number): Promise<AdvanceResponse | null> {
    const advance = await this.advanceRepository.findById(new AdvanceId(id));
    return advance ? this.mapToResponse(advance) : null;
  }

  async getAdvancesByEmployeeId(employeeId: number): Promise<AdvanceResponse[]> {
    const advances = await this.advanceRepository.findByEmployeeId(employeeId);
    return advances.map(this.mapToResponse);
  }

  async getAdvancesByStatus(status: AdvanceStatus): Promise<AdvanceResponse[]> {
    const advances = await this.advanceRepository.findByStatus(status);
    return advances.map(this.mapToResponse);
  }

  async createAdvance(request: CreateAdvanceRequest): Promise<AdvanceResponse> {
    const advance = AdvanceEntity.create(
      request.employeeId,
      request.amount,
      request.reason,
      request.branchId,
      request.notes
    );
    
    const savedAdvance = await this.advanceRepository.save(advance);
    return this.mapToResponse(savedAdvance);
  }

  async updateAdvance(request: UpdateAdvanceRequest): Promise<AdvanceResponse> {
    const existingAdvance = await this.advanceRepository.findById(new AdvanceId(request.id));
    if (!existingAdvance) {
      throw new Error('Advance not found');
    }

    let updatedAdvance = existingAdvance;
    
    if (request.amount !== undefined) {
      updatedAdvance = updatedAdvance.updateAmount(request.amount);
    }
    
    if (request.reason !== undefined) {
      updatedAdvance = updatedAdvance.updateReason(request.reason);
    }

    const savedAdvance = await this.advanceRepository.update(updatedAdvance);
    return this.mapToResponse(savedAdvance);
  }

  async updateAdvanceStatus(request: UpdateAdvanceStatusRequest): Promise<AdvanceResponse> {
    const existingAdvance = await this.advanceRepository.findById(new AdvanceId(request.id));
    if (!existingAdvance) {
      throw new Error('Advance not found');
    }

    let updatedAdvance: AdvanceEntity;
    
    switch (request.status) {
      case AdvanceStatus.APPROVED:
        updatedAdvance = existingAdvance.approve(request.notes);
        break;
      case AdvanceStatus.REJECTED:
        updatedAdvance = existingAdvance.reject(request.notes);
        break;
      case AdvanceStatus.CANCELLED:
        updatedAdvance = existingAdvance.cancel(request.notes);
        break;
      default:
        throw new Error('Invalid status for this operation');
    }

    const savedAdvance = await this.advanceRepository.update(updatedAdvance);
    return this.mapToResponse(savedAdvance);
  }

  async updateAdvanceAmountPaid(request: UpdateAdvanceAmountPaidRequest): Promise<AdvanceResponse> {
    const existingAdvance = await this.advanceRepository.findById(new AdvanceId(request.id));
    if (!existingAdvance) {
      throw new Error('Advance not found');
    }

    const updatedAdvance = existingAdvance.markAsPaid(request.amountPaid, request.notes);
    const savedAdvance = await this.advanceRepository.update(updatedAdvance);
    return this.mapToResponse(savedAdvance);
  }

  async deleteAdvance(id: number): Promise<void> {
    await this.advanceRepository.delete(new AdvanceId(id));
  }

  private mapToResponse(advance: AdvanceEntity): AdvanceResponse {
    return {
      advance_id: advance.id.getValue(),
      employee_id: advance.employeeId,
      advance_date: advance.requestedDate.toISOString().split('T')[0],
      advance_amount: advance.amount,
      total_repayment_amount: advance.amountPaid || 0,
      remaining_balance: advance.amount - (advance.amountPaid || 0),
      request_reason: advance.reason,
      status: advance.status,
      created_at: advance.createdAt.toISOString(),
      updated_at: advance.updatedAt.toISOString(),
      created_by: null,
      approved_by: null,
      approved_at: advance.approvedDate?.toISOString() || null,
      reason: advance.reason,
      updated_by: null,
    };
  }
}
