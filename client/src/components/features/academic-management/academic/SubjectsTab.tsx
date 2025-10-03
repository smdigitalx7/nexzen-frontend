import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateSubject, useUpdateSubject } from '@/lib/hooks/useSchool';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SubjectsTabProps {
  backendSubjects: any[];
  subjectsLoading: boolean;
  currentBranch: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBranchType: string; 
  setSelectedBranchType: (type: string) => void; 
}

export const SubjectsTab = ({
  backendSubjects,
  subjectsLoading,
  currentBranch,
  searchTerm,
  setSearchTerm,
  selectedBranchType: _selectedBranchType,
  setSelectedBranchType: _setSelectedBranchType,
}: SubjectsTabProps) => {
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({
    subject_name: "",
  });
  const [editSubject, setEditSubject] = useState({
    subject_name: "",
  });
  
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const { toast } = useToast();

  const handleAddSubject = () => {
    if (newSubject.subject_name?.trim()) {
      createSubjectMutation.mutate({ subject_name: newSubject.subject_name.trim() });
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
    }
    setNewSubject({
      subject_name: "",
    });
    setIsAddSubjectOpen(false);
  };

  const handleEditSubject = (subject: any) => {
    setSelectedSubject(subject);
    setEditSubject({
      subject_name: subject.subject_name,
    });
    setIsEditSubjectOpen(true);
  };

  const handleUpdateSubject = () => {
    if (editSubject.subject_name?.trim() && selectedSubject) {
      updateSubjectMutation.mutate({
        id: selectedSubject.subject_id,
        payload: { subject_name: editSubject.subject_name.trim() }
      });
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
    }
    setEditSubject({
      subject_name: "",
    });
    setSelectedSubject(null);
    setIsEditSubjectOpen(false);
  };

  const handleDeleteSubject = (subject: any) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubject = () => {
    if (selectedSubject) {
      // For now, just show a message that delete is not implemented
      toast({
        title: "Not Available",
        description: "Delete functionality is not yet implemented",
        variant: "destructive",
      });
    }
    setSelectedSubject(null);
    setIsDeleteDialogOpen(false);
  };


  const filteredSubjects = backendSubjects.filter(
    (subject) => subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const hasSubjectCode = filteredSubjects.some((s) => !!s.subject_code);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            {filteredSubjects.length} Subjects
          </Badge>
        </div>
        <Dialog
          open={isAddSubjectOpen}
          onOpenChange={setIsAddSubjectOpen}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject with teacher assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject_name">Subject Name</Label>
                <Input
                  id="subject_name"
                  value={newSubject.subject_name}
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      subject_name: e.target.value,
                    })
                  }
                  placeholder="Mathematics"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddSubjectOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSubject}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            {hasSubjectCode && <TableHead>Code</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjectsLoading ? (
            <TableRow>
              <TableCell colSpan={hasSubjectCode ? 4 : 3} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Loading subjects...
                </div>
              </TableCell>
            </TableRow>
          ) : filteredSubjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasSubjectCode ? 4 : 3} className="text-center py-8 text-slate-500">
                No subjects found.
              </TableCell>
            </TableRow>
          ) : (
            filteredSubjects.map((subject) => (
            <TableRow key={subject.subject_id}>
              <TableCell className="font-mono text-xs text-slate-500">
                {subject.subject_id}
              </TableCell>
              <TableCell className="font-medium">
                {subject.subject_name}
              </TableCell>
              {hasSubjectCode && (
                <TableCell>{subject.subject_code || '-'}</TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditSubject(subject)}
                    title="Edit subject"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteSubject(subject)}
                    title="Delete subject"
                    className="text-red-600 hover:text-red-700"
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

      {/* Edit Subject Dialog */}
      <Dialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the subject information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-subject-name">Subject Name</Label>
              <Input
                id="edit-subject-name"
                value={editSubject.subject_name}
                onChange={(e) => setEditSubject({ ...editSubject, subject_name: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubject}>
              Update Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject "{selectedSubject?.subject_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
