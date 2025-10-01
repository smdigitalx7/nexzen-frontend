import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GroupRead } from "@/lib/types/college";

interface GroupsTableProps {
  groups: GroupRead[];
  isLoading: boolean;
  onAddGroup: () => void;
  onEditGroup: (group: GroupRead) => void;
  onDeleteGroup: (id: number) => void;
  onViewGroup: (group: GroupRead) => void;
  formatCurrency: (amount: number) => string;
}

export const GroupsTable = ({
  groups,
  isLoading,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onViewGroup,
  formatCurrency,
}: GroupsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupToDelete, setGroupToDelete] = useState<GroupRead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const filteredGroups = groups.filter((group) => {
    const searchMatch = searchTerm === "" || 
      group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.group_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const handleDeleteClick = (group: GroupRead) => {
    setGroupToDelete(group);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.id);
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading groups...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddGroup} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subject Groups ({filteredGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No groups found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.group_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {group.group_code}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {group.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(group.group_fee)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {group.students_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(group.active)}>
                          {group.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewGroup(group)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditGroup(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(group)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{groupToDelete?.group_name}"? 
              This action cannot be undone and will affect all related combinations and sections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
