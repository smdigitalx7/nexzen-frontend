import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Award } from "lucide-react";
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

interface ExamsTabProps {
  exams: any[];
  setExams: (exams: any[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBranchType: string;
  setSelectedBranchType: (type: string) => void;
  currentBranch: any;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ExamsTab = ({
  exams,
  setExams,
  searchTerm,
  setSearchTerm,
  selectedBranchType,
  setSelectedBranchType,
  currentBranch,
  isLoading = false,
  hasError = false,
  errorMessage,
}: ExamsTabProps) => {
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    exam_name: "",
    exam_type: "",
    class_range: "",
    start_date: "",
    end_date: "",
    pass_marks: "",
    max_marks: "",
  });

  const handleAddExam = () => {
    const newId = Math.max(...exams.map((e) => e.id)) + 1;
    const exam = {
      id: newId,
      exam_name: newExam.exam_name,
      exam_type: newExam.exam_type,
      academic_year_id: 0,
      academic_year: "2024-25",
      class_range: newExam.class_range,
      start_date: newExam.start_date,
      end_date: newExam.end_date,
      pass_marks: parseInt(newExam.pass_marks || "0"),
      max_marks: parseInt(newExam.max_marks || "0"),
      status: "scheduled",
      students_count: 0,
    };

    setExams([...exams, exam]);
    setNewExam({
      exam_name: "",
      exam_type: "",
      class_range: "",
      start_date: "",
      end_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddExamOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
                  <Label htmlFor="exam_type">Exam Type</Label>
                  <Select
                    value={newExam.exam_type}
                    onValueChange={(value) =>
                      setNewExam({ ...newExam, exam_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Formal">Formal Exam</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="class_range">Class Range</Label>
                <Input
                  id="class_range"
                  value={newExam.class_range}
                  onChange={(e) =>
                    setNewExam({
                      ...newExam,
                      class_range: e.target.value,
                    })
                  }
                  placeholder="6-10 or 1st-2nd Year"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newExam.start_date}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newExam.end_date}
                    onChange={(e) =>
                      setNewExam({ ...newExam, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
          Could not load exams{errorMessage ? `: ${errorMessage}` : ''}. Showing controls only.
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
          <Award className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-600 mb-4">No exams found.</p>
          <Button className="gap-2" onClick={() => setIsAddExamOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {(exam?.exam_name || '').toString()}
                      </CardTitle>
                      <CardDescription>{(exam?.exam_type || '').toString()}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {(exam?.status || '').toString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span className="font-medium">{formatDate(exam.exam_date) || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marks:</span>
                    <span className="font-medium">{(Number.isFinite(exam?.pass_marks) ? exam.pass_marks : 0)}/{(Number.isFinite(exam?.max_marks) ? exam.max_marks : 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};
