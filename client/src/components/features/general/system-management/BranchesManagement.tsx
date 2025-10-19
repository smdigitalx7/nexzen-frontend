import { useMemo, useState } from "react";
import { useBranches, useDeleteBranch } from "@/lib/hooks/useBranches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Edit, Trash2, Eye, Building2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createBadgeColumn, 
  createTruncatedTextColumn, 
  createTextColumn,
  createActionColumn,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

export default function BranchesManagement() {
  const { data, isLoading, error } = useBranches();
  const del = useDeleteBranch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const onDelete = async (id: number) => {
    try {
      await del.mutateAsync(id);
      toast({ title: "Branch deleted" });
      setDeleteDialogOpen(false);
      setSelectedBranch(null);
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e?.message || "", variant: "destructive" });
    }
  };

  const handleDeleteClick = (branch: any) => {
    setSelectedBranch(branch);
    setDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("branch_name", { 
      icon: Building2, 
      header: "Branch Name" 
    }),
    createBadgeColumn<any>("branch_type", { 
      header: "Type", 
      variant: "outline" 
    }),
    createTruncatedTextColumn<any>("branch_address", { 
      header: "Address", 
      fallback: "No address" 
    }),
    createTextColumn<any>("contact_email", { 
      header: "Email", 
      fallback: "No email",
      className: "text-sm text-muted-foreground"
    }),
    createTextColumn<any>("contact_phone", { 
      header: "Phone", 
      fallback: "No phone",
      className: "text-sm text-muted-foreground"
    }),
    createActionColumn<any>([
      createDeleteAction(handleDeleteClick)
    ])
  ], []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Failed to load branches</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={data || []}
        columns={columns}
        title="Branches"
        description="Manage branch locations and information"
        searchKey="branch_name"
        exportable={true}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Branch"
        description={`Are you sure you want to delete the branch "${selectedBranch?.branch_name}"? This action cannot be undone.`}
        onConfirm={() => selectedBranch && onDelete(selectedBranch.branch_id)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedBranch(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}