/**
 * Asset Configuration
 * 
 * This configuration allows all logos, backgrounds, and images to be
 * configurable via environment variables for production deployments.
 * 
 * Environment Variables:
 * - VITE_ASSETS_BASE_URL: Base URL for assets (e.g., https://cdn.example.com)
 * - VITE_ASSETS_PATH: Path prefix for assets (default: /assets)
 * 
 * Logo Configuration:
 * - VITE_LOGO_SCHOOL: School logo path or URL (default: /assets/nexzen-logo.png)
 * - VITE_LOGO_COLLEGE: College logo path or URL (default: /assets/Velocity-logo.png)
 * - VITE_LOGO_BRAND: Brand/headname logo path or URL (default: /assets/Velonex-headname1.png)
 * 
 * Background Configuration:
 * - VITE_BG_LOGIN: Login background image path or URL (default: /assets/institiute-bgg.jpg)
 * - VITE_BG_INSTITUTE: Institute background image path or URL (default: /assets/institute-photo.jpg)
 */

/**
 * Get the full asset URL or path
 * @param assetPath - Relative path or full URL
 * @returns Full URL or path to the asset
 */
const getAssetUrl = (assetPath: string): string => {
  // If it's already a full URL (http/https), return as is
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }

  // Get base URL from environment variable
  const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL || '';
  const assetsPath = import.meta.env.VITE_ASSETS_PATH || '/assets';
  
  // If base URL is provided, use it
  if (baseUrl) {
    // Remove trailing slash from base URL and leading slash from asset path
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanAssetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${cleanBaseUrl}${cleanAssetPath}`;
  }

  // Otherwise, use relative path
  return assetPath.startsWith('/') ? assetPath : `${assetsPath}/${assetPath}`;
};

/**
 * Asset Configuration Object
 */
export const assetConfig = {
  // Logo assets
  logos: {
    /**
     * School logo (Nexzen logo)
     * Environment variable: VITE_LOGO_SCHOOL
     */
    school: getAssetUrl(
      import.meta.env.VITE_LOGO_SCHOOL || '/assets/nexzen-logo.png'
    ),
    
    /**
     * College logo (Velocity logo)
     * Environment variable: VITE_LOGO_COLLEGE
     */
    college: getAssetUrl(
      import.meta.env.VITE_LOGO_COLLEGE || '/assets/Velocity-logo.png'
    ),
    
    /**
     * Brand/Headname logo
     * Environment variable: VITE_LOGO_BRAND
     */
    brand: getAssetUrl(
      import.meta.env.VITE_LOGO_BRAND || '/assets/Velonex-headname1.png'
    ),
  },

  // Background images
  backgrounds: {
    /**
     * Login page background
     * Environment variable: VITE_BG_LOGIN
     */
    login: getAssetUrl(
      import.meta.env.VITE_BG_LOGIN || '/assets/institiute-bgg.jpg'
    ),
    
    /**
     * Institute background
     * Environment variable: VITE_BG_INSTITUTE
     */
    institute: getAssetUrl(
      import.meta.env.VITE_BG_INSTITUTE || '/assets/institute-photo.jpg'
    ),
  },

  // Additional images
  images: {
    /**
     * Additional login background (if needed)
     * Environment variable: VITE_IMG_LOGINBG
     */
    loginBg: getAssetUrl(
      import.meta.env.VITE_IMG_LOGINBG || '/assets/loginbg.jpg'
    ),
  },
} as const;

/**
 * Get logo based on branch type
 * @param branchType - Branch type ('SCHOOL' or 'COLLEGE')
 * @returns Logo URL/path
 */
export const getLogoByBranchType = (branchType?: string | null): string => {
  if (branchType === 'SCHOOL') {
    return assetConfig.logos.school;
  }
  return assetConfig.logos.college;
};

/**
 * Get alt text for logo based on branch type
 * @param branchType - Branch type ('SCHOOL' or 'COLLEGE')
 * @returns Alt text for the logo
 */
export const getLogoAltByBranchType = (branchType?: string | null): string => {
  if (branchType === 'SCHOOL') {
    return 'Velonex Logo';
  }
  return 'Velocity Logo';
};

/**
 * Asset utility functions
 */
export const assets = {
  /**
   * Get a logo asset
   */
  logo: (type: 'school' | 'college' | 'brand') => {
    switch (type) {
      case 'school':
        return assetConfig.logos.school;
      case 'college':
        return assetConfig.logos.college;
      case 'brand':
        return assetConfig.logos.brand;
      default:
        return assetConfig.logos.school;
    }
  },

  /**
   * Get a background asset
   */
  background: (type: 'login' | 'institute') => {
    switch (type) {
      case 'login':
        return assetConfig.backgrounds.login;
      case 'institute':
        return assetConfig.backgrounds.institute;
      default:
        return assetConfig.backgrounds.login;
    }
  },

  /**
   * Get logo by branch type (convenience function)
   */
  logoByBranch: getLogoByBranchType,
  
  /**
   * Get logo alt text by branch type (convenience function)
   */
  logoAltByBranch: getLogoAltByBranchType,
};

export default assetConfig;

