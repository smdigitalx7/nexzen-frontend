export interface AdvanceRead {
  advance_id: number;
  branch_id: number;
  employee_id: number;
  amount: number;
  status: string;
  granted_at: string;
}

export interface AdvanceCreate {
  branch_id: number;
  employee_id: number;
  amount: number;
}

export type AdvanceUpdate = Partial<AdvanceCreate>;


