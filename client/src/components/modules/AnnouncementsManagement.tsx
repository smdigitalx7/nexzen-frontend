import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Megaphone,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Send,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";

// Mock data for announcements
const mockAnnouncements = [
  {
    id: 1,
    title: "Sports Day Celebration",
    message:
      "Annual Sports Day will be held on February 15, 2025. All students are required to participate. Parents are invited to attend.",
    category: "holiday",
    priority: "high",
    target_audience: "all_classes",
    target_transport: null,
    created_date: "2025-01-15",
    created_by: "Principal",
    status: "active",
    branch_id: 1,
    branch_name: "Main Campus",
  },
  {
    id: 2,
    title: "Route Change Notice",
    message:
      "Bus Route R003 will have a temporary route change due to road construction. New pickup time is 7:30 AM instead of 7:15 AM.",
    category: "transport",
    priority: "medium",
    target_audience: null,
    target_transport: "R003",
    created_date: "2025-01-14",
    created_by: "Transport Manager",
    status: "active",
    branch_id: 1,
    branch_name: "Main Campus",
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    message:
      "Parent-Teacher meetings for Classes 6-10 will be held on January 25, 2025 from 9:00 AM to 12:00 PM.",
    category: "general",
    priority: "medium",
    target_audience: "classes_6_10",
    target_transport: null,
    created_date: "2025-01-12",
    created_by: "Academic Head",
    status: "active",
    branch_id: 1,
    branch_name: "Main Campus",
  },
  {
    id: 4,
    title: "Holiday Notice - Republic Day",
    message:
      "School will remain closed on January 26, 2025 on account of Republic Day. Classes will resume on January 27, 2025.",
    category: "holiday",
    priority: "high",
    target_audience: "all_classes",
    target_transport: null,
    created_date: "2025-01-10",
    created_by: "Principal",
    status: "active",
    branch_id: 1,
    branch_name: "Main Campus",
  },
  {
    id: 5,
    title: "Fee Payment Reminder",
    message:
      "This is a reminder that the second term fee payment is due by January 31, 2025. Please ensure timely payment to avoid late fees.",
    category: "general",
    priority: "medium",
    target_audience: "all_classes",
    target_transport: null,
    created_date: "2025-01-08",
    created_by: "Accountant",
    status: "active",
    branch_id: 1,
    branch_name: "Main Campus",
  },
];

const mockClasses = [
  "Nursery",
  "J.K.G",
  "S.K.G",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
];

const mockTransportRoutes = [
  "R001-City Center",
  "R002-North District",
  "R003-South Zone",
  "R004-East Park",
];

const AnnouncementsManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    category: "",
    priority: "",
    target_audience: "",
    target_transport: "",
    selected_classes: [] as string[],
    selected_routes: [] as string[],
  });

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || announcement.category === selectedCategory;
    const matchesPriority =
      selectedPriority === "all" || announcement.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "holiday":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "transport":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAddAnnouncement = () => {
    const newId = Math.max(...announcements.map((a) => a.id)) + 1;
    const announcement = {
      id: newId,
      ...newAnnouncement,
      target_audience:
        newAnnouncement.selected_classes.length > 0
          ? newAnnouncement.selected_classes.join(",")
          : newAnnouncement.target_audience,
      target_transport:
        newAnnouncement.selected_routes.length > 0
          ? newAnnouncement.selected_routes.join(",")
          : newAnnouncement.target_transport,
      created_date: new Date().toISOString().split("T")[0],
      created_by: user?.full_name || "Admin",
      status: "active",
      branch_id: currentBranch?.branch_id || 1,
      branch_name: currentBranch?.branch_name || "Main Campus",
    };
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      title: "",
      message: "",
      category: "",
      priority: "",
      target_audience: "",
      target_transport: "",
      selected_classes: [],
      selected_routes: [],
    });
    setIsAddAnnouncementOpen(false);
  };

  const handleClassToggle = (className: string) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      selected_classes: prev.selected_classes.includes(className)
        ? prev.selected_classes.filter((c) => c !== className)
        : [...prev.selected_classes, className],
    }));
  };

  const handleRouteToggle = (route: string) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      selected_routes: prev.selected_routes.includes(route)
        ? prev.selected_routes.filter((r) => r !== route)
        : [...prev.selected_routes, route],
    }));
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
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage institutional communications and notices
          </p>
        </div>
        <Dialog
          open={isAddAnnouncementOpen}
          onOpenChange={setIsAddAnnouncementOpen}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create and send announcements to students, parents, or specific
                groups
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newAnnouncement.message}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter announcement message"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newAnnouncement.category}
                    onValueChange={(value) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newAnnouncement.priority}
                    onValueChange={(value) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Target Audience</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all_classes"
                      checked={
                        newAnnouncement.target_audience === "all_classes"
                      }
                      onCheckedChange={(checked) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          target_audience: checked ? "all_classes" : "",
                        })
                      }
                    />
                    <Label htmlFor="all_classes">All Classes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="specific_classes"
                      checked={newAnnouncement.selected_classes.length > 0}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setNewAnnouncement({
                            ...newAnnouncement,
                            selected_classes: [],
                          });
                        }
                      }}
                    />
                    <Label htmlFor="specific_classes">Specific Classes</Label>
                  </div>
                  {newAnnouncement.selected_classes.length > 0 && (
                    <div className="ml-6 grid grid-cols-3 gap-2">
                      {mockClasses.map((className) => (
                        <div
                          key={className}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`class_${className}`}
                            checked={newAnnouncement.selected_classes.includes(
                              className
                            )}
                            onCheckedChange={() => handleClassToggle(className)}
                          />
                          <Label
                            htmlFor={`class_${className}`}
                            className="text-sm"
                          >
                            Class {className}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Transport Routes</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all_routes"
                      checked={
                        newAnnouncement.target_transport === "all_routes"
                      }
                      onCheckedChange={(checked) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          target_transport: checked ? "all_routes" : "",
                        })
                      }
                    />
                    <Label htmlFor="all_routes">All Routes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="specific_routes"
                      checked={newAnnouncement.selected_routes.length > 0}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setNewAnnouncement({
                            ...newAnnouncement,
                            selected_routes: [],
                          });
                        }
                      }}
                    />
                    <Label htmlFor="specific_routes">Specific Routes</Label>
                  </div>
                  {newAnnouncement.selected_routes.length > 0 && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {mockTransportRoutes.map((route) => (
                        <div
                          key={route}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`route_${route}`}
                            checked={newAnnouncement.selected_routes.includes(
                              route
                            )}
                            onCheckedChange={() => handleRouteToggle(route)}
                          />
                          <Label htmlFor={`route_${route}`} className="text-sm">
                            {route}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddAnnouncementOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAnnouncement} className="gap-2">
                <Send className="h-4 w-4" />
                Send Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
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
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredAnnouncements.length} Announcements
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Announcements List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {announcement.message}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {getPriorityIcon(announcement.priority)}
                      <span className="ml-1 capitalize">
                        {announcement.priority}
                      </span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getCategoryColor(announcement.category)}
                    >
                      {announcement.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.created_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {announcement.created_by}
                    </div>
                    {announcement.target_audience && (
                      <div className="flex items-center gap-1">
                        <span>
                          Target:{" "}
                          {announcement.target_audience === "all_classes"
                            ? "All Classes"
                            : announcement.target_audience}
                        </span>
                      </div>
                    )}
                    {announcement.target_transport && (
                      <div className="flex items-center gap-1">
                        <span>
                          Routes:{" "}
                          {announcement.target_transport === "all_routes"
                            ? "All Routes"
                            : announcement.target_transport}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Announcement Statistics</CardTitle>
            <CardDescription>Overview of announcement activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {announcements.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Announcements
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {announcements.filter((a) => a.priority === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  High Priority
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {announcements.filter((a) => a.priority === "medium").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Medium Priority
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {announcements.filter((a) => a.priority === "low").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Low Priority
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnnouncementsManagement;


