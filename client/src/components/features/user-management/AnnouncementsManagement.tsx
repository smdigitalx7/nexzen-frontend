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
  Loader2,
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
import { FormDialog, ConfirmDialog } from "@/components/shared";
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
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  type Announcement,
  type AnnouncementCreate,
  type AnnouncementUpdate,
} from "@/lib/hooks/useAnnouncements";
import { useToast } from "@/hooks/use-toast";

const AnnouncementsManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { toast } = useToast();
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [isViewAnnouncementOpen, setIsViewAnnouncementOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
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

  // API Hooks - Fetch all announcements and filter on frontend
  const { data: allAnnouncements = [], isLoading, error } = useAnnouncements({});
  
  // Frontend filtering based on current branch
  const announcements = allAnnouncements.filter(announcement => {
    if (!currentBranch) return true; // Show all if no branch selected
    
    // Filter by branch type and optionally by branch_id if it exists
    const matchesBranchType = announcement.branch_type === currentBranch.branch_type;
    const matchesBranchId = !currentBranch.branch_id || announcement.branch_id === currentBranch.branch_id;
    
    return matchesBranchType && matchesBranchId;
  });
  
  const createAnnouncementMutation = useCreateAnnouncement();
  const updateAnnouncementMutation = useUpdateAnnouncement();
  const deleteAnnouncementMutation = useDeleteAnnouncement();

  // Apply all frontend filters
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || announcement.announcement_type.toLowerCase() === selectedCategory;
    const matchesPriority =
      selectedPriority === "all" || announcement.priority.toLowerCase() === selectedPriority;
    
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

  const handleAddAnnouncement = async () => {
    if (!currentBranch?.branch_id) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!newAnnouncement.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!newAnnouncement.message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }

    if (!newAnnouncement.category) {
      toast({
        title: "Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    if (!newAnnouncement.priority) {
      toast({
        title: "Error",
        description: "Priority is required",
        variant: "destructive",
      });
      return;
    }

    const announcementData: AnnouncementCreate = {
      branch_id: currentBranch.branch_id,
      branch_type: "SCHOOL",
      title: newAnnouncement.title.trim(),
      content: newAnnouncement.message.trim(),
      target_audience: newAnnouncement.target_audience || "ALL",
      class_id: newAnnouncement.selected_classes.length > 0 ? parseInt(newAnnouncement.selected_classes[0]) : undefined,
      bus_route_id: newAnnouncement.selected_routes.length > 0 ? 1 : undefined,
      announcement_type: newAnnouncement.category.toUpperCase(),
      priority: newAnnouncement.priority.toUpperCase(),
    };

    try {
      await createAnnouncementMutation.mutateAsync(announcementData);
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
    } catch (error) {
      // Error handling is done in the mutation hook
    }
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

  // Action button handlers
  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewAnnouncementOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      message: announcement.content,
      category: announcement.announcement_type.toLowerCase(),
      priority: announcement.priority.toLowerCase(),
      target_audience: announcement.target_audience,
      target_transport: announcement.bus_route_id ? "specific_routes" : "",
      selected_classes: announcement.class_id ? [announcement.class_id.toString()] : [],
      selected_routes: announcement.bus_route_id ? ["R001"] : [],
    });
    setIsEditAnnouncementOpen(true);
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await deleteAnnouncementMutation.mutateAsync(selectedAnnouncement.announcement_id);
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement || !currentBranch?.branch_id) return;

    const updateData: AnnouncementUpdate = {
      title: newAnnouncement.title,
      content: newAnnouncement.message,
      target_audience: newAnnouncement.target_audience || "ALL",
      class_id: newAnnouncement.selected_classes.length > 0 ? parseInt(newAnnouncement.selected_classes[0]) : undefined,
      bus_route_id: newAnnouncement.selected_routes.length > 0 ? 1 : undefined,
      announcement_type: newAnnouncement.category.toUpperCase(),
      priority: newAnnouncement.priority.toUpperCase(),
    };

    try {
      await updateAnnouncementMutation.mutateAsync({
        id: selectedAnnouncement.announcement_id,
        data: updateData,
      });
      setIsEditAnnouncementOpen(false);
      setSelectedAnnouncement(null);
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
    } catch (error) {
      // Error handling is done in the mutation hook
    }
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
                      {[].map((className) => (
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
                      {[].map((route) => (
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
              <Button 
                onClick={handleAddAnnouncement} 
                className="gap-2"
                disabled={createAnnouncementMutation.isPending}
              >
                {createAnnouncementMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading announcements...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Server Error</h3>
              <p className="text-red-600 mb-4">{error.message}</p>
              <p className="text-sm text-red-500 mb-4">
                The backend is experiencing issues. Please try again later.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements found</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.announcement_id}
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
                        {announcement.content}
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
                      className={getCategoryColor(announcement.announcement_type)}
                    >
                      {announcement.announcement_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {announcement.created_by || "System"}
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
                    {announcement.bus_route_id && (
                      <div className="flex items-center gap-1">
                        <span>
                          Route ID: {announcement.bus_route_id}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewAnnouncement(announcement)}
                      title="View announcement"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditAnnouncement(announcement)}
                      title="Edit announcement"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteAnnouncement(announcement)}
                      title="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ))
        )}
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

      {/* View Announcement Dialog */}
      <Dialog open={isViewAnnouncementOpen} onOpenChange={setIsViewAnnouncementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-lg font-semibold">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={getCategoryColor(selectedAnnouncement.announcement_type)}>
                    {selectedAnnouncement.announcement_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                    {selectedAnnouncement.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Target Audience</Label>
                <p className="text-sm">{selectedAnnouncement.target_audience}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAnnouncement.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <FormDialog
        open={isEditAnnouncementOpen}
        onOpenChange={setIsEditAnnouncementOpen}
        title="Edit Announcement"
        description="Update the announcement details"
        size="LARGE"
        isLoading={updateAnnouncementMutation.isPending}
        onSave={handleUpdateAnnouncement}
        onCancel={() => setIsEditAnnouncementOpen(false)}
        saveText="Update Announcement"
        cancelText="Cancel"
        disabled={updateAnnouncementMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
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
            <Label htmlFor="edit-message">Message</Label>
            <Textarea
              id="edit-message"
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
              <Label htmlFor="edit-category">Category</Label>
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
              <Label htmlFor="edit-priority">Priority</Label>
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
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Announcement"
        description={
          selectedAnnouncement 
            ? `Are you sure you want to delete "${selectedAnnouncement.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this announcement? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteAnnouncementMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AnnouncementsManagement;
