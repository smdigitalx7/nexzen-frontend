import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuthStore } from "@/core/auth/authStore";
import { useAuthHydration } from "@/common/hooks/useAuthHydration";
import { LazyLoadingWrapper } from "@/common/components/shared/LazyLoadingWrapper";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardRouter } from "./DashboardRouter";
import { Login, NotFound, ProfilePage, SettingsPage, routes } from "./route-config";

/**
 * Main application router
 * Handles authentication state and route rendering
 */
export function AppRouter() {
  // ✅ PERF: Use selectors so auth store updates don't rerender the whole router tree
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);
  const user = useAuthStore((s) => s.user);
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
        <Loader.Page message="Initializing..." />
      </LazyLoadingWrapper>
    );
  }

  // If not authenticated and no user data, show login or forgot password page
  if (!isAuthenticated && !user) {
    return (
      <LazyLoadingWrapper>
        <Switch>
          <Route component={Login} />
        </Switch>
      </LazyLoadingWrapper>
    );
  }

  // If we have user data but not authenticated, still show loader (bootstrapAuth might be completing)
  if (!isAuthenticated && user) {
    return (
      <LazyLoadingWrapper>
        <Loader.Page message="Restoring session..." />
      </LazyLoadingWrapper>
    );
  }

  // Authenticated routes
  return (
    <AuthenticatedLayout>
      <LazyLoadingWrapper>
        <Switch>
          {/* Redirect /login to / if authenticated */}
          <Route path="/login">
            <Redirect to="/" />
          </Route>

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

