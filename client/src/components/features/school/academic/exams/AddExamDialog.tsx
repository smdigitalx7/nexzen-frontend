import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";

interface AddExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  examData: {
    exam_name: string;
    exam_type: string;
    class_range: string;
    start_date: string;
    end_date: string;
    pass_marks: string;
    max_marks: string;
  };
  setExamData: (data: any) => void;
}

export const AddExamDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  examData,
  setExamData,
}: AddExamDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                value={examData.exam_name}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    exam_name: e.target.value,
                  })
                }
                placeholder="Half Yearly Exam"
              />
            </div>
            <div>
              <Label htmlFor="exam_type">Exam Type</Label>
              <Select
                value={examData.exam_type}
                onValueChange={(value) =>
                  setExamData({ ...examData, exam_type: value })
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
              value={examData.class_range}
              onChange={(e) =>
                setExamData({
                  ...examData,
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
                value={examData.start_date}
                onChange={(e) =>
                  setExamData({
                    ...examData,
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
                value={examData.end_date}
                onChange={(e) =>
                  setExamData({ ...examData, end_date: e.target.value })
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
                value={examData.max_marks}
                onChange={(e) =>
                  setExamData({
                    ...examData,
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
                value={examData.pass_marks}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    pass_marks: e.target.value,
                  })
                }
                placeholder="35"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
