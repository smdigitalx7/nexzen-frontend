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
  ArrowLeft,
  Headphones,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useToast } from "@/common/hooks/use-toast";
import ProfileSettingsTab from "./components/settings/ProfileSettingsTab";
import SecurityTab from "./components/settings/SecurityTab";
import ConfigurationTab from "./components/settings/ConfigurationTab";
import DataManagementTab from "./components/settings/DataManagementTab";
import AboutTab from "./components/settings/AboutTab";
import SupportTab from "./components/settings/SupportTab";

type SettingsSection =
  | "security"
  | "configuration"
  | "data"
  | "support"
  | "about";

interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsMenuItems: SettingsMenuItem[] = [
  {
    id: "security",
    label: "Security",
    description: "Password and authentication",
    icon: Lock,
  },
  {
    id: "configuration",
    label: "Configuration",
    description: "System settings and logos",
    icon: SettingsIcon,
  },
  {
    id: "data",
    label: "Data Management",
    description: "Backup and export",
    icon: Database,
  },
  {
    id: "about",
    label: "About",
    description: "App info and support",
    icon: Info,
  },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("security");
  const { toast } = useToast();
  const { resetPreferences } = useUIStore();
  const navigate = useNavigate();

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
      case "security":
        return <SecurityTab />;
      case "configuration":
        return <ConfigurationTab />;
      case "data":
        return <DataManagementTab />;
      case "about":
        return <AboutTab />;
      default:
        return <SecurityTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="h-9 w-9 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage system configuration and preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetAll}
              className="gap-2 h-9 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button onClick={handleSaveChanges} className="gap-2 h-9 text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-72 flex-shrink-0">
            <nav className="space-y-1">
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 rounded-lg text-sm ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Panel */}
          <main className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {renderActiveContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
