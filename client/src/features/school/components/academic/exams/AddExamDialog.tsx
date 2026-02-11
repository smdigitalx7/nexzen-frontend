import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { DatePicker } from "@/common/components/ui/date-picker";
import { SmartSelect } from "@/common/components/ui/smart-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

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
    weight_percentage: string;
    weightage_divider: string;
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
              <SmartSelect
                items={[
                  { value: "Formal", label: "Formal Exam" },
                  { value: "Test", label: "Test" },
                  { value: "Quiz", label: "Quiz" },
                ]}
                value={examData.exam_type}
                onSelect={(value: string) =>
                  setExamData({ ...examData, exam_type: value })
                }
                placeholder="Select type"
                radioLayout="horizontal"
              />
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
              <DatePicker
                id="start_date"
                value={examData.start_date}
                onChange={(value) =>
                  setExamData({
                    ...examData,
                    start_date: value,
                  })
                }
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <DatePicker
                id="end_date"
                value={examData.end_date}
                onChange={(value) =>
                  setExamData({ ...examData, end_date: value })
                }
                placeholder="Select end date"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight_percentage">Weight %</Label>
              <Input
                id="weight_percentage"
                type="number"
                step="0.01"
                value={examData.weight_percentage}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    weight_percentage: e.target.value,
                  })
                }
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="weightage_divider">Weightage Divider</Label>
              <Input
                id="weightage_divider"
                type="number"
                value={examData.weightage_divider}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    weightage_divider: e.target.value,
                  })
                }
                placeholder="1"
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
