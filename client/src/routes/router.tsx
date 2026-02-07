import { Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { Login, NotFound, ProfilePage, SettingsPage, routes as appRoutes } from "./route-config";
import { DashboardRouter } from "./DashboardRouter";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "@/core/auth/authStore";
import { RouterErrorElement } from "@/common/components/shared/RouterErrorElement";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

// Wrapper to protect routes using the existing ProtectedRoute logic (adapted)
// Note: We might need to refactor ProtectedRoute to be RRD compatible.
// For now, let's create a simple wrapper for the router.
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  
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
        // Public Routes (Suspense so lazy components don't suspend during sync input)
        {
            path: "login",
            element: (
              <Suspense fallback={<Loader.Page message="Loading..." />}>
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
                      <Suspense fallback={<Loader.Container message="Loading..." />}>
                        <DashboardRouter />
                      </Suspense>
                    ),
                },
                {
                    path: "profile",
                    element: (
                      <Suspense fallback={<Loader.Container message="Loading..." />}>
                        <ProfilePage />
                      </Suspense>
                    ),
                },
                {
                    path: "settings",
                    element: (
                      <Suspense fallback={<Loader.Container message="Loading..." />}>
                        <SettingsPage />
                      </Suspense>
                    ),
                },
                {
                    path: "college", // existing placeholder
                    element: null, 
                },
                // Spread the config routes (Suspense so lazy route components don't suspend during sync input)
                ...appRoutes.map((route) => ({
                    path: route.path.startsWith("/") ? route.path.substring(1) : route.path,
                    element: (
                        <Suspense fallback={<Loader.Container message="Loading..." />}>
                          <RoleGuard 
                              roles={route.roles} 
                              component={route.component} 
                              preventDirectAccess={route.preventDirectAccess} 
                          />
                        </Suspense>
                    ),
                })),
                // 404 for authenticated context
                {
                    path: "*",
                    element: (
                      <Suspense fallback={<Loader.Container message="Loading..." />}>
                        <NotFound />
                      </Suspense>
                    ),
                },
            ],
        },
    ],
  },
  {
      path: "*",
      element: (
        <Suspense fallback={<Loader.Page message="Loading..." />}>
          <NotFound />
        </Suspense>
      ),
  }
]);
