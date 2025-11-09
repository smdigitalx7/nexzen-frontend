import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  content: React.ReactNode;
  disabled?: boolean;
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
  size?: "sm" | "md" | "lg";
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
  size = "md",
}) => {
  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          trigger: "px-3 py-2 text-sm",
          icon: "h-4 w-4",
          badge: "text-xs px-2 py-0.5",
        };
      case "lg":
        return {
          trigger: "px-3 py-2 text-lg",
          icon: "h-5 w-5",
          badge: "text-sm px-2 py-1",
        };
      default:
        return {
          trigger: "px-3 py-2 text-base",
          icon: "h-4 w-4",
          badge: "text-xs px-2 py-0.5",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          className={cn(
            "flex w-full h-auto bg-transparent p-0 justify-start border-b border-gray-200 dark:border-gray-700 mb-6",
            tabListClassName
          )}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className={cn(
                  "flex items-center gap-2 font-medium transition-colors",
                  "text-gray-600 dark:text-gray-400",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500",
                  "hover:text-gray-800 dark:hover:text-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "relative pb-3",
                  sizeClasses.trigger,
                  tabTriggerClassName
                )}
              >
                <IconComponent
                  className={cn(
                    "flex-shrink-0",
                    sizeClasses.icon,
                    "text-current"
                  )}
                />
                <span className="truncate">{tab.label}</span>
                {showBadges && tab.badge !== undefined && (
                  <Badge
                    variant={tab.badgeVariant || "secondary"}
                    className={cn(
                      "flex-shrink-0 font-medium",
                      sizeClasses.badge
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            forceMount
            className={cn(
              "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              contentClassName
            )}
            style={{ display: activeTab === tab.value ? 'block' : 'none' }}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabSwitcher;
