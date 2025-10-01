import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  School,
  GraduationCap,
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

// Mock data for institutes and branches
const mockInstitutes = [
  {
    id: 1,
    name: "ABC Education Trust",
    created_date: "2020-01-15",
    active: true,
    contact_email: "admin@abceducation.com",
    contact_phone: "+91-9876543210",
    address: "123 Education Street, City Center, State 123456",
    total_branches: 4,
    total_students: 3247,
    total_employees: 287,
  },
  {
    id: 2,
    name: "XYZ Learning Foundation",
    created_date: "2018-06-20",
    active: true,
    contact_email: "info@xyzlearning.org",
    contact_phone: "+91-9876543211",
    address: "456 Learning Avenue, North District, State 123456",
    total_branches: 2,
    total_students: 1856,
    total_employees: 156,
  },
  {
    id: 3,
    name: "Global Education Society",
    created_date: "2022-03-10",
    active: false,
    contact_email: "contact@globaledu.org",
    contact_phone: "+91-9876543212",
    address: "789 Global Plaza, South Zone, State 123456",
    total_branches: 1,
    total_students: 642,
    total_employees: 45,
  },
];

const mockBranches = [
  {
    id: 1,
    institute_id: 1,
    branch_name: "Main Campus",
    branch_type: "school",
    address: "123 Education Street, City Center",
    contact_phone: "+91-9876543210",
    contact_email: "main@abceducation.com",
    active: true,
    students: 1247,
    employees: 98,
  },
  {
    id: 2,
    institute_id: 1,
    branch_name: "North Branch",
    branch_type: "school",
    address: "456 North Avenue, North District",
    contact_phone: "+91-9876543211",
    contact_email: "north@abceducation.com",
    active: true,
    students: 856,
    employees: 67,
  },
  {
    id: 3,
    institute_id: 1,
    branch_name: "Science College",
    branch_type: "college",
    address: "789 Science Park, Tech Zone",
    contact_phone: "+91-9876543212",
    contact_email: "science@abceducation.com",
    active: true,
    students: 642,
    employees: 78,
  },
  {
    id: 4,
    institute_id: 1,
    branch_name: "Evening College",
    branch_type: "college",
    address: "321 Evening Plaza, Business District",
    contact_phone: "+91-9876543213",
    contact_email: "evening@abceducation.com",
    active: true,
    students: 502,
    employees: 44,
  },
];

