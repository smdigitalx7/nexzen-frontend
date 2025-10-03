import { useState } from "react";
import { Plus, Award, Edit, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ExamsTabProps {
  exams: any[];
  setExams: (exams: any[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ExamsTab = ({
  exams,
  setExams,
  searchTerm,
  setSearchTerm,
  isLoading = false,
  hasError = false,
  errorMessage,
}: ExamsTabProps) => {
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [newExam, setNewExam] = useState({
    exam_name: "",
    exam_date: "",
    pass_marks: "",
    max_marks: "",
  });
  const [editExam, setEditExam] = useState({
    exam_name: "",
    exam_date: "",
    pass_marks: "",
    max_marks: "",
  });
  
  const { toast } = useToast();

  const handleAddExam = () => {
    const newId = Math.max(...exams.map((e) => e.exam_id || e.id || 0)) + 1;
    const exam = {
      exam_id: newId,
      exam_name: newExam.exam_name,
      exam_date: newExam.exam_date,
      pass_marks: parseInt(newExam.pass_marks || "0"),
      max_marks: parseInt(newExam.max_marks || "0"),
    };

    setExams([...exams, exam]);
    setNewExam({
      exam_name: "",
      exam_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddExamOpen(false);
    toast({
      title: "Success",
      description: "Exam added successfully",
    });
  };

  const handleEditExam = (exam: any) => {
    setSelectedExam(exam);
    setEditExam({
      exam_name: exam.exam_name,
      exam_date: exam.exam_date,
      pass_marks: exam.pass_marks.toString(),
      max_marks: exam.max_marks.toString(),
    });
    setIsEditExamOpen(true);
  };

  const handleUpdateExam = () => {
    if (selectedExam) {
      const updatedExams = exams.map((exam) =>
        (exam.exam_id || exam.id) === (selectedExam.exam_id || selectedExam.id)
          ? {
              ...exam,
              exam_name: editExam.exam_name,
              exam_date: editExam.exam_date,
              pass_marks: parseInt(editExam.pass_marks || "0"),
              max_marks: parseInt(editExam.max_marks || "0"),
            }
          : exam
      );
      setExams(updatedExams);
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
    }
    setEditExam({
      exam_name: "",
      exam_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setSelectedExam(null);
    setIsEditExamOpen(false);
  };

  const handleDeleteExam = (exam: any) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteExam = () => {
    if (selectedExam) {
      const updatedExams = exams.filter((exam) => (exam.exam_id || exam.id) !== (selectedExam.exam_id || selectedExam.id));
      setExams(updatedExams);
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    }
    setSelectedExam(null);
    setIsDeleteDialogOpen(false);
  };


  const filteredExams = (exams || []).filter((exam) => {
    const name = (exam?.exam_name || '').toString().toLowerCase();
    const term = (searchTerm || '').toString().toLowerCase();
    return name.includes(term);
  });

  const formatDate = (value: any) => {
    if (!value) return '';
    // Support plain YYYY-MM-DD or ISO strings
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">{filteredExams.length} Exams</Badge>
        </div>
        <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exam</DialogTitle>
              <DialogDescription>
                Schedule a new examination or test
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam_name">Exam Name</Label>
                  <Input
                    id="exam_name"
                    value={newExam.exam_name}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        exam_name: e.target.value,
                      })
                    }
                    placeholder="Half Yearly Exam"
                  />
                </div>
                <div>
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={newExam.exam_date}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        exam_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pass_marks">Pass Marks</Label>
                  <Input
                    id="pass_marks"
                    type="number"
                    value={newExam.pass_marks}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        pass_marks: e.target.value,
                      })
                    }
                    placeholder="35"
                  />
                </div>
                <div>
                  <Label htmlFor="max_marks">Max Marks</Label>
                  <Input
                    id="max_marks"
                    type="number"
                    value={newExam.max_marks}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        max_marks: e.target.value,
                      })
                    }
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddExamOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddExam}>Add Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading exams...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="border rounded-md p-4 text-sm bg-amber-50 text-amber-800">
          Could not load exams{errorMessage ? `: ${errorMessage}` : ''}.
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Award className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No exams found</h3>
          <p className="text-slate-500 mb-4">Get started by creating your first exam.</p>
          <Button onClick={() => setIsAddExamOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
          <CardDescription>Complete list of examinations and tests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pass Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.exam_id || exam.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{exam.exam_id || exam.id}</TableCell>
                  <TableCell className="font-medium">{exam.exam_name}</TableCell>
                  <TableCell>{formatDate(exam.exam_date)}</TableCell>
                  <TableCell>{exam.pass_marks}</TableCell>
                  <TableCell>{exam.max_marks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditExam(exam)}
                        title="Edit exam"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteExam(exam)}
                        title="Delete exam"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Edit Exam Dialog */}
      <Dialog open={isEditExamOpen} onOpenChange={setIsEditExamOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update the exam information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-exam-name">Exam Name</Label>
                <Input
                  id="edit-exam-name"
                  value={editExam.exam_name}
                  onChange={(e) => setEditExam({ ...editExam, exam_name: e.target.value })}
                  placeholder="Enter exam name"
                />
              </div>
              <div>
                <Label htmlFor="edit-exam-date">Exam Date</Label>
                <Input
                  id="edit-exam-date"
                  type="date"
                  value={editExam.exam_date}
                  onChange={(e) => setEditExam({ ...editExam, exam_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-pass-marks">Pass Marks</Label>
                <Input
                  id="edit-pass-marks"
                  type="number"
                  value={editExam.pass_marks}
                  onChange={(e) => setEditExam({ ...editExam, pass_marks: e.target.value })}
                  placeholder="Enter pass marks"
                />
              </div>
              <div>
                <Label htmlFor="edit-max-marks">Max Marks</Label>
                <Input
                  id="edit-max-marks"
                  type="number"
                  value={editExam.max_marks}
                  onChange={(e) => setEditExam({ ...editExam, max_marks: e.target.value })}
                  placeholder="Enter max marks"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditExamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExam}>
              Update Exam
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
              This action cannot be undone. This will permanently delete the exam "{selectedExam?.exam_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteExam}
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
