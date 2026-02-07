import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/utils";

export interface TabItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
  /**
   * "default" = main tabs. "subtab" = same underline style as main, but smaller (secondary nav).
   */
  variant?: "default" | "subtab";
  /**
   * ✅ OPTIMIZATION: If true, keeps all tabs mounted (for state preservation)
   * If false, only active tab is mounted (prevents queries in inactive tabs)
   * Default: false (on-demand rendering for better performance)
   */
  forceMount?: boolean;
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
  variant = "default",
  forceMount = false, // ✅ OPTIMIZATION: Default to false - only mount active tab
}) => {
  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  const isSubtab = variant === "subtab";

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
    <div className={cn(isSubtab ? "space-y-4" : "space-y-6", className)}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          className={cn(
            isSubtab
              ? "flex w-full h-auto bg-transparent p-0 justify-start gap-6 mb-4"
              : "flex w-full h-auto bg-transparent p-0 justify-start border-b border-gray-200 dark:border-gray-700 mb-6",
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
                  "flex items-center gap-2 font-medium transition-colors duration-200 rounded-none border-0 shadow-none bg-transparent",
                  isSubtab
                    ? "text-sm text-slate-500 dark:text-slate-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold hover:text-slate-700 dark:hover:text-slate-300 py-2 gap-1.5 border-l border-slate-200 dark:border-slate-600 first:border-l-0 first:pl-0 pl-6 after:!content-none"
                    : "text-gray-600 dark:text-gray-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 hover:text-gray-800 dark:hover:text-gray-300 relative pb-3",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  !isSubtab && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
                  !isSubtab && sizeClasses.trigger,
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
            forceMount={forceMount ? true : undefined} // Radix type is `forceMount?: true`
            className={cn(
              isSubtab ? "mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" : "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              contentClassName
            )}
            // ✅ OPTIMIZATION: If forceMount is false, Radix will handle conditional rendering
            // If forceMount is true, use display:none to hide inactive tabs
            style={forceMount ? { display: activeTab === tab.value ? 'block' : 'none' } : undefined}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabSwitcher;
