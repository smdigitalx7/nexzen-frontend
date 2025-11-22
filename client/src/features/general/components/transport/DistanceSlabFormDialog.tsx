import { useState, useEffect } from "react";
import { FormDialog } from "@/common/components/shared";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";

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
      // For updates, only include fields that have been changed/have values
      const updateData: any = {};
      
      // Only include fields that have values (not empty strings)
      if (formData.slab_name && formData.slab_name.trim()) updateData.slab_name = formData.slab_name.trim();
      if (formData.min_distance) {
        const minDist = parseFloat(formData.min_distance);
        if (!isNaN(minDist)) updateData.min_distance = minDist;
      }
      if (formData.max_distance) {
        const maxDist = parseFloat(formData.max_distance);
        if (!isNaN(maxDist)) updateData.max_distance = maxDist;
      }
      if (formData.fee_amount) {
        const fee = parseFloat(formData.fee_amount);
        if (!isNaN(fee)) updateData.fee_amount = fee;
      }
      
      onSubmit({
        id: editingSlab.id,
        data: updateData
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

  const handleSave = () => {
    handleSubmit();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={isEditing ? "Edit Distance Slab" : "Add Distance Slab"}
      description={isEditing ? "Update distance slab details" : "Define fee by distance range"}
      size="MEDIUM"
      onSave={handleSave}
      saveText={isEditing ? "Update Slab" : "Add Slab"}
      cancelText="Cancel"
    >
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
    </FormDialog>
  );
};

export default DistanceSlabFormDialog;
