import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Edit, Eye, Trash2, Grid3X3, List } from "lucide-react";
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

// Mock data for tests
const mockTests = [
  {
    id: 1,
    test_name: "Mathematics Unit Test 1",
    test_type: "Unit Test",
    subject: "Mathematics",
    class_name: "Class 8",
    max_marks: 50,
    duration: 60,
    date: "2024-10-15",
    status: "scheduled",
    students_count: 35,
  },
  {
    id: 2,
    test_name: "Science Quiz",
    test_type: "Quiz",
    subject: "Science",
    class_name: "Class 9",
    max_marks: 25,
    duration: 30,
    date: "2024-10-20",
    status: "completed",
    students_count: 40,
  },
  {
    id: 3,
    test_name: "English Literature Test",
    test_type: "Chapter Test",
    subject: "English",
    class_name: "Class 10",
    max_marks: 40,
    duration: 45,
    date: "2024-10-25",
    status: "ongoing",
    students_count: 38,
  },
];

export interface TestTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBranchType: string;
  setSelectedBranchType: (type: string) => void;
  currentBranch: any;
  tests: any[];
  setTests: (tests: any[]) => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const TestTab = ({
  searchTerm,
  setSearchTerm,
  selectedBranchType,
  setSelectedBranchType,
  currentBranch,
  tests,
  setTests,
  isLoading = false,
  hasError = false,
  errorMessage,
}: TestTabProps) => {
  // Using tests from parent
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [newTest, setNewTest] = useState({
    test_name: "",
    test_type: "",
    subject: "",
    class_name: "",
    max_marks: "",
    duration: "",
    date: "",
  });

  const handleAddTest = () => {
    const newId = Math.max(...tests.map((t) => t.id)) + 1;
    const test = {
      id: newId,
      test_name: newTest.test_name,
      test_type: newTest.test_type,
      subject: newTest.subject,
      class_name: newTest.class_name,
      max_marks: parseInt(newTest.max_marks || "0"),
      duration: parseInt(newTest.duration || "0"),
      date: newTest.date,
      status: "scheduled",
      students_count: 0,
    };

    setTests([...tests, test]);
    setNewTest({
      test_name: "",
      test_type: "",
      subject: "",
      class_name: "",
      max_marks: "",
      duration: "",
      date: "",
    });
    setIsAddTestOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTests = (tests || []).filter(
    (test) =>
      test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // subject/class not available from backend; filter by name only
      false
  );

  const tableRows = isLoading ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-6 text-slate-500">Loading tests...</TableCell>
    </TableRow>
  ) : filteredTests.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-6 text-slate-500">
        {isLoading ? 'Loading tests...' : 'No tests found. Click "Add Test" to create your first test.'}
      </TableCell>
    </TableRow>
  ) : (
    <>
      {filteredTests.map((test) => (
        <TableRow key={test.id}>
          <TableCell className="font-medium">
            {test.test_name}
          </TableCell>
          <TableCell>
            <Badge variant="outline">Test</Badge>
          </TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>
            {new Date(test.test_date || '').toLocaleDateString()}
          </TableCell>
          <TableCell>{test.max_marks}</TableCell>
          <TableCell><Badge variant="outline">Scheduled</Badge></TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
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
          <Select
            value={selectedBranchType}
            onValueChange={setSelectedBranchType}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Branch Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="college">College</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{filteredTests.length} Tests</Badge>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Table
          </Button>
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
                  <Label htmlFor="test_type">Test Type</Label>
                  <Select
                    value={newTest.test_type}
                    onValueChange={(value) =>
                      setNewTest({ ...newTest, test_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unit Test">Unit Test</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Chapter Test">Chapter Test</SelectItem>
                      <SelectItem value="Mock Test">Mock Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTest.subject}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="class_name">Class</Label>
                  <Input
                    id="class_name"
                    value={newTest.class_name}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        class_name: e.target.value,
                      })
                    }
                    placeholder="Class 8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTest.duration}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        duration: e.target.value,
                      })
                    }
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Test Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTest.date}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        date: e.target.value,
                      })
                    }
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

      {/* Tests Grid View */}
      {viewMode === 'grid' && (
        <>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {test.test_name}
                      </CardTitle>
                      <CardDescription>Test</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(test.test_date || '').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marks:</span>
                    <span className="font-medium">{test.pass_marks}/{test.max_marks}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
          )}
        </>
      )}

      {/* Tests Table View */}
      {viewMode === 'table' && (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">Loading tests...</TableCell>
                </TableRow>
              ) : filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                    {isLoading ? 'Loading tests...' : 'No tests found. Click "Add Test" to create your first test.'}
                  </TableCell>
                </TableRow>
              ) : (
              filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{test.id}</TableCell>
                  <TableCell className="font-medium">{test.test_name}</TableCell>
                  <TableCell>{new Date(test.test_date || '').toLocaleDateString()}</TableCell>
                  <TableCell>{test.pass_marks}</TableCell>
                  <TableCell>{test.max_marks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