const InstituteManagement = () => {
  const { user } = useAuthStore();
  const [institutes, setInstitutes] = useState(mockInstitutes);
  const [branches, setBranches] = useState(mockBranches);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [isAddInstituteOpen, setIsAddInstituteOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newInstitute, setNewInstitute] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [newBranch, setNewBranch] = useState({
    institute_id: "",
    branch_name: "",
    branch_type: "",
    address: "",
    contact_phone: "",
    contact_email: "",
  });

  const filteredInstitutes = institutes.filter(
    (institute) =>
      institute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institute.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInstituteBranches = (instituteId: number) => {
    return branches.filter((branch) => branch.institute_id === instituteId);
  };

  const getBranchTypeIcon = (type: string) => {
    return type === "school" ? (
      <School className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const handleAddInstitute = () => {
    const newId = Math.max(...institutes.map((i) => i.id)) + 1;
    const institute = {
      id: newId,
      ...newInstitute,
      created_date: new Date().toISOString().split("T")[0],
      active: true,
      total_branches: 0,
      total_students: 0,
      total_employees: 0,
    };
    setInstitutes([...institutes, institute]);
    setNewInstitute({
      name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
    });
    setIsAddInstituteOpen(false);
  };

  const handleAddBranch = () => {
    const newId = Math.max(...branches.map((b) => b.id)) + 1;
    const branch = {
      id: newId,
      ...newBranch,
      institute_id: parseInt(newBranch.institute_id),
      active: true,
      students: 0,
      employees: 0,
    };
    setBranches([...branches, branch]);
    setNewBranch({
      institute_id: "",
      branch_name: "",
      branch_type: "",
      address: "",
      contact_phone: "",
      contact_email: "",
    });
    setIsAddBranchOpen(false);
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
            Institute Management
          </h1>
          <p className="text-muted-foreground">
            Manage institutes, branches, and organizational structure
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogDescription>
                  Create a new branch for an existing institute
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="institute">Institute</Label>
                  <Select
                    value={newBranch.institute_id}
                    onValueChange={(value) =>
                      setNewBranch({ ...newBranch, institute_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutes.map((institute) => (
                        <SelectItem
                          key={institute.id}
                          value={institute.id.toString()}
                        >
                          {institute.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="branch_name">Branch Name</Label>
                  <Input
                    id="branch_name"
                    value={newBranch.branch_name}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        branch_name: e.target.value,
                      })
                    }
                    placeholder="Enter branch name"
                  />
                </div>
                <div>
                  <Label htmlFor="branch_type">Branch Type</Label>
                  <Select
                    value={newBranch.branch_type}
                    onValueChange={(value) =>
                      setNewBranch({ ...newBranch, branch_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newBranch.address}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, address: e.target.value })
                    }
                    placeholder="Enter branch address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      id="contact_phone"
                      value={newBranch.contact_phone}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          contact_phone: e.target.value,
                        })
                      }
                      placeholder="+91-9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={newBranch.contact_email}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          contact_email: e.target.value,
                        })
                      }
                      placeholder="branch@institute.com"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddBranchOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddBranch}>Add Branch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isAddInstituteOpen}
            onOpenChange={setIsAddInstituteOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Institute
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Institute</DialogTitle>
                <DialogDescription>
                  Register a new educational institute in the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Institute Name</Label>
                  <Input
                    id="name"
                    value={newInstitute.name}
                    onChange={(e) =>
                      setNewInstitute({ ...newInstitute, name: e.target.value })
                    }
                    placeholder="Enter institute name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newInstitute.contact_email}
                    onChange={(e) =>
                      setNewInstitute({
                        ...newInstitute,
                        contact_email: e.target.value,
                      })
                    }
                    placeholder="admin@institute.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={newInstitute.contact_phone}
                    onChange={(e) =>
                      setNewInstitute({
                        ...newInstitute,
                        contact_phone: e.target.value,
                      })
                    }
                    placeholder="+91-9876543210"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newInstitute.address}
                    onChange={(e) =>
                      setNewInstitute({
                        ...newInstitute,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter institute address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddInstituteOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddInstitute}>Add Institute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search institutes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Badge variant="outline">
                {filteredInstitutes.length} Institutes
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Institutes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredInstitutes.map((institute, index) => (
          <motion.div
            key={institute.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {institute.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {institute.contact_email}
                        <Phone className="h-3 w-3 ml-2" />
                        {institute.contact_phone}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={institute.active ? "default" : "secondary"}>
                      {institute.active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {institute.total_branches}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Branches
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {institute.total_students}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Students
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {institute.total_employees}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Employees
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Date(institute.created_date).getFullYear()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Established
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {institute.address}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Global Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>
              Fees, Academic Years, Holidays, Users & Roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fees">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="fees">Fee Templates</TabsTrigger>
                <TabsTrigger value="years">Academic Years</TabsTrigger>
                <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
                <TabsTrigger value="roles">Users & Roles</TabsTrigger>
              </TabsList>
              <TabsContent value="fees" className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Class-wise, term-wise, and book fee templates
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Class 8</div>
                    <div className="text-sm">
                      Books: ₹4500 • Term1: ₹7800 • Term2: ₹7800 • Term3: ₹7900
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Class 9</div>
                    <div className="text-sm">
                      Books: ₹4000 • Term1: ₹8700 • Term2: ₹8700 • Term3: ₹8600
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="years" className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Manage academic years
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">2024-2025</Badge>
                  <Badge>2025-2026</Badge>
                </div>
              </TabsContent>
              <TabsContent value="holidays" className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Holiday list
                </div>
                <ul className="list-disc ml-6 text-sm">
                  <li>15 Aug - Independence Day</li>
                  <li>02 Oct - Gandhi Jayanti</li>
                </ul>
              </TabsContent>
              <TabsContent value="roles" className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Assign users and roles; enforce unique credentials per role
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Full access
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Accountant</div>
                    <div className="text-xs text-muted-foreground">
                      Finance & Admissions
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Academic</div>
                    <div className="text-xs text-muted-foreground">
                      Academic Records
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branches Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Branches</CardTitle>
            <CardDescription>
              Complete list of all branches across institutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Institute</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => {
                  const institute = institutes.find(
                    (i) => i.id === branch.institute_id
                  );
                  return (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        {branch.branch_name}
                      </TableCell>
                      <TableCell>{institute?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBranchTypeIcon(branch.branch_type)}
                          <span className="capitalize">
                            {branch.branch_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{branch.students}</TableCell>
                      <TableCell>{branch.employees}</TableCell>
                      <TableCell>
                        <Badge
                          variant={branch.active ? "default" : "secondary"}
                        >
                          {branch.active ? "Active" : "Inactive"}
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
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InstituteManagement;
