import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { CollegeGroupDropdown } from "@/common/components/shared/Dropdowns/College/GroupDropdown";

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
            <CollegeGroupDropdown
              value={courseData.group_id > 0 ? courseData.group_id : null}
              onChange={(value) =>
                setCourseData({
                  ...courseData,
                  group_id: value ?? 0,
                })
              }
              placeholder="Select group"
              required
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
