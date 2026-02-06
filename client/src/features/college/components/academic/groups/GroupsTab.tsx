import { useState, memo, useMemo, useCallback } from "react";
import { Users, Edit as EditIcon, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCollegeGroups, useUpdateCollegeGroup, useCreateCollegeGroup, useDeleteCollegeGroup } from '@/features/college/hooks';
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/common/utils/factory/columnFactories";

interface GroupsTabProps {
  groupsWithSubjects: any[];
  groupsLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const GroupsTab = memo(({
  groupsWithSubjects,
  groupsLoading,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: GroupsTabProps) => {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<import("@/features/college/types").CollegeGroupResponse | null>(null);
  const [newGroup, setNewGroup] = useState({ group_name: "", book_fee: 0, group_fee: 0 });
  const [editGroup, setEditGroup] = useState({ group_name: "", book_fee: 0, group_fee: 0 });

  const { toast } = useToast();
  const createGroupMutation = useCreateCollegeGroup();
  const updateGroupMutation = useUpdateCollegeGroup(selectedGroup?.group_id || 0);
  const deleteGroupMutation = useDeleteCollegeGroup();
  

  const handleCreateGroup = async () => {
    if (!newGroup.group_name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    if (newGroup.book_fee < 0 || newGroup.group_fee < 0) {
      toast({
        title: "Error",
        description: "Fees cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        group_name: newGroup.group_name.trim(),
        book_fee: newGroup.book_fee,
        group_fee: newGroup.group_fee,
      });
      
      setNewGroup({ group_name: "", book_fee: 0, group_fee: 0 });
      setIsAddGroupOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdateGroup = async () => {
    if (!editGroup.group_name.trim() || !selectedGroup) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    if (editGroup.book_fee < 0 || editGroup.group_fee < 0) {
      toast({
        title: "Error",
        description: "Fees cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGroupMutation.mutateAsync({ 
        group_name: editGroup.group_name.trim(),
        book_fee: editGroup.book_fee,
        group_fee: editGroup.group_fee,
      });
      
      setEditGroup({ group_name: "", book_fee: 0, group_fee: 0 });
      setSelectedGroup(null);
      setIsEditGroupOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroupMutation.mutateAsync(selectedGroup.group_id);
      
      setSelectedGroup(null);
      setIsDeleteDialogOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = useCallback((groupItem: import("@/features/college/types").CollegeGroupResponse) => {
    setSelectedGroup(groupItem);
    setEditGroup({ 
      group_name: groupItem.group_name, 
      book_fee: groupItem.book_fee, 
      group_fee: groupItem.group_fee 
    });
    setIsEditGroupOpen(true);
  }, []);

  const handleDeleteClick = useCallback((groupItem: any) => {
    setSelectedGroup(groupItem);
    setIsDeleteDialogOpen(true);
  }, []);

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("group_name", { header: "Group Name", icon: Users }),
    {
      accessorKey: "book_fee",
      header: "Book Fee",
      cell: ({ row }: any) => `₹${row.getValue("book_fee")}`,
    },
    {
      accessorKey: "group_fee", 
      header: "Group Fee",
      cell: ({ row }: any) => `₹${row.getValue("group_fee")}`,
    }
  ], []);

  // Action config for DataTable V2
  const actions: import("@/common/components/shared/DataTable/types").ActionConfig<any>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: (props) => <EditIcon className={props.className} />,
      onClick: (row) => handleEditClick(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: (props) => <Trash2 className={props.className} />,
      onClick: (row) => handleDeleteClick(row),
      variant: 'destructive',
    }
  ], [handleEditClick, handleDeleteClick]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-red-100">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
           <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-700 font-bold">{errorMessage || "Failed to load groups"}</p>
        <p className="text-red-500 text-sm mt-1">Please refresh or contact administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={groupsWithSubjects}
        columns={columns}
        title="Academic Groups"
        searchKey="group_name"
        searchPlaceholder="Filter group registry..."
        loading={groupsLoading}
        onAdd={() => setIsAddGroupOpen(true)}
        addButtonText="Create New Group"
        actions={actions}
        export={{ enabled: true, filename: 'college_groups_list' }}
      />

      {/* Add Group Dialog */}
      <FormDialog
        open={isAddGroupOpen}
        onOpenChange={setIsAddGroupOpen}
        title="Add New Group"
        description="Create a new academic group"
        onSave={handleCreateGroup}
        onCancel={() => {
          setIsAddGroupOpen(false);
          setNewGroup({ group_name: "", book_fee: 0, group_fee: 0 });
        }}
        saveText="Create Group"
        cancelText="Cancel"
        disabled={createGroupMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group_name">Group Name</Label>
            <Input
              id="group_name"
              value={newGroup.group_name}
              onChange={(e) => setNewGroup({ ...newGroup, group_name: e.target.value })}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book_fee">Book Fee</Label>
            <Input
              id="book_fee"
              type="number"
              min="0"
              step="0.01"
              value={newGroup.book_fee}
              onChange={(e) => setNewGroup({ ...newGroup, book_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter book fee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group_fee">Group Fee</Label>
            <Input
              id="group_fee"
              type="number"
              min="0"
              step="0.01"
              value={newGroup.group_fee}
              onChange={(e) => setNewGroup({ ...newGroup, group_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter group fee"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Group Dialog */}
      <FormDialog
        open={isEditGroupOpen}
        onOpenChange={setIsEditGroupOpen}
        title="Edit Group"
        description="Update group information"
        onSave={handleUpdateGroup}
        onCancel={() => {
          setIsEditGroupOpen(false);
          setEditGroup({ group_name: "", book_fee: 0, group_fee: 0 });
          setSelectedGroup(null);
        }}
        saveText="Update Group"
        cancelText="Cancel"
        disabled={updateGroupMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_group_name">Group Name</Label>
            <Input
              id="edit_group_name"
              value={editGroup.group_name}
              onChange={(e) => setEditGroup({ ...editGroup, group_name: e.target.value })}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_book_fee">Book Fee</Label>
            <Input
              id="edit_book_fee"
              type="number"
              min="0"
              step="0.01"
              value={editGroup.book_fee}
              onChange={(e) => setEditGroup({ ...editGroup, book_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter book fee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_group_fee">Group Fee</Label>
            <Input
              id="edit_group_fee"
              type="number"
              min="0"
              step="0.01"
              value={editGroup.group_fee}
              onChange={(e) => setEditGroup({ ...editGroup, group_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter group fee"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Group"
        description={`Are you sure you want to delete the group "${selectedGroup?.group_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteGroup}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedGroup(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
});