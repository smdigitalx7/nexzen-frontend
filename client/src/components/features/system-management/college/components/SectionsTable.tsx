import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, Users, Building2 } from "lucide-react";
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
import { SectionRead } from "@/lib/types/college";

interface SectionsTableProps {
  sections: SectionRead[];
  isLoading: boolean;
  onAddSection: () => void;
  onEditSection: (section: SectionRead) => void;
  onDeleteSection: (id: number) => void;
  onViewSection: (section: SectionRead) => void;
}

export const SectionsTable = ({
  sections,
  isLoading,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onViewSection,
}: SectionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionToDelete, setSectionToDelete] = useState<SectionRead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-red-100 text-red-800 border-red-200";
    if (percentage >= 75) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const filteredSections = sections.filter((section) => {
    const searchMatch = searchTerm === "" || 
      section.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.combination_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const handleDeleteClick = (section: SectionRead) => {
    setSectionToDelete(section);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (sectionToDelete) {
      onDeleteSection(sectionToDelete.id);
      setShowDeleteDialog(false);
      setSectionToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading sections...</CardTitle>
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
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddSection} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sections ({filteredSections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Combination</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sections found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        Section {section.section_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{section.combination_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {section.group_name} - {section.course_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {section.current_strength}/{section.max_capacity}
                            </span>
                          </div>
                          <Badge className={getCapacityColor(section.current_strength, section.max_capacity)}>
                            {Math.round((section.current_strength / section.max_capacity) * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${(section.current_strength / section.max_capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {section.academic_year}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(section.active)}>
                          {section.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewSection(section)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditSection(section)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(section)}
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
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "Section {sectionToDelete?.section_name}"? 
              This action cannot be undone and will affect all students in this section.
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
