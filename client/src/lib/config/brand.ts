/**
 * Brand Configuration
 * 
 * This configuration allows all brand-specific text and information to be
 * configurable via environment variables for multi-brand deployments.
 * 
 * Environment Variables:
 * - VITE_BRAND_NAME: Main brand/company name (default: Velonex)
 * - VITE_BRAND_DESCRIPTION: Brand description for meta tags
 * - VITE_BRAND_CONTACT_EMAIL: Support contact email (default: contact@smdigitalx.com)
 * - VITE_BRAND_CONTACT_PHONE: Support contact phone (default: +91 8184919998)
 * - VITE_BRAND_WEBSITE: Brand website URL (default: https://www.smdigitalx.com)
 * - VITE_BRAND_DEFAULT_SCHOOL_NAME: Default school name in PDFs (default: VELONEX SCHOOL)
 * - VITE_BRAND_DEFAULT_COLLEGE_NAME: Default college name in PDFs (default: VELONEX COLLEGE)
 * - VITE_BRAND_FOOTER_TEXT: Footer text template
 */

/**
 * Brand Configuration Object
 */
export const brandConfig = {
  /**
   * Main brand/company name
   * Environment variable: VITE_BRAND_NAME
   */
  name: import.meta.env.VITE_BRAND_NAME || 'Velonex',

  /**
   * Brand description for meta tags and SEO
   * Environment variable: VITE_BRAND_DESCRIPTION
   */
  description: import.meta.env.VITE_BRAND_DESCRIPTION || 
    'Comprehensive educational institute management system with multi-tenant support, role-based access, and analytics dashboards.',

  /**
   * Support contact email
   * Environment variable: VITE_BRAND_CONTACT_EMAIL
   */
  contactEmail: import.meta.env.VITE_BRAND_CONTACT_EMAIL || 'contact@smdigitalx.com',

  /**
   * Support contact phone
   * Environment variable: VITE_BRAND_CONTACT_PHONE
   */
  contactPhone: import.meta.env.VITE_BRAND_CONTACT_PHONE || '+91 8184919998',

  /**
   * Brand website URL
   * Environment variable: VITE_BRAND_WEBSITE
   */
  website: import.meta.env.VITE_BRAND_WEBSITE || 'https://www.smdigitalx.com',

  /**
   * Website display name (can be different from URL)
   * Environment variable: VITE_BRAND_WEBSITE_NAME
   */
  websiteName: import.meta.env.VITE_BRAND_WEBSITE_NAME || 'SMDigitalX',

  /**
   * Default school name for PDFs
   * Environment variable: VITE_BRAND_DEFAULT_SCHOOL_NAME
   */
  defaultSchoolName: import.meta.env.VITE_BRAND_DEFAULT_SCHOOL_NAME || 'VELONEX SCHOOL',

  /**
   * Default college name for PDFs
   * Environment variable: VITE_BRAND_DEFAULT_COLLEGE_NAME
   */
  defaultCollegeName: import.meta.env.VITE_BRAND_DEFAULT_COLLEGE_NAME || 'VELONEX COLLEGE',

  /**
   * Footer copyright text template
   * Use {year} for current year, {brand} for brand name
   * Environment variable: VITE_BRAND_FOOTER_TEXT
   */
  footerText: import.meta.env.VITE_BRAND_FOOTER_TEXT || 
    '© {year} {brand} - Made with 🤍 by {website}',

  /**
   * Application title
   * Environment variable: VITE_BRAND_APP_TITLE
   */
  appTitle: import.meta.env.VITE_BRAND_APP_TITLE || '{brand} - Educational Institute Management',

  /**
   * Meta keywords
   * Environment variable: VITE_BRAND_KEYWORDS
   */
  keywords: import.meta.env.VITE_BRAND_KEYWORDS || 
    'educational management, school management, college management, ERP, student management, fee management, attendance tracking',

  /**
   * Login page logo configuration
   * true = show two logos (school + college with divider)
   * false = show single logo (just school logo)
   * Environment variable: VITE_BRAND_LOGIN_SHOW_TWO_LOGOS
   * Default: true (if not set or set to 'true')
   */
  loginShowTwoLogos: import.meta.env.VITE_BRAND_LOGIN_SHOW_TWO_LOGOS !== 'false',
} as const;

/**
 * Get formatted footer text with placeholders replaced
 */
export const getFooterText = (): string => {
  const currentYear = new Date().getFullYear();
  return brandConfig.footerText
    .replace(/{year}/g, currentYear.toString())
    .replace(/{brand}/g, brandConfig.name)
    .replace(/{website}/g, brandConfig.websiteName);
};

/**
 * Get formatted app title with placeholders replaced
 */
export const getAppTitle = (): string => {
  return brandConfig.appTitle.replace(/{brand}/g, brandConfig.name);
};

/**
 * Brand utility functions
 */
export const brand = {
  /**
   * Get brand name
   */
  getName: () => brandConfig.name,

  /**
   * Get brand description
   */
  getDescription: () => brandConfig.description,

  /**
   * Get contact email
   */
  getContactEmail: () => brandConfig.contactEmail,

  /**
   * Get contact phone (formatted for tel: links)
   */
  getContactPhone: () => brandConfig.contactPhone.replace(/\s/g, ''),

  /**
   * Get contact phone (display format)
   */
  getContactPhoneDisplay: () => brandConfig.contactPhone,

  /**
   * Get website URL
   */
  getWebsite: () => brandConfig.website,

  /**
   * Get website name
   */
  getWebsiteName: () => brandConfig.websiteName,

  /**
   * Get default school name
   */
  getDefaultSchoolName: () => brandConfig.defaultSchoolName,

  /**
   * Get default college name
   */
  getDefaultCollegeName: () => brandConfig.defaultCollegeName,

  /**
   * Get formatted footer text
   */
  getFooterText: getFooterText,

  /**
   * Get formatted app title
   */
  getAppTitle: getAppTitle,

  /**
   * Get meta keywords
   */
  getKeywords: () => brandConfig.keywords,

  /**
   * Check if login page should show two logos
   */
  shouldShowTwoLogos: () => brandConfig.loginShowTwoLogos,
};

export default brandConfig;


