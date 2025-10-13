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

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  sectionData: {
    section_name: string;
    current_enrollment: number | string;
    is_active?: boolean;
  };
  setSectionData: (data: any) => void;
}

export const AddSectionDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  sectionData,
  setSectionData,
}: AddSectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>Create a new section for the class</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="section_name">Section Name</Label>
            <Input
              id="section_name"
              value={sectionData.section_name}
              onChange={(e) =>
                setSectionData({
                  ...sectionData,
                  section_name: e.target.value,
                })
              }
              placeholder="A"
            />
          </div>
          <div>
            <Label htmlFor="current_enrollment">Current Enrollment</Label>
            <Input
              id="current_enrollment"
              type="number"
              value={sectionData.current_enrollment}
              onChange={(e) =>
                setSectionData({
                  ...sectionData,
                  current_enrollment: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
