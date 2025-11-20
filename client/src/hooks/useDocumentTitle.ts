import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';

/**
 * Route to title mapping
 */
const routeTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/profile': 'Profile',
  '/settings': 'Settings',
  // General routes
  '/users': 'User Management',
  '/employees': 'Employee Management',
  '/payroll': 'Payroll Management',
  '/transport': 'Transport Management',
  '/audit-log': 'Audit Log',
  // School routes
  '/school/academic': 'School Academic Management',
  '/school/reservations/new': 'School Reservations',
  '/school/admissions': 'School Admissions',
  '/school/students': 'School Students',
  '/school/attendance': 'School Attendance',
  '/school/marks': 'School Marks',
  '/school/fees': 'School Fees',
  '/school/financial-reports': 'School Financial Reports',
  '/school/announcements': 'School Announcements',
  // College routes
  '/college/academic': 'College Academic Management',
  '/college/reservations/new': 'College Reservations',
  '/college/admissions': 'College Admissions',
  '/college/classes': 'College Classes',
  '/college/students': 'College Students',
  '/college/attendance': 'College Attendance',
  '/college/marks': 'College Marks',
  '/college/fees': 'College Fees',
  '/college/financial-reports': 'College Financial Reports',
  '/college/announcements': 'College Announcements',
};

/**
 * Hook to manage document title based on current route
 * Updates title with format: "Page Title | Velonex"
 */
export function useDocumentTitle() {
  const [location] = useLocation();
  const { currentBranch, isAuthenticated, isAuthInitializing, user } = useAuthStore();
  const isHydrated = useAuthHydration();

  useEffect(() => {
    // CRITICAL: Show "Loading..." ONLY during browser refresh/bootstrapAuth
    // Conditions for loading:
    // 1. Not hydrated yet (Zustand persist still loading)
    // 2. Auth is initializing AND we have user data (refresh scenario)
    // This prevents "Login | Velonex" flash during refresh
    const isRefreshing = !isHydrated || (isAuthInitializing && user);
    
    if (isRefreshing) {
      document.title = 'Velonex - Loading...';
      return;
    }

    // If not authenticated and no user data, show Login title
    // This is the actual login page (not during refresh)
    if (!isAuthenticated && !user) {
      document.title = 'Login | Velonex';
      return;
    }

    // Get page title from route
    const pageTitle = routeTitleMap[location] || 'Velonex';
    
    // Get branch name if available
    const branchName = currentBranch?.branch_name 
      ? ` - ${currentBranch.branch_name}` 
      : '';
    
    // Construct full title
    const fullTitle = pageTitle === 'Velonex' 
      ? `Velonex${branchName} - Educational Institute Management`
      : `${pageTitle}${branchName} | Velonex`;
    
    // Update document title
    document.title = fullTitle;
  }, [location, currentBranch, isAuthenticated, isAuthInitializing, user, isHydrated]);
}

