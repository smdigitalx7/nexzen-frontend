import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Lock,
  Settings as SettingsIcon,
  Info,
  RefreshCw,
  Save,
  Database,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useToast } from "@/common/hooks/use-toast";
import ProfileSettingsTab from "./components/settings/ProfileSettingsTab";
import SecurityTab from "./components/settings/SecurityTab";
import ConfigurationTab from "./components/settings/ConfigurationTab";
import DataManagementTab from "./components/settings/DataManagementTab";
import AboutTab from "./components/settings/AboutTab";

type SettingsSection =
  | "profile"
  | "security"
  | "configuration"
  | "data"
  | "about";

interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsMenuItems: SettingsMenuItem[] = [
  {
    id: "profile",
    label: "Profile Settings",
    description: "Manage your personal information and preferences",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, authentication, and security settings",
    icon: Lock,
  },
  {
    id: "configuration",
    label: "Configuration",
    description: "System configuration and settings",
    icon: SettingsIcon,
  },
  {
    id: "data",
    label: "Data Management",
    description: "Backup, export, and data management",
    icon: Database,
  },
  {
    id: "about",
    label: "About",
    description: "Application information and support",
    icon: Info,
  },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const { toast } = useToast();
  const { resetPreferences } = useUIStore();

  const handleResetAll = () => {
    resetPreferences();
    toast({
      title: "Settings Reset",
      description: "All preferences have been reset to default values.",
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  const renderActiveContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettingsTab />;
      case "security":
        return <SecurityTab />;
      case "configuration":
        return <ConfigurationTab />;
      case "data":
        return <DataManagementTab />;
      case "about":
        return <AboutTab />;
      default:
        return <ProfileSettingsTab />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetAll}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All
            </Button>
            <Button onClick={handleSaveChanges} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-80 flex-shrink-0"
          >
            <nav className="space-y-1 bg-white rounded-lg border border-blue-200 shadow-sm p-2">
              {settingsMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                    className={`w-full text-left rounded-lg px-4 py-3 transition-all duration-300 ease-in-out ${
                      isActive
                        ? "bg-blue-50 border border-blue-300 text-blue-900 shadow-sm"
                        : "text-foreground hover:bg-blue-50/50 border border-transparent hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 transition-colors duration-200 ${
                          isActive ? "text-blue-600" : "text-slate-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm transition-colors duration-200 ${
                            isActive ? "text-blue-900" : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div
                          className={`text-xs mt-0.5 transition-colors duration-200 ${
                            isActive ? "text-blue-700" : "text-muted-foreground"
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content Panel */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white rounded-lg border border-blue-200 shadow-sm"
              >
                {renderActiveContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
