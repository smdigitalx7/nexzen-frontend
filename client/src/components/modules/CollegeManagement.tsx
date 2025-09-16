import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  Calculator,
  Edit,
  Trash2,
  Eye,
  Building2,
  Award,
  DollarSign,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";

// Mock data for college management
const mockGroups = [
  {
    id: 1,
    group_name: "MPC",
    group_code: "MPC01",
    description: "Mathematics, Physics, Chemistry",
    group_fee: 5000,
    active: true,
    students_count: 45,
  },
  {
    id: 2,
    group_name: "BiPC",
    group_code: "BiPC01",
    description: "Biology, Physics, Chemistry",
    group_fee: 5500,
    active: true,
    students_count: 38,
  },
  {
    id: 3,
    group_name: "CEC",
    group_code: "CEC01",
    description: "Commerce, Economics, Civics",
    group_fee: 4000,
    active: true,
    students_count: 52,
  },
  {
    id: 4,
    group_name: "MEC",
    group_code: "MEC01",
    description: "Mathematics, Economics, Commerce",
    group_fee: 4500,
    active: true,
    students_count: 28,
  },
  {
    id: 5,
    group_name: "HEC",
    group_code: "HEC01",
    description: "History, Economics, Civics",
    group_fee: 3500,
    active: true,
    students_count: 15,
  },
  {
    id: 6,
    group_name: "CCA",
    group_code: "CCA01",
    description: "Commerce, Civics, Accountancy",
    group_fee: 4000,
    active: false,
    students_count: 0,
  },
];

const mockCourses = [
  {
    id: 1,
    course_name: "EAMCET",
    course_code: "EAMCET001",
    description: "Engineering, Agriculture and Medical Common Entrance Test",
    course_fee: 12000,
    active: true,
    students_count: 25,
  },
  {
    id: 2,
    course_name: "JEE_MAINS",
    course_code: "JEE001",
    description: "Joint Entrance Examination - Main",
    course_fee: 15000,
    active: true,
    students_count: 35,
  },
  {
    id: 3,
    course_name: "JEE_ADVANCED",
    course_code: "JEE002",
    description: "Joint Entrance Examination - Advanced",
    course_fee: 18000,
    active: true,
    students_count: 15,
  },
  {
    id: 4,
    course_name: "NEET",
    course_code: "NEET001",
    description: "National Eligibility cum Entrance Test",
    course_fee: 14000,
    active: true,
    students_count: 28,
  },
  {
    id: 5,
    course_name: "BITSAT",
    course_code: "BITSAT001",
    description: "Birla Institute of Technology and Science Admission Test",
    course_fee: 10000,
    active: true,
    students_count: 12,
  },
  {
    id: 6,
    course_name: "NONE",
    course_code: "NONE001",
    description: "No competitive exam preparation",
    course_fee: 0,
    active: true,
    students_count: 45,
  },
];

const mockCombinations = [
  {
    id: 1,
    group_id: 1,
    course_id: 2,
    group_name: "MPC",
    course_name: "JEE_MAINS",
    combination_fee: 20000,
    active: true,
    students_count: 25,
  },
  {
    id: 2,
    group_id: 1,
    course_id: 3,
    group_name: "MPC",
    course_name: "JEE_ADVANCED",
    combination_fee: 23000,
    active: true,
    students_count: 12,
  },
  {
    id: 3,
    group_id: 2,
    course_id: 4,
    group_name: "BiPC",
    course_name: "NEET",
    combination_fee: 19500,
    active: true,
    students_count: 20,
  },
  {
    id: 4,
    group_id: 3,
    course_id: 6,
    group_name: "CEC",
    course_name: "NONE",
    combination_fee: 4000,
    active: true,
    students_count: 35,
  },
  {
    id: 5,
    group_id: 1,
    course_id: 1,
    group_name: "MPC",
    course_name: "EAMCET",
    combination_fee: 17000,
    active: true,
    students_count: 18,
  },
];

const mockSections = [
  {
    id: 1,
    section_name: "A",
    group_course_combination_id: 1,
    combination_name: "MPC + JEE_MAINS",
    current_capacity: 25,
    max_capacity: 30,
    academic_year: "2024-26",
    active: true,
  },
  {
    id: 2,
    section_name: "B",
    group_course_combination_id: 1,
    combination_name: "MPC + JEE_MAINS",
    current_capacity: 20,
    max_capacity: 30,
    academic_year: "2024-26",
    active: true,
  },
  {
    id: 3,
    section_name: "A",
    group_course_combination_id: 3,
    combination_name: "BiPC + NEET",
    current_capacity: 20,
    max_capacity: 25,
    academic_year: "2024-26",
    active: true,
  },
  {
    id: 4,
    section_name: "A",
    group_course_combination_id: 4,
    combination_name: "CEC + NONE",
    current_capacity: 35,
    max_capacity: 40,
    academic_year: "2024-26",
    active: true,
  },
];

const CollegeManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const [groups, setGroups] = useState(mockGroups);
  const [courses, setCourses] = useState(mockCourses);
  const [combinations, setCombinations] = useState(mockCombinations);
  const [sections, setSections] = useState(mockSections);
  const [activeTab, setActiveTab] = useState("groups");
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddCombinationOpen, setIsAddCombinationOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState({
    group_name: "",
    group_code: "",
    description: "",
    group_fee: "",
  });
  const [newCourse, setNewCourse] = useState({
    course_name: "",
    course_code: "",
    description: "",
    course_fee: "",
  });
  const [newCombination, setNewCombination] = useState({
    group_id: "",
    course_id: "",
    combination_fee: "",
  });
  const [newSection, setNewSection] = useState({
    section_name: "",
    group_course_combination_id: "",
    max_capacity: "",
    academic_year: "2024-26",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddGroup = () => {
    const newId = Math.max(...groups.map((g) => g.id)) + 1;
    const group = {
      id: newId,
      ...newGroup,
      group_fee: parseInt(newGroup.group_fee),
      active: true,
      students_count: 0,
    };
    setGroups([...groups, group]);
    setNewGroup({
      group_name: "",
      group_code: "",
      description: "",
      group_fee: "",
    });
    setIsAddGroupOpen(false);
  };

  const handleAddCourse = () => {
    const newId = Math.max(...courses.map((c) => c.id)) + 1;
    const course = {
      id: newId,
      ...newCourse,
      course_fee: parseInt(newCourse.course_fee),
      active: true,
      students_count: 0,
    };
    setCourses([...courses, course]);
    setNewCourse({
      course_name: "",
      course_code: "",
      description: "",
      course_fee: "",
    });
    setIsAddCourseOpen(false);
  };

  const handleAddCombination = () => {
    const newId = Math.max(...combinations.map((c) => c.id)) + 1;
    const group = groups.find(
      (g) => g.id === parseInt(newCombination.group_id)
    );
    const course = courses.find(
      (c) => c.id === parseInt(newCombination.course_id)
    );
    const combination = {
      id: newId,
      group_id: parseInt(newCombination.group_id),
      course_id: parseInt(newCombination.course_id),
      group_name: group?.group_name || "",
      course_name: course?.course_name || "",
      combination_fee: parseInt(newCombination.combination_fee),
      active: true,
      students_count: 0,
    };
    setCombinations([...combinations, combination]);
    setNewCombination({ group_id: "", course_id: "", combination_fee: "" });
    setIsAddCombinationOpen(false);
  };

  const handleAddSection = () => {
    const newId = Math.max(...sections.map((s) => s.id)) + 1;
    const combination = combinations.find(
      (c) => c.id === parseInt(newSection.group_course_combination_id)
    );
    const section = {
      id: newId,
      section_name: newSection.section_name,
      group_course_combination_id: parseInt(
        newSection.group_course_combination_id
      ),
      combination_name: combination
        ? `${combination.group_name} + ${combination.course_name}`
        : "",
      current_capacity: 0,
      max_capacity: parseInt(newSection.max_capacity),
      academic_year: newSection.academic_year,
      active: true,
    };
    setSections([...sections, section]);
    setNewSection({
      section_name: "",
      group_course_combination_id: "",
      max_capacity: "",
      academic_year: "2024-26",
    });
    setIsAddSectionOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            College Management
          </h1>
          <p className="text-muted-foreground">
            Manage groups, courses, combinations, and sections for intermediate
            education
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="combinations">Combinations</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    groups.filter((g) =>
                      g.group_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Groups
                </Badge>
              </div>
              <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Group</DialogTitle>
                    <DialogDescription>
                      Create a new subject group for intermediate education
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group_name">Group Name</Label>
                      <Input
                        id="group_name"
                        value={newGroup.group_name}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            group_name: e.target.value,
                          })
                        }
                        placeholder="e.g., MPC, BiPC, CEC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group_code">Group Code</Label>
                      <Input
                        id="group_code"
                        value={newGroup.group_code}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            group_code: e.target.value,
                          })
                        }
                        placeholder="e.g., MPC01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newGroup.description}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            description: e.target.value,
                          })
                        }
                        placeholder="e.g., Mathematics, Physics, Chemistry"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group_fee">Group Fee (₹)</Label>
                      <Input
                        id="group_fee"
                        type="number"
                        value={newGroup.group_fee}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            group_fee: e.target.value,
                          })
                        }
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddGroupOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddGroup}>Add Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups
                .filter((g) =>
                  g.group_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {group.group_name}
                              </CardTitle>
                              <CardDescription>
                                {group.group_code}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={group.active ? "default" : "secondary"}
                          >
                            {group.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(group.group_fee)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Group Fee
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {group.students_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Students
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    courses.filter((c) =>
                      c.course_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Courses
                </Badge>
              </div>
              <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                      Create a new competitive exam preparation course
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course_name">Course Name</Label>
                      <Input
                        id="course_name"
                        value={newCourse.course_name}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            course_name: e.target.value,
                          })
                        }
                        placeholder="e.g., JEE_MAINS, NEET, EAMCET"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course_code">Course Code</Label>
                      <Input
                        id="course_code"
                        value={newCourse.course_code}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            course_code: e.target.value,
                          })
                        }
                        placeholder="e.g., JEE001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCourse.description}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            description: e.target.value,
                          })
                        }
                        placeholder="Course description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course_fee">Course Fee (₹)</Label>
                      <Input
                        id="course_fee"
                        type="number"
                        value={newCourse.course_fee}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            course_fee: e.target.value,
                          })
                        }
                        placeholder="15000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCourseOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCourse}>Add Course</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter((c) =>
                  c.course_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {course.course_name}
                              </CardTitle>
                              <CardDescription>
                                {course.course_code}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={course.active ? "default" : "secondary"}
                          >
                            {course.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(course.course_fee)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Course Fee
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {course.students_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Students
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Combinations Tab */}
          <TabsContent value="combinations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search combinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    combinations.filter(
                      (c) =>
                        c.group_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        c.course_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Combinations
                </Badge>
              </div>
              <Dialog
                open={isAddCombinationOpen}
                onOpenChange={setIsAddCombinationOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Combination
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Combination</DialogTitle>
                    <DialogDescription>
                      Create a new group-course combination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group_id">Group</Label>
                      <Select
                        value={newCombination.group_id}
                        onValueChange={(value) =>
                          setNewCombination({
                            ...newCombination,
                            group_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              {group.group_name} - {group.group_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="course_id">Course</Label>
                      <Select
                        value={newCombination.course_id}
                        onValueChange={(value) =>
                          setNewCombination({
                            ...newCombination,
                            course_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.course_name} - {course.course_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="combination_fee">
                        Combination Fee (₹)
                      </Label>
                      <Input
                        id="combination_fee"
                        type="number"
                        value={newCombination.combination_fee}
                        onChange={(e) =>
                          setNewCombination({
                            ...newCombination,
                            combination_fee: e.target.value,
                          })
                        }
                        placeholder="20000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCombinationOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCombination}>
                      Add Combination
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {combinations
                .filter(
                  (c) =>
                    c.group_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    c.course_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((combination, index) => (
                  <motion.div
                    key={combination.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <Calculator className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {combination.group_name} +{" "}
                                {combination.course_name}
                              </CardTitle>
                              <CardDescription>
                                Combination Package
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={
                              combination.active ? "default" : "secondary"
                            }
                          >
                            {combination.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(combination.combination_fee)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Fee
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {combination.students_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Students
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    sections.filter(
                      (s) =>
                        s.section_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        s.combination_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Sections
                </Badge>
              </div>
              <Dialog
                open={isAddSectionOpen}
                onOpenChange={setIsAddSectionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>
                      Create a new section for a group-course combination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="section_name">Section Name</Label>
                      <Input
                        id="section_name"
                        value={newSection.section_name}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            section_name: e.target.value,
                          })
                        }
                        placeholder="e.g., A, B, C"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group_course_combination_id">
                        Combination
                      </Label>
                      <Select
                        value={newSection.group_course_combination_id}
                        onValueChange={(value) =>
                          setNewSection({
                            ...newSection,
                            group_course_combination_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select combination" />
                        </SelectTrigger>
                        <SelectContent>
                          {combinations.map((combination) => (
                            <SelectItem
                              key={combination.id}
                              value={combination.id.toString()}
                            >
                              {combination.group_name} +{" "}
                              {combination.course_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="max_capacity">Max Capacity</Label>
                      <Input
                        id="max_capacity"
                        type="number"
                        value={newSection.max_capacity}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            max_capacity: e.target.value,
                          })
                        }
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="academic_year">Academic Year</Label>
                      <Input
                        id="academic_year"
                        value={newSection.academic_year}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            academic_year: e.target.value,
                          })
                        }
                        placeholder="2024-26"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSectionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSection}>Add Section</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Combination</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections
                  .filter(
                    (s) =>
                      s.section_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      s.combination_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        {section.section_name}
                      </TableCell>
                      <TableCell>{section.combination_name}</TableCell>
                      <TableCell>{section.academic_year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {section.current_capacity}/{section.max_capacity}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (section.current_capacity /
                                    section.max_capacity) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={section.active ? "default" : "secondary"}
                        >
                          {section.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CollegeManagement;


