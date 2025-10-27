import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClassTeachers, useCreateClassTeacher, useDeleteClassTeacher } from "@/lib/hooks/school/use-teacher-class-subjects";
import { useEmployeesByBranch } from "@/lib/hooks/general/useEmployees";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass } from "@/lib/hooks/school/use-school-sections";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ClassTeacherTab = () => {
  const { data: classTeachers = [], isLoading: assignmentsLoading } = useClassTeachers();
  const createClassTeacherMutation = useCreateClassTeacher();
  const deleteClassTeacherMutation = useDeleteClassTeacher();
  const { data: allEmployees = [] } = useEmployeesByBranch();
  const { data: classes = [] } = useSchoolClasses();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const { data: sections = [] } = useSchoolSectionsByClass(
    selectedClassId ? parseInt(selectedClassId) : null
  );

  const resetForm = () => {
    setSelectedTeacherId("");
    setSelectedClassId("");
    setSelectedSectionId("");
  };

  const handleAddClick = () => {
    setIsAddOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!selectedTeacherId || !selectedClassId) {
      toast({
        title: "Validation Error",
        description: "Please select teacher and class",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClassTeacherMutation.mutateAsync({
        teacher_id: parseInt(selectedTeacherId),
        class_id: parseInt(selectedClassId),
        ...(selectedSectionId && { section_id: parseInt(selectedSectionId) }),
      });

      resetForm();
      setIsAddOpen(false);
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  const handleDelete = async (ct: any) => {
    try {
      await deleteClassTeacherMutation.mutateAsync({
        class_id: ct.class_id,
        ...(ct.section_id && { section_id: ct.section_id }),
      });
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-green-700">Class Teacher Assignments</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200">
            {classTeachers.length} {classTeachers.length === 1 ? 'Class Teacher' : 'Class Teachers'}
          </Badge>
          <Button
            onClick={handleAddClick}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Assign Subject
          </Button>
        </div>
      </div>
      <div className="border-t pt-4">
        {assignmentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading class teachers...</p>
            </div>
          </div>
        ) : classTeachers.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No class teacher assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Teacher</TableHead>
                  <TableHead className="font-medium">Class</TableHead>
                  <TableHead className="font-medium">Section</TableHead>
                  <TableHead className="w-[100px] text-center font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classTeachers.map((ct: any) => (
                  <TableRow key={`${ct.teacher_id}-${ct.class_id}-${ct.section_id}`} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <span className="font-semibold">{ct.teacher_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-700">{ct.class_name}</span>
                    </TableCell>
                    <TableCell>
                      <span>{ct.section_name}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleDelete(ct)}
                        title={`Remove class teacher for ${ct.class_name}${ct.section_name ? ` - ${ct.section_name}` : ''}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        title="Assign Class Teacher"
        description="Assign a teacher as class teacher for a class"
        onSave={handleFormSubmit}
        onCancel={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        saveText="Assign Class Teacher"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((teacher: any) => (
                  <SelectItem key={teacher.employee_id} value={teacher.employee_id.toString()}>
                    {teacher.employee_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <Select 
              value={selectedClassId} 
              onValueChange={(value) => {
                setSelectedClassId(value);
                setSelectedSectionId(""); // Reset section when class changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                    {classItem.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <Select 
              value={selectedSectionId} 
              onValueChange={setSelectedSectionId}
              disabled={!selectedClassId || sections.length === 0}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    !selectedClassId 
                      ? "Select class first" 
                      : sections.length === 0 
                        ? "No sections available" 
                        : "Select section (optional)"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.section_id} value={section.section_id.toString()}>
                    {section.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sections.length === 0 && selectedClassId && (
              <p className="text-sm text-muted-foreground">
                This class has no sections
              </p>
            )}
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

