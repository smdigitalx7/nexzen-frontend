import { useState, memo } from "react";
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useCreateClass, useUpdateClass, useClassWithSubjects } from '@/lib/hooks/useSchool';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ClassesTabProps {
  classesWithSubjects: any[];
  classesLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const ClassesTab = memo(({
  classesWithSubjects,
  classesLoading,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: ClassesTabProps) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState<number | null>(null);
  const [newClass, setNewClass] = useState({ class_name: "" });
  const [editClass, setEditClass] = useState({ class_name: "" });
  
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const { toast } = useToast();
  
  // Fetch subjects for selected class
  const { data: classWithSubjects, isLoading: subjectsLoading } = useClassWithSubjects(selectedClassForSubjects || 0);

  const handleAddClass = () => {
    if (!newClass.class_name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    createClassMutation.mutate({
      class_name: newClass.class_name.trim(),
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Class added successfully",
        });
        setNewClass({ class_name: "" });
        setIsAddClassOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add class",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditClass = (classItem: any) => {
    setSelectedClass(classItem);
    setEditClass({ class_name: classItem.class_name });
    setIsEditClassOpen(true);
  };

  const handleUpdateClass = () => {
    if (!editClass.class_name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    updateClassMutation.mutate({
      id: selectedClass.class_id,
      payload: {
        class_name: editClass.class_name.trim(),
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
        setEditClass({ class_name: "" });
        setSelectedClass(null);
        setIsEditClassOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update class",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteClass = (classItem: any) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClass = () => {
    if (selectedClass) {
      toast({
        title: "Info",
        description: "Delete functionality is not yet implemented",
      });
      setSelectedClass(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleViewSubjects = (classItem: any) => {
    setSelectedClassForSubjects(classItem.class_id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            {
              classesWithSubjects.filter((c) =>
                c.class_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ).length
            }{" "}
            Classes
          </Badge>
        </div>
        
        <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new class
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="class_name">Class Name</Label>
                <Input
                  id="class_name"
                  value={newClass.class_name}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      class_name: e.target.value,
                    })
                  }
                  placeholder="e.g., Grade 10-A"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddClassOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddClass}
                disabled={createClassMutation.isPending}
              >
                {createClassMutation.isPending ? "Adding..." : "Add Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {classesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading classes...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="border rounded-md p-4 text-sm bg-amber-50 text-amber-800">
          Could not load classes{errorMessage ? `: ${errorMessage}` : ''}.
        </div>
      ) : classesWithSubjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No classes found</h3>
          <p className="text-slate-500 mb-4">Get started by creating your first class.</p>
          <Button onClick={() => setIsAddClassOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classesWithSubjects
          .filter((c) =>
            c.class_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((classItem) => (
          <Card key={classItem.class_id} className="hover-elevate">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {/^\d+$/.test((classItem.class_name || '').toString())
                        ? `Class ${classItem.class_name}`
                        : classItem.class_name}
                    </CardTitle>
                    <CardDescription>
                      ID: {classItem.class_id}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Click to view details</div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSubjects(classItem)}
                    className="flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Subjects
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClass(classItem)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClass(classItem)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the class information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-class-name">Class Name</Label>
              <Input
                id="edit-class-name"
                value={editClass.class_name}
                onChange={(e) => setEditClass({ class_name: e.target.value })}
                placeholder="e.g., Grade 10-A"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateClass}
              disabled={updateClassMutation.isPending}
            >
              {updateClassMutation.isPending ? "Updating..." : "Update Class"}
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
              This action cannot be undone. This will permanently delete the class "{selectedClass?.class_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteClass}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Subjects Dialog */}
      <Dialog open={selectedClassForSubjects !== null} onOpenChange={() => setSelectedClassForSubjects(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class Subjects</DialogTitle>
            <DialogDescription>
              Subjects for {classWithSubjects?.class_name || 'selected class'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {subjectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading subjects...</p>
                </div>
              </div>
            ) : classWithSubjects?.subjects && classWithSubjects.subjects.length > 0 ? (
              <div className="space-y-2">
                {classWithSubjects.subjects.map((subject: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{subject}</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No subjects found for this class.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClassForSubjects(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
