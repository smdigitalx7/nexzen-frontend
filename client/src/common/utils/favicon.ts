import type { Branch } from '@/core/auth/types';

/**
 * Favicon emoji mapping based on branch type
 */
const BRANCH_FAVICON_MAP: Record<string, string> = {
  SCHOOL: '🏫', // School building for school
  COLLEGE: '🎓', // Graduation cap for college
  DEFAULT: '🏫', // School building as default
};

/**
 * Generate SVG favicon data URL
 */
function generateFaviconSVG(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y=".9em" font-size="90">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Update favicon based on branch
 */
export function updateFavicon(branch: Branch | null): void {
  const emoji = branch?.branch_type 
    ? BRANCH_FAVICON_MAP[branch.branch_type] || BRANCH_FAVICON_MAP.DEFAULT
    : BRANCH_FAVICON_MAP.DEFAULT;
  
  const faviconUrl = generateFaviconSVG(emoji);
  
  // Find existing favicon link or create new one
  let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/svg+xml';
    document.head.appendChild(faviconLink);
  }
  
  // Update favicon
  faviconLink.href = faviconUrl;
}

/**
 * Reset favicon to default
 */
export function resetFavicon(): void {
  updateFavicon(null);
}

