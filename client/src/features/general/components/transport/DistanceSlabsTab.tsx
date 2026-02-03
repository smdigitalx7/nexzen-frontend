import { useState, useMemo } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Dialog, DialogTrigger } from "@/common/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/common/components/shared";
import {
  createTextColumn
} from "@/common/utils/factory/columnFactories";
import DistanceSlabFormDialog from "./DistanceSlabFormDialog";
import type { DistanceSlabRead, DistanceSlabCreate, DistanceSlabUpdate } from "@/features/general/types/distance-slabs";
import type { UseMutationResult } from "@tanstack/react-query";

interface DistanceSlabsTabProps {
  slabsData: DistanceSlabRead[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateSlab: (data: DistanceSlabCreate) => void;
  onUpdateSlab: (data: { id: number; data: DistanceSlabUpdate }) => void;
  createFeeMutation: UseMutationResult<DistanceSlabRead, unknown, DistanceSlabCreate, unknown>;
  updateFeeMutation: UseMutationResult<DistanceSlabRead, unknown, { id: number; data: DistanceSlabUpdate }, unknown>;
}

const DistanceSlabsTab = ({
  slabsData,
  searchTerm,
  onSearchChange,
  onCreateSlab,
  onUpdateSlab,
  createFeeMutation,
  updateFeeMutation,
}: DistanceSlabsTabProps) => {
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [editFeeId, setEditFeeId] = useState<number | null>(null);

  const handleDeleteSlab = (id: number) => {
    // Add delete functionality when available
    // Delete functionality to be implemented
  };

  const columns: ColumnDef<DistanceSlabRead>[] = useMemo(() => [
    {
      id: 'slab_name',
      accessorKey: 'slab_name',
      header: 'Slab Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-green-600">₹</span>
          <span className="font-medium">{row.original.slab_name}</span>
        </div>
      ),
    },
    {
      id: 'min_distance',
      accessorKey: 'min_distance',
      header: 'Min Distance (km)',
      cell: ({ row }) => row.original.min_distance,
    },
    {
      id: 'max_distance',
      accessorKey: 'max_distance',
      header: 'Max Distance (km)',
      cell: ({ row }) => row.original.max_distance || '∞',
    },
    {
      id: 'range',
      header: 'Distance Range',
      cell: ({ row }) => (
        <span>
          {row.original.min_distance} - {row.original.max_distance || '∞'} km
        </span>
      ),
    },
    {
      id: 'fee_amount',
      accessorKey: 'fee_amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-green-700">
          ₹{row.original.fee_amount.toFixed(2)}
        </span>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: DistanceSlabRead) => handleEditSlab(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: DistanceSlabRead) => handleDeleteSlab(row.slab_id)
    }
  ], []);

  const handleAddSlab = (data: DistanceSlabCreate) => {
    createFeeMutation.mutate(data);
    setIsAddFeeOpen(false);
  };

  const handleUpdateSlab = (data: { id: number; data: DistanceSlabUpdate }) => {
    if (!data.id) {
      console.error("Slab ID is missing for update");
      return;
    }
    
    const { id, data: updateData } = data;
    
    // Filter out undefined, null, NaN, and empty string values
    // Note: false and 0 are valid values and will be included
    const payload: DistanceSlabUpdate = {};
    Object.keys(updateData).forEach((key) => {
      const value = updateData[key as keyof DistanceSlabUpdate];
      if (value !== undefined && value !== null && value !== '' && !Number.isNaN(value)) {
        (payload as Record<string, unknown>)[key] = value;
      }
    });
    
    // Ensure payload is not empty
    if (Object.keys(payload).length === 0) {
      console.error("Update payload is empty");
      return;
    }
    
    updateFeeMutation.mutate({ id, data: payload });
    setIsEditFeeOpen(false);
    setEditFeeId(null);
  };

  const handleEditSlab = (slab: DistanceSlabRead) => {
    setEditFeeId(slab.slab_id);
    setIsEditFeeOpen(true);
  };

  return (
    <div className="space-y-4">
      <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
        <DistanceSlabFormDialog
          isOpen={isAddFeeOpen}
          onClose={() => setIsAddFeeOpen(false)}
          onSubmit={handleAddSlab}
          isEditing={false}
        />
      </Dialog>

      <EnhancedDataTable
        data={slabsData}
        columns={columns}
        title="Distance Slabs"
        searchKey="slab_name"
        searchPlaceholder="Search slabs..."
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        exportable={true}
        onAdd={() => setIsAddFeeOpen(true)}
        addButtonText="Add Distance Slab"
        addButtonVariant="default"
      />

      {/* Edit Fee Dialog */}
      <DistanceSlabFormDialog
        isOpen={isEditFeeOpen}
        onClose={() => {
          setIsEditFeeOpen(false);
          setEditFeeId(null);
        }}
        onSubmit={handleUpdateSlab}
        isEditing={true}
        editingSlab={editFeeId ? (() => {
          const slab = slabsData.find(s => s.slab_id === editFeeId);
          return slab ? { 
            id: slab.slab_id,
            slab_name: slab.slab_name,
            min_distance: slab.min_distance,
            max_distance: slab.max_distance ?? undefined,
            fee_amount: slab.fee_amount
          } : undefined;
        })() : undefined}
      />
    </div>
  );
};

export default DistanceSlabsTab;
