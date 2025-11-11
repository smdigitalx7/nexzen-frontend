import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Settings as SettingsIcon,
  Mail,
  Phone,
  FileText,
  Headphones,
  Bug,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useAuthStore } from "@/store/authStore";
import { useGrades } from "@/lib/hooks/general/useGrades";
import GradesTab from "@/components/features/general/grades/GradesTab";
import MonthlyFeeConfigTab from "@/components/features/college/config/MonthlyFeeConfigTab";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { currentBranch } = useAuthStore();
  const isCollege = currentBranch?.branch_type === "COLLEGE";
  
  // Grades hooks (for both school and college)
  const {
    grades: gradesData = [],
    isLoadingGrades,
    createGrade: createGradeMutation,
    updateGrade: updateGradeMutation,
    deleteGrade: deleteGradeMutation,
  } = useGrades();

  const [configSearchTerm, setConfigSearchTerm] = useState("");

  const handleCreateGrade = (data: any) => {
    createGradeMutation.mutate(data);
  };

  const handleUpdateGrade = (data: { gradeCode: string; data: any }) => {
    updateGradeMutation.mutate(data);
  };

  const handleDeleteGrade = (gradeCode: string) => {
    deleteGradeMutation.mutate(gradeCode);
  };

  const tabs: TabItem[] = useMemo(() => {
    const baseTabs: TabItem[] = [
      {
        value: "configuration",
        label: "Configuration",
        icon: SettingsIcon,
        content: (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Manage grade and fee settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Grades Section - for both school and college */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Grades</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define grade codes and their percentage ranges
                  </p>
                </div>
                <GradesTab
                  gradesData={gradesData}
                  searchTerm={configSearchTerm}
                  onSearchChange={setConfigSearchTerm}
                  onCreateGrade={handleCreateGrade}
                  onUpdateGrade={handleUpdateGrade}
                  onDeleteGrade={handleDeleteGrade}
                  createGradeMutation={createGradeMutation}
                  updateGradeMutation={updateGradeMutation}
                  deleteGradeMutation={deleteGradeMutation}
                />
              </div>

              {/* Monthly Fee Config Section - only for college */}
              {isCollege && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <MonthlyFeeConfigTab />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ),
      },
      {
        value: "privacy",
        label: "Privacy",
        icon: Lock,
        content: (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium mb-2">Data & Privacy</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your data is securely stored and encrypted. We follow strict
                  privacy guidelines to protect your information.
                </p>
                <Button variant="outline" size="sm">
                  View Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        value: "about",
        label: "About",
        icon: Globe,
        content: (
          <Card className="border-none shadow-lg relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                About Nexzen ERP
              </CardTitle>
              <CardDescription>
                Application information and support
              </CardDescription>
            </CardHeader>
            {/* Version in top right corner of About card */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-3 py-1.5 rounded-md border z-10">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">v1.0.0</span>
            </div>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Support & Help</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get assistance and access resources
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className="group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Documentation</h4>
                          <p className="text-sm text-muted-foreground">
                            Browse guides and API references
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => setIsContactDialogOpen(true)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Contact Support</h4>
                          <p className="text-sm text-muted-foreground">
                            Reach out to our support team
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => {
                      window.open('https://www.jotform.com/form/253145100074039', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Report an Issue</h4>
                          <p className="text-sm text-muted-foreground">
                            Report bugs or request features
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>© 2025</span>
                    <span className="font-semibold text-foreground">VELONEX ERP</span>
                    <span>All rights reserved.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Made with</span>
                    <span className="text-red-500">❤️</span>
                    <span>by</span>
                    <a 
                      href="https://www.smdigitalx.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-foreground hover:underline transition-colors"
                    >
                      SMDigitalX
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ),
      },
    ];

    return baseTabs;
  }, [gradesData, configSearchTerm, isCollege, createGradeMutation, updateGradeMutation, deleteGradeMutation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application preferences and settings
          </p>
        </div>

        <TabSwitcher
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabListClassName="grid w-full grid-cols-3 lg:w-[600px]"
        />
      </motion.div>

      {/* Contact Support Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Get in touch with our support team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <div className="space-y-1 mt-1">
                    <a 
                      href="mailto:smdigitalx@gmail.com" 
                      className="text-sm text-primary hover:underline block"
                    >
                      smdigitalx@gmail.com
                    </a>
                    <a 
                      href="mailto:contact@smdigitalx.com" 
                      className="text-sm text-primary hover:underline block"
                    >
                      contact@smdigitalx.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <div className="space-y-1 mt-1">
                    <a 
                      href="tel:8184919998" 
                      className="text-sm text-primary hover:underline block"
                    >
                      +91 8184919998
                    </a>
                    <a 
                      href="tel:7569259998" 
                      className="text-sm text-primary hover:underline block"
                    >
                      +91 7569259998
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
