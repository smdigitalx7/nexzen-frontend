import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/core/auth/authStore';

/**
 * Route to meta description mapping
 */
const routeDescriptionMap: Record<string, string> = {
  '/': 'Comprehensive dashboard for educational institute management',
  '/profile': 'Manage your profile and account settings',
  '/settings': 'Configure application settings and preferences',
  '/users': 'Manage users, roles, and permissions',
  '/employees': 'Employee management and administration',
  '/payroll': 'Payroll processing and management',
  '/transport': 'Transport route and assignment management',
  '/audit-log': 'View system audit logs and activity history',
  '/school/academic': 'School academic year, classes, and sections management',
  '/school/reservations/new': 'School student reservation management',
  '/school/admissions': 'School student admissions processing',
  '/school/students': 'School student enrollment and management',
  '/school/attendance': 'School student attendance tracking',
  '/school/marks': 'School student marks and grades management',
  '/school/fees': 'School fee collection and management',
  '/school/financial-reports': 'School financial reports and analytics',
  '/school/announcements': 'School announcements and notifications',
  '/college/academic': 'College academic year, classes, and groups management',
  '/college/reservations/new': 'College student reservation management',
  '/college/admissions': 'College student admissions processing',
  '/college/classes': 'College class and course management',
  '/college/students': 'College student enrollment and management',
  '/college/attendance': 'College student attendance tracking',
  '/college/marks': 'College student marks and grades management',
  '/college/fees': 'College fee collection and management',
  '/college/financial-reports': 'College financial reports and analytics',
  '/college/announcements': 'College announcements and notifications',
};

/**
 * SEO Head component
 * Manages meta tags for SEO and social sharing
 */
export function SEOHead() {
  const [location] = useLocation();
  const { currentBranch, user } = useAuthStore();

  useEffect(() => {
    // Get page-specific description
    const description = routeDescriptionMap[location] || 
      'Velonex - Comprehensive educational institute management system with multi-tenant support, role-based access, and analytics dashboards.';
    
    // Get branch name
    const branchName = currentBranch?.branch_name || 'Educational Institute';
    const branchType = currentBranch?.branch_type || '';
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', `Velonex, ${branchType.toLowerCase()}, educational management, school management, college management, ERP, student management, fee management, attendance tracking`);
    updateMetaTag('author', 'Velonex');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1');
    
    // Open Graph meta tags for social sharing
    updateMetaTag('og:title', document.title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', 'Velonex', 'property');
    updateMetaTag('og:locale', 'en_US', 'property');
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', document.title);
    updateMetaTag('twitter:description', description);
    
    // Additional meta tags
    updateMetaTag('application-name', 'Velonex');
    updateMetaTag('apple-mobile-web-app-title', 'Velonex');
    updateMetaTag('theme-color', '#3b82f6'); // Blue theme color
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + location;
    
  }, [location, currentBranch, user]);

  return null; // This component doesn't render anything
}

