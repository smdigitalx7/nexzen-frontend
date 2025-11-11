import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Settings as SettingsIcon,
  Mail,
  Phone,
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
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                About Nexzen ERP
              </CardTitle>
              <CardDescription>
                Application information and support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Support & Help</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsContactDialogOpen(true)}
                  >
                    Contact Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.open('https://www.jotform.com/form/253145100074039', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Report an Issue
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  © 2024 Nexzen ERP. All rights reserved.
                </p>
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
