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

interface AddCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  courseData: { course_name: string; course_fee: number; group_id: number };
  setCourseData: (data: { course_name: string; course_fee: number; group_id: number }) => void;
}

export const AddCourseDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  courseData,
  setCourseData,
}: AddCourseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Create a new academic course
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={courseData.course_name}
              onChange={(e) =>
                setCourseData({
                  ...courseData,
                  course_name: e.target.value,
                })
              }
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="course_fee">Course Fee</Label>
            <Input
              id="course_fee"
              type="number"
              min="0"
              step="0.01"
              value={courseData.course_fee}
              onChange={(e) =>
                setCourseData({
                  ...courseData,
                  course_fee: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter course fee"
            />
          </div>
          <div>
            <Label htmlFor="group_id">Group ID</Label>
            <Input
              id="group_id"
              type="number"
              min="1"
              value={courseData.group_id}
              onChange={(e) =>
                setCourseData({
                  ...courseData,
                  group_id: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Enter group ID"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
