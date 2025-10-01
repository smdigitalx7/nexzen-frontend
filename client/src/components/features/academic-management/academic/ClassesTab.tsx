import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateClass } from '@/lib/hooks/useSchool';

interface ClassesTabProps {
  classesWithSubjects: any[];
  allSectionsData: Record<number, any[]>;
  classesLoading: boolean;
  classesWithSubjectsLoading: boolean;
  sectionsLoading: boolean;
  currentBranch: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const ClassesTab = memo(({
  classesWithSubjects,
  allSectionsData,
  classesLoading,
  classesWithSubjectsLoading,
  sectionsLoading,
  currentBranch,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: ClassesTabProps) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClass, setNewClass] = useState({ class_name: "" });
  const createClassMutation = useCreateClass();

  const handleAddClass = () => {
    if (!newClass.class_name.trim()) {
      console.error("Class name is required");
      return;
    }

    createClassMutation.mutate({
      class_name: newClass.class_name.trim(),
    });

    setNewClass({ class_name: "" });
    setIsAddClassOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            {
              classesWithSubjects.filter((c) =>
                c.class_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ).length
            }{" "}
            Classes
          </Badge>
        </div>
        <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
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
                  value={newClass.class_name}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      class_name: e.target.value,
                    })
                  }
                  placeholder="e.g., Grade 10-A"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddClassOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddClass}
                disabled={createClassMutation.isPending}
              >
                {createClassMutation.isPending ? "Adding..." : "Add Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {classesLoading || classesWithSubjectsLoading || sectionsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading classes...</p>
          </div>
        </div>
      ) : classesWithSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
          <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-600 mb-4">No classes found.</p>
          <Button className="gap-2" onClick={() => setIsAddClassOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hasError && (
            <div className="md:col-span-2 lg:col-span-3 border rounded-md p-3 text-sm bg-amber-50 text-amber-800">
              We couldn’t load some details. {errorMessage ? `(${errorMessage})` : ''} Showing available data.
            </div>
          )}
          {(classesWithSubjects && classesWithSubjects.length > 0 ? classesWithSubjects : [])
            .filter((c) =>
              c.class_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((classItem, index) => (
            <motion.div
              key={classItem.class_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {/^\d+$/.test((classItem.class_name || '').toString())
                            ? `Class ${classItem.class_name}`
                            : classItem.class_name}
                        </CardTitle>
                        <CardDescription>
                          ID: {classItem.class_id}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">No additional details available.</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});
