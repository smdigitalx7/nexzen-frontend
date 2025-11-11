import React from "react";
import { Header, Sidebar } from "@/components/layout";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/lib/utils";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for authenticated routes
 * Includes sidebar and header
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { sidebarOpen } = useNavigationStore();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          sidebarOpen ? "ml-[280px]" : "ml-[72px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-2">{children}</div>
        </main>
      </div>
    </div>
  );
}

