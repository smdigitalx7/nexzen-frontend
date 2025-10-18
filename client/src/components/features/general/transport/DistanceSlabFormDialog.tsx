import { useState, useEffect } from "react";
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

interface DistanceSlabFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isEditing: boolean;
  editingSlab?: {
    id: number;
    slab_name: string;
    min_distance: number;
    max_distance?: number;
    fee_amount: number;
  };
}

const DistanceSlabFormDialog = ({ isOpen, onClose, onSubmit, isEditing, editingSlab }: DistanceSlabFormDialogProps) => {
  const [formData, setFormData] = useState({
    slab_name: "",
    min_distance: "",
    max_distance: "",
    fee_amount: "",
  });

  useEffect(() => {
    if (isEditing && editingSlab) {
      setFormData({
        slab_name: editingSlab.slab_name,
        min_distance: editingSlab.min_distance.toString(),
        max_distance: editingSlab.max_distance?.toString() || "",
        fee_amount: editingSlab.fee_amount.toString(),
      });
    } else {
      setFormData({
        slab_name: "",
        min_distance: "",
        max_distance: "",
        fee_amount: "",
      });
    }
  }, [isEditing, editingSlab]);

  const handleSubmit = () => {
    if (isEditing && editingSlab) {
      onSubmit({
        id: editingSlab.slab_id,
        data: {
          slab_name: formData.slab_name || undefined,
          min_distance: formData.min_distance ? parseFloat(formData.min_distance) : undefined,
          max_distance: formData.max_distance ? parseFloat(formData.max_distance) : undefined,
          fee_amount: formData.fee_amount ? parseFloat(formData.fee_amount) : undefined,
        }
      });
    } else {
      if (!formData.slab_name || !formData.min_distance || !formData.fee_amount) return;
      onSubmit({
        slab_name: formData.slab_name,
        min_distance: parseFloat(formData.min_distance),
        max_distance: formData.max_distance ? parseFloat(formData.max_distance) : undefined,
        fee_amount: parseFloat(formData.fee_amount),
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Distance Slab" : "Add Distance Slab"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update distance slab details" : "Define fee by distance range"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="slab_name">Slab Name</Label>
              <Input 
                id="slab_name" 
                value={formData.slab_name} 
                onChange={(e) => setFormData({ ...formData, slab_name: e.target.value })} 
                placeholder="0-3 km" 
              />
            </div>
            <div>
              <Label htmlFor="min_distance">Min Distance (km)</Label>
              <Input 
                id="min_distance" 
                type="number" 
                step="0.1" 
                value={formData.min_distance} 
                onChange={(e) => setFormData({ ...formData, min_distance: e.target.value })} 
              />
            </div>
            <div>
              <Label htmlFor="max_distance">Max Distance (km)</Label>
              <Input 
                id="max_distance" 
                type="number" 
                step="0.1" 
                value={formData.max_distance} 
                onChange={(e) => setFormData({ ...formData, max_distance: e.target.value })} 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fee_amount">Fee Amount</Label>
              <Input
                id="fee_amount"
                type="number"
                value={formData.fee_amount}
                onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                placeholder="e.g. 1500"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Update Slab" : "Add Slab"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistanceSlabFormDialog;
