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

interface AddClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  classData: { class_name: string; class_order: number };
  setClassData: (data: { class_name: string; class_order: number }) => void;
}

export const AddClassDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  classData,
  setClassData,
}: AddClassDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              value={classData.class_name}
              onChange={(e) =>
                setClassData({
                  ...classData,
                  class_name: e.target.value,
                })
              }
              placeholder="e.g., Grade 10-A"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
