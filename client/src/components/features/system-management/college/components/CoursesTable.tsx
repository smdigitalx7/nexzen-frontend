import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, GraduationCap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseRead } from "@/lib/types/college";

interface CoursesTableProps {
  courses: CourseRead[];
  isLoading: boolean;
  onAddCourse: () => void;
  onEditCourse: (course: CourseRead) => void;
  onDeleteCourse: (id: number) => void;
  onViewCourse: (course: CourseRead) => void;
  formatCurrency: (amount: number) => string;
}

export const CoursesTable = ({
  courses,
  isLoading,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
  formatCurrency,
}: CoursesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<CourseRead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const filteredCourses = courses.filter((course) => {
    const searchMatch = searchTerm === "" || 
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const handleDeleteClick = (course: CourseRead) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      onDeleteCourse(courseToDelete.id);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading courses...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddCourse} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Courses ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.course_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {course.course_code}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {course.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(course.course_fee)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          {course.students_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(course.active)}>
                          {course.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCourse(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "{courseToDelete?.course_name}"? 
              This action cannot be undone and will affect all related combinations and sections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
