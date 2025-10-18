import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  content: React.ReactNode;
}

interface TabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  tabListClassName?: string;
  tabTriggerClassName?: string;
  contentClassName?: string;
  showBadges?: boolean;
  gridCols?: string; // e.g., "grid-cols-2", "grid-cols-3", "grid-cols-4"
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  tabListClassName = "",
  tabTriggerClassName = "",
  contentClassName = "",
  showBadges = true,
  gridCols = "grid-cols-2",
}) => {
  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <TabsList className={`grid w-full ${gridCols} bg-transparent p-0 h-auto ${tabListClassName}`}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 font-semibold py-3 px-6 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 ${tabTriggerClassName}`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                      {showBadges && tab.badge !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className={`space-y-4 mt-6 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-4 duration-300 ${contentClassName}`}
            >
              <motion.div
                key={tab.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {tab.content}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default TabSwitcher;
