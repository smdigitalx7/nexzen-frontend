import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
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
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("privacy");

  const tabs: TabItem[] = [
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
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
          tabListClassName="grid w-full grid-cols-2 lg:w-[400px]"
        />
      </motion.div>
    </div>
  );
};

export default SettingsPage;
