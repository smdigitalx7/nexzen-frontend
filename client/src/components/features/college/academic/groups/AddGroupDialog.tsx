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

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  groupData: { group_name: string; book_fee: number; group_fee: number };
  setGroupData: (data: { group_name: string; book_fee: number; group_fee: number }) => void;
}

export const AddGroupDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  groupData,
  setGroupData,
}: AddGroupDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
          <DialogDescription>
            Create a new academic group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group_name">Group Name</Label>
            <Input
              id="group_name"
              value={groupData.group_name}
              onChange={(e) =>
                setGroupData({
                  ...groupData,
                  group_name: e.target.value,
                })
              }
              placeholder="e.g., Science Group A"
            />
          </div>
          <div>
            <Label htmlFor="book_fee">Book Fee</Label>
            <Input
              id="book_fee"
              type="number"
              min="0"
              step="0.01"
              value={groupData.book_fee}
              onChange={(e) =>
                setGroupData({
                  ...groupData,
                  book_fee: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter book fee"
            />
          </div>
          <div>
            <Label htmlFor="group_fee">Group Fee</Label>
            <Input
              id="group_fee"
              type="number"
              min="0"
              step="0.01"
              value={groupData.group_fee}
              onChange={(e) =>
                setGroupData({
                  ...groupData,
                  group_fee: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter group fee"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
