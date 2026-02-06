import React, { Suspense } from "react";
import { Header, Sidebar } from "@/common/components/layout";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/common/utils";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          sidebarOpen ? "ml-[250px]" : "ml-[72px]"
        )}
        style={{ minWidth: 0, maxWidth: "100%" }}
      >
        <Header />
        <main
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-smooth relative"
          style={{
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div className="p-2 relative min-h-full">
            <Suspense fallback={<Loader.Container message="Loading..." />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
