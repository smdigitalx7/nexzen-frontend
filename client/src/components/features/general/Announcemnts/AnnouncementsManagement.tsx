import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  type Announcement,
  type AnnouncementCreate,
  type AnnouncementUpdate,
} from "@/lib/hooks/general/useAnnouncements";
import { useToast } from "@/hooks/use-toast";
import AnnouncementsOverview from "./AnnouncementsOverview";
import AnnouncementsFilters from "./AnnouncementsFilters";
import AnnouncementsList from "./AnnouncementsList";
import AnnouncementFormDialog from "./AnnouncementFormDialog";
import AnnouncementDetailsDialog from "./AnnouncementDetailsDialog";

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

  const handleAddAnnouncement = async (formData: any) => {
    if (!currentBranch?.branch_id) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.priority) {
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
      title: formData.title.trim(),
      content: formData.message.trim(),
      target_audience: formData.target_audience || "ALL",
      class_id: formData.selected_classes.length > 0 ? parseInt(formData.selected_classes[0]) : undefined,
      bus_route_id: formData.selected_routes.length > 0 ? 1 : undefined,
      announcement_type: formData.category.toUpperCase(),
      priority: formData.priority.toUpperCase(),
    };

    try {
      await createAnnouncementMutation.mutateAsync(announcementData);
      setIsAddAnnouncementOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Action button handlers
  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewAnnouncementOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
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

  const handleUpdateAnnouncement = async (formData: any) => {
    if (!selectedAnnouncement || !currentBranch?.branch_id) return;

    const updateData: AnnouncementUpdate = {
      title: formData.title,
      content: formData.message,
      target_audience: formData.target_audience || "ALL",
      class_id: formData.selected_classes.length > 0 ? parseInt(formData.selected_classes[0]) : undefined,
      bus_route_id: formData.selected_routes.length > 0 ? 1 : undefined,
      announcement_type: formData.category.toUpperCase(),
      priority: formData.priority.toUpperCase(),
    };

    try {
      await updateAnnouncementMutation.mutateAsync({
        id: selectedAnnouncement.announcement_id,
        data: updateData,
      });
      setIsEditAnnouncementOpen(false);
      setSelectedAnnouncement(null);
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
          <AnnouncementFormDialog
            isOpen={isAddAnnouncementOpen}
            onClose={() => setIsAddAnnouncementOpen(false)}
            onSubmit={handleAddAnnouncement}
            isEditing={false}
            isLoading={createAnnouncementMutation.isPending}
          />
        </Dialog>
      </motion.div>

      {/* Filters */}
      <AnnouncementsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        filteredCount={filteredAnnouncements.length}
      />

      {/* Announcements List */}
      <AnnouncementsList
        announcements={filteredAnnouncements}
        isLoading={isLoading}
        error={error}
        onView={handleViewAnnouncement}
        onEdit={handleEditAnnouncement}
        onDelete={handleDeleteAnnouncement}
        getPriorityIcon={getPriorityIcon}
        getPriorityColor={getPriorityColor}
        getCategoryColor={getCategoryColor}
      />

      {/* Quick Stats */}
      <AnnouncementsOverview
        totalAnnouncements={announcements.length}
        highPriorityCount={announcements.filter((a) => a.priority === "high").length}
        mediumPriorityCount={announcements.filter((a) => a.priority === "medium").length}
        lowPriorityCount={announcements.filter((a) => a.priority === "low").length}
      />

      {/* View Announcement Dialog */}
      <AnnouncementDetailsDialog
        isOpen={isViewAnnouncementOpen}
        onClose={() => setIsViewAnnouncementOpen(false)}
        announcement={selectedAnnouncement}
        getPriorityColor={getPriorityColor}
        getCategoryColor={getCategoryColor}
      />

      {/* Edit Announcement Dialog */}
      <AnnouncementFormDialog
        isOpen={isEditAnnouncementOpen}
        onClose={() => setIsEditAnnouncementOpen(false)}
        onSubmit={handleUpdateAnnouncement}
        isEditing={true}
        announcement={selectedAnnouncement}
        isLoading={updateAnnouncementMutation.isPending}
      />

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
