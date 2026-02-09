import { Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { Login, NotFound, ProfilePage, SettingsPage, routes as appRoutes } from "./route-config";
import { DashboardRouter } from "./DashboardRouter";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "@/core/auth/authStore";
import { RouterErrorElement } from "@/common/components/shared/RouterErrorElement";
import { ContentSkeleton } from "@/common/components/shared/ContentSkeleton";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

// Wrapper to protect routes. Shows Sidebar + Header on refresh; main area shows simple "Refreshing..." loader.
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);

  // While auth is initializing (e.g. on refresh), keep sidebar/header; show simple circle loader in main only
  if (isAuthInitializing) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 flex items-center justify-center bg-card">
          <Loader.Inline size="lg" message="Loading..." />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleGuard = ({ roles, component: Component, preventDirectAccess }: any) => {
    // We will reuse the ProtectedRoute logic via a wrapper or direct usage 
    // once we refactor ProtectedRoute. For now, using a simplified inline guard 
    // or we can wrap the existing ProtectedRoute if it's refactored.
    // Actually, let's use the existing ProtectedRoute component but we need to modify it first 
    // because it uses 'wouter'. 
    // So for this step, I will point to a specialized wrapper.
    return (
       <ProtectedRoute 
          path="" // Not needed for RRD context usually, but component might expect it
          roles={roles}
          component={Component}
          preventDirectAccess={preventDirectAccess}
       />
    );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouterErrorElement />,
    children: [
        {
            path: "login",
            element: (
              <Suspense fallback={<ContentSkeleton />}>
                <Login />
              </Suspense>
            ),
        },
        // Protected Routes
        {
            path: "/",
             // If not authenticated, RootLayout (via logic) or RequireAuth will redirect.
             // But RootLayout renders Outlet. We need a guard here.
            element: <RequireAuth><AuthenticatedLayout><Outlet /></AuthenticatedLayout></RequireAuth>,
            children: [
                {
                    index: true,
                    element: (
                      <Suspense fallback={<ContentSkeleton />}>
                        <DashboardRouter />
                      </Suspense>
                    ),
                },
                {
                    path: "profile",
                    element: <ProfilePage />,
                },
                {
                    path: "settings",
                    element: <SettingsPage />,
                },
                {
                    path: "college", // existing placeholder
                    element: null, 
                },
                // RouteSuspense in AuthenticatedLayout catches lazy suspend and shows ContentSkeleton
                ...appRoutes.map((route) => ({
                    path: route.path.startsWith("/") ? route.path.substring(1) : route.path,
                    element: (
                        <RoleGuard 
                            roles={route.roles} 
                            component={route.component} 
                            preventDirectAccess={route.preventDirectAccess} 
                        />
                    ),
                })),
                {
                    path: "*",
                    element: <NotFound />,
                },
            ],
        },
    ],
  },
  {
      path: "*",
      element: (
        <Suspense fallback={<ContentSkeleton />}>
          <NotFound />
        </Suspense>
      ),
  }
]);
