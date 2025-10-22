import { useState, useMemo } from "react";
import { Plus, DollarSign, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/components/shared";
import {
  createTextColumn
} from "@/lib/utils/columnFactories";
import DistanceSlabFormDialog from "./DistanceSlabFormDialog";

interface DistanceSlabsTabProps {
  slabsData: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateSlab: (data: any) => void;
  onUpdateSlab: (data: any) => void;
  createFeeMutation: any;
  updateFeeMutation: any;
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
    console.log('Delete slab:', id);
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'slab_name',
      accessorKey: 'slab_name',
      header: 'Slab Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
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
      onClick: (row: any) => handleEditSlab(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: any) => handleDeleteSlab(row.original.slab_id)
    }
  ], []);

  const handleAddSlab = (data: any) => {
    createFeeMutation.mutate(data);
    setIsAddFeeOpen(false);
  };

  const handleUpdateSlab = (data: any) => {
    updateFeeMutation.mutate(data);
    setIsEditFeeOpen(false);
    setEditFeeId(null);
  };

  const handleEditSlab = (slab: any) => {
    setEditFeeId(slab.id);
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
        editingSlab={editFeeId ? slabsData.find(s => s.id === editFeeId) : undefined}
      />
    </div>
  );
};

export default DistanceSlabsTab;
