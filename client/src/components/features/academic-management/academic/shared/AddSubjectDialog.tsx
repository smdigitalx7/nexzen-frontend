import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  subjectData: {
    subject_name: string;
    subject_code: string;
    class_range: string;
    teacher_id: string;
    max_marks: string;
    pass_marks: string;
  };
  setSubjectData: (data: any) => void;
}

export const AddSubjectDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  subjectData,
  setSubjectData,
}: AddSubjectDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject with teacher assignment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject_name">Subject Name</Label>
              <Input
                id="subject_name"
                value={subjectData.subject_name}
                onChange={(e) =>
                  setSubjectData({
                    ...subjectData,
                    subject_name: e.target.value,
                  })
                }
                placeholder="Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="subject_code">Subject Code</Label>
              <Input
                id="subject_code"
                value={subjectData.subject_code}
                onChange={(e) =>
                  setSubjectData({
                    ...subjectData,
                    subject_code: e.target.value,
                  })
                }
                placeholder="MATH001"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="class_range">Class Range</Label>
            <Input
              id="class_range"
              value={subjectData.class_range}
              onChange={(e) =>
                setSubjectData({
                  ...subjectData,
                  class_range: e.target.value,
                })
              }
              placeholder="6-10 or 1st-2nd Year"
            />
          </div>
          <div>
            <Label htmlFor="teacher_id">Teacher ID</Label>
            <Input
              id="teacher_id"
              value={subjectData.teacher_id}
              onChange={(e) =>
                setSubjectData({
                  ...subjectData,
                  teacher_id: e.target.value,
                })
              }
              placeholder="EMP001"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_marks">Max Marks</Label>
              <Input
                id="max_marks"
                type="number"
                value={subjectData.max_marks}
                onChange={(e) =>
                  setSubjectData({
                    ...subjectData,
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
                value={subjectData.pass_marks}
                onChange={(e) =>
                  setSubjectData({
                    ...subjectData,
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
            {isLoading ? "Adding..." : "Add Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
