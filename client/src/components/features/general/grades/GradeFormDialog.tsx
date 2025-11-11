import { useState, useEffect } from "react";
import { FormDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GradeCreate, GradeUpdate } from "@/lib/types/general/grades";

interface GradeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GradeCreate | { gradeCode: string; data: GradeUpdate }) => void;
  isEditing: boolean;
  editingGrade?: {
    grade: string;
    min_percentage: number;
    max_percentage: number;
  };
}

const GradeFormDialog = ({ isOpen, onClose, onSubmit, isEditing, editingGrade }: GradeFormDialogProps) => {
  const [formData, setFormData] = useState({
    grade: "",
    min_percentage: "",
    max_percentage: "",
  });

  useEffect(() => {
    if (isEditing && editingGrade) {
      setFormData({
        grade: editingGrade.grade,
        min_percentage: editingGrade.min_percentage.toString(),
        max_percentage: editingGrade.max_percentage.toString(),
      });
    } else {
      setFormData({
        grade: "",
        min_percentage: "",
        max_percentage: "",
      });
    }
  }, [isEditing, editingGrade]);

  const handleSubmit = () => {
    if (isEditing && editingGrade) {
      // For updates, only include fields that have been changed/have values
      const updateData: GradeUpdate = {};
      
      if (formData.min_percentage) {
        const minPct = parseFloat(formData.min_percentage);
        if (!isNaN(minPct) && minPct >= 0 && minPct <= 100) {
          updateData.min_percentage = minPct;
        }
      }
      if (formData.max_percentage) {
        const maxPct = parseFloat(formData.max_percentage);
        if (!isNaN(maxPct) && maxPct >= 0 && maxPct <= 100) {
          updateData.max_percentage = maxPct;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        onSubmit({
          gradeCode: editingGrade.grade,
          data: updateData
        });
      }
    } else {
      if (!formData.grade || !formData.min_percentage || !formData.max_percentage) return;
      
      const minPct = parseFloat(formData.min_percentage);
      const maxPct = parseFloat(formData.max_percentage);
      
      if (isNaN(minPct) || isNaN(maxPct)) return;
      if (minPct < 0 || minPct > 100 || maxPct < 0 || maxPct > 100) return;
      if (minPct > maxPct) return;
      
      onSubmit({
        grade: formData.grade.trim(),
        min_percentage: minPct,
        max_percentage: maxPct,
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
      title={isEditing ? "Edit Grade" : "Add Grade"}
      description={isEditing ? "Update grade percentage ranges" : "Define grade with percentage ranges"}
      size="MEDIUM"
      onSave={handleSave}
      saveText={isEditing ? "Update Grade" : "Add Grade"}
      cancelText="Cancel"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="grade">Grade Code</Label>
            <Input 
              id="grade" 
              value={formData.grade} 
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })} 
              placeholder="A+, A, B+, B, etc."
              disabled={isEditing}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-1">
                Grade code cannot be changed
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="min_percentage">Min Percentage</Label>
            <Input 
              id="min_percentage" 
              type="number" 
              step="0.01" 
              min="0"
              max="100"
              value={formData.min_percentage} 
              onChange={(e) => setFormData({ ...formData, min_percentage: e.target.value })} 
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="max_percentage">Max Percentage</Label>
            <Input 
              id="max_percentage" 
              type="number" 
              step="0.01" 
              min="0"
              max="100"
              value={formData.max_percentage} 
              onChange={(e) => setFormData({ ...formData, max_percentage: e.target.value })} 
              placeholder="100.00"
            />
          </div>
        </div>
        {formData.min_percentage && formData.max_percentage && (
          <div className="text-sm text-muted-foreground">
            Range: {formData.min_percentage}% - {formData.max_percentage}%
          </div>
        )}
      </div>
    </FormDialog>
  );
};

export default GradeFormDialog;

