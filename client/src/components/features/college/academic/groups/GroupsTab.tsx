import { useState, memo, useMemo } from "react";
import { Users, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCollegeGroups, useUpdateCollegeGroup, useCreateCollegeGroup, useDeleteCollegeGroup } from '@/lib/hooks/college/use-college-groups';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/lib/utils/columnFactories";

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
  const [selectedGroup, setSelectedGroup] = useState<import("@/lib/types/college").CollegeGroupResponse | null>(null);
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
      
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      
      setNewGroup({ group_name: "", book_fee: 0, group_fee: 0 });
      setIsAddGroupOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
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
      
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      
      setEditGroup({ group_name: "", book_fee: 0, group_fee: 0 });
      setSelectedGroup(null);
      setIsEditGroupOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroupMutation.mutateAsync(selectedGroup.group_id);
      
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      
      setSelectedGroup(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (groupItem: import("@/lib/types/college").CollegeGroupResponse) => {
    setSelectedGroup(groupItem);
    setEditGroup({ 
      group_name: groupItem.group_name, 
      book_fee: groupItem.book_fee, 
      group_fee: groupItem.group_fee 
    });
    setIsEditGroupOpen(true);
  };

  const handleDeleteClick = (groupItem: any) => {
    setSelectedGroup(groupItem);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("group_name", { header: "Group Name", icon: Users }),
    {
      accessorKey: "book_fee",
      header: "Book Fee",
      cell: ({ row }) => `$${row.getValue("book_fee")}`,
    },
    {
      accessorKey: "group_fee", 
      header: "Group Fee",
      cell: ({ row }) => `$${row.getValue("group_fee")}`,
    }
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (groupItem: any) => handleEditClick(groupItem)
    },
    {
      type: 'delete' as const,
      onClick: (groupItem: any) => handleDeleteClick(groupItem)
    }
  ], [handleEditClick, handleDeleteClick]);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load groups"}</p>
      </div>
    );
  }

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={groupsWithSubjects}
        columns={columns}
        title="Groups"
        searchKey="group_name"
        exportable={true}
        onAdd={() => setIsAddGroupOpen(true)}
        addButtonText="Add Group"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
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