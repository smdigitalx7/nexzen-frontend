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
  const { isAuthenticated } = useAuthStore();
  const isHydrated = useAuthHydration();

  // If not hydrated yet, show nothing (will be replaced by LazyLoadingWrapper once hydrated)
  if (!isHydrated) {
    return null;
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <LazyLoadingWrapper>
        <Login />
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

