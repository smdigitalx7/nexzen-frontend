import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/common/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { MessageSquare, Settings, FileText, BarChart3, Send } from "lucide-react";
import SMSBulkAnnouncement from "./SMSBulkAnnouncement";
import SMSTemplates from "./SMSTemplates";
import SMSReports from "./SMSReports";
import SMSConfig from "./SMSConfig";

const SMSManagement = () => {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="send" className="gap-2">
              <Send className="h-4 w-4" />
              Send Bulk
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="send" className="mt-0">
            <SMSBulkAnnouncement />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <SMSTemplates />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <SMSReports />
          </TabsContent>

          <TabsContent value="config" className="mt-0">
            <SMSConfig />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default SMSManagement;
