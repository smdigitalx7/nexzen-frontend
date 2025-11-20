import React from "react";
import { Switch, Route } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { LazyLoadingWrapper } from "@/components/shared/LazyLoadingWrapper";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardRouter } from "./DashboardRouter";
import { Login, NotFound, ProfilePage, SettingsPage, routes } from "./route-config";

/**
 * Main application router
 * Handles authentication state and route rendering
 */
export function AppRouter() {
  const { isAuthenticated, isAuthInitializing, user } = useAuthStore();
  const isHydrated = useAuthHydration();

  // CRITICAL: Show loading screen if:
  // 1. Not hydrated yet (Zustand persist still loading)
  // 2. Auth is initializing (bootstrapAuth running)
  // 3. We have user data but bootstrapAuth is still running (prevents login flash on refresh)
  // This ensures smooth experience: no login page flash, just loader until bootstrapAuth completes
  const shouldShowLoader = !isHydrated || isAuthInitializing || (user && !isAuthenticated);
  
  if (shouldShowLoader) {
    return (
      <LazyLoadingWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </LazyLoadingWrapper>
    );
  }

  // If not authenticated and no user data, show login page
  // Only show login if bootstrapAuth has completed and we have no user data
  if (!isAuthenticated && !user) {
    return (
      <LazyLoadingWrapper>
        <Login />
      </LazyLoadingWrapper>
    );
  }

  // If we have user data but not authenticated, still show loader (bootstrapAuth might be completing)
  if (!isAuthenticated && user) {
    return (
      <LazyLoadingWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Restoring session...</p>
          </div>
        </div>
      </LazyLoadingWrapper>
    );
  }

  // Authenticated routes
  return (
    <AuthenticatedLayout>
      <LazyLoadingWrapper>
        <Switch>
          {/* Dashboard - Role-specific */}
          <Route path="/" component={DashboardRouter} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={SettingsPage} />

          {/* Protected routes */}
          {routes.map((route) => (
            <ProtectedRoute
              key={route.path}
              path={route.path}
              roles={route.roles}
              component={route.component}
              preventDirectAccess={route.preventDirectAccess}
            />
          ))}

          {/* College base route */}
          <Route path="/college" />

          {/* 404 - Must be last */}
          <Route component={NotFound} />
        </Switch>
      </LazyLoadingWrapper>
    </AuthenticatedLayout>
  );
}

