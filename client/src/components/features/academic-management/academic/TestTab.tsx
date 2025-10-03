import { useState } from "react";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export interface TestTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tests: any[];
  setTests: (tests: any[]) => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const TestTab = ({
  searchTerm,
  setSearchTerm,
  tests,
  setTests,
  isLoading = false,
  hasError = false,
  errorMessage,
}: TestTabProps) => {
  // Using tests from parent
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [newTest, setNewTest] = useState({
    test_name: "",
    test_date: "",
    pass_marks: "",
    max_marks: "",
  });
  const [editTest, setEditTest] = useState({
    test_name: "",
    test_date: "",
    pass_marks: "",
    max_marks: "",
  });
  
  const { toast } = useToast();

  const handleAddTest = () => {
    const newId = Math.max(...tests.map((t) => t.id)) + 1;
    const test = {
      id: newId,
      test_name: newTest.test_name,
      test_date: newTest.test_date,
      pass_marks: parseInt(newTest.pass_marks || "0"),
      max_marks: parseInt(newTest.max_marks || "0"),
    };

    setTests([...tests, test]);
    setNewTest({
      test_name: "",
      test_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddTestOpen(false);
    toast({
      title: "Success",
      description: "Test added successfully",
    });
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setEditTest({
      test_name: test.test_name,
      test_date: test.test_date,
      pass_marks: test.pass_marks.toString(),
      max_marks: test.max_marks.toString(),
    });
    setIsEditTestOpen(true);
  };

  const handleUpdateTest = () => {
    if (selectedTest) {
      const updatedTests = tests.map((test) =>
        test.id === selectedTest.id
          ? {
              ...test,
              test_name: editTest.test_name,
              test_date: editTest.test_date,
              pass_marks: parseInt(editTest.pass_marks || "0"),
              max_marks: parseInt(editTest.max_marks || "0"),
            }
          : test
      );
      setTests(updatedTests);
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
    }
    setEditTest({
      test_name: "",
      test_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setSelectedTest(null);
    setIsEditTestOpen(false);
  };

  const handleDeleteTest = (test: any) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTest = () => {
    if (selectedTest) {
      const updatedTests = tests.filter((test) => test.id !== selectedTest.id);
      setTests(updatedTests);
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
    }
    setSelectedTest(null);
    setIsDeleteDialogOpen(false);
  };


  const filteredTests = (tests || []).filter(
    (test) =>
      test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">{filteredTests.length} Tests</Badge>
        </div>
        
        
        <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Test</DialogTitle>
              <DialogDescription>
                Create a new test or quiz
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_name">Test Name</Label>
                  <Input
                    id="test_name"
                    value={newTest.test_name}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        test_name: e.target.value,
                      })
                    }
                    placeholder="Mathematics Unit Test 1"
                  />
                </div>
                <div>
                  <Label htmlFor="test_date">Test Date</Label>
                  <Input
                    id="test_date"
                    type="date"
                    value={newTest.test_date}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        test_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pass_marks">Pass Marks</Label>
                  <Input
                    id="pass_marks"
                    type="number"
                    value={newTest.pass_marks}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        pass_marks: e.target.value,
                      })
                    }
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="max_marks">Max Marks</Label>
                  <Input
                    id="max_marks"
                    type="number"
                    value={newTest.max_marks}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        max_marks: e.target.value,
                      })
                    }
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddTestOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTest}>Add Test</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests Table View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading tests...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="border rounded-md p-4 text-sm bg-amber-50 text-amber-800">
          Could not load tests{errorMessage ? `: ${errorMessage}` : ''}.
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tests found</h3>
          <p className="text-slate-500 mb-4">Get started by creating your first test.</p>
          <Button onClick={() => setIsAddTestOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Test
          </Button>
        </div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
          <CardDescription>Complete list of tests and quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pass Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{test.id}</TableCell>
                  <TableCell className="font-medium">{test.test_name}</TableCell>
                  <TableCell>{new Date(test.test_date || '').toLocaleDateString()}</TableCell>
                  <TableCell>{test.pass_marks}</TableCell>
                  <TableCell>{test.max_marks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTest(test)}
                        title="Edit test"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTest(test)}
                        title="Delete test"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Edit Test Dialog */}
      <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>
              Update the test information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-test-name">Test Name</Label>
              <Input
                id="edit-test-name"
                value={editTest.test_name}
                onChange={(e) => setEditTest({ ...editTest, test_name: e.target.value })}
                placeholder="Enter test name"
              />
            </div>
            <div>
              <Label htmlFor="edit-test-date">Test Date</Label>
              <Input
                id="edit-test-date"
                type="date"
                value={editTest.test_date}
                onChange={(e) => setEditTest({ ...editTest, test_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-pass-marks">Pass Marks</Label>
              <Input
                id="edit-pass-marks"
                type="number"
                value={editTest.pass_marks}
                onChange={(e) => setEditTest({ ...editTest, pass_marks: e.target.value })}
                placeholder="Enter pass marks"
              />
            </div>
            <div>
              <Label htmlFor="edit-max-marks">Max Marks</Label>
              <Input
                id="edit-max-marks"
                type="number"
                value={editTest.max_marks}
                onChange={(e) => setEditTest({ ...editTest, max_marks: e.target.value })}
                placeholder="Enter max marks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTest}>
              Update Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test "{selectedTest?.test_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTest}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
