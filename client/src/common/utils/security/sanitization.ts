/**
 * Input sanitization utilities using DOMPurify
 * Provides safe HTML sanitization and XSS prevention
 */

import DOMPurify from 'dompurify';

/**
 * DOMPurify configuration type
 */
type DOMPurifyConfig = {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  [key: string]: unknown;
};

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string, options?: DOMPurifyConfig): string => {
  if (typeof window === 'undefined') {
    // Server-side: return escaped HTML
    return html.replace(/[<>&"']/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return map[char] || char;
    });
  }

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: options?.ALLOWED_TAGS || ['mark', 'span', 'div', 'p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: options?.ALLOWED_ATTR || ['class', 'style'],
    ...options,
  });
  
  return String(sanitized);
};

/**
 * Sanitize text input (removes all HTML tags)
 * @param text - Text to sanitize
 * @returns Sanitized text with no HTML tags
 */
export const sanitizeText = (text: string): string => {
  if (typeof window === 'undefined') {
    return text;
  }

  const sanitized = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  return String(sanitized);
};

/**
 * Escape special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize search term for safe highlighting
 * @param searchTerm - Search term to sanitize
 * @returns Sanitized search term safe for regex and HTML
 */
export const sanitizeSearchTerm = (searchTerm: string): string => {
  // Remove HTML tags
  const textOnly = sanitizeText(searchTerm);
  // Escape regex special characters
  return escapeRegex(textOnly);
};

/**
 * Highlight text with search term (sanitized)
 * @param text - Text to highlight
 * @param searchTerm - Search term to highlight
 * @param highlightClass - CSS class for highlight
 * @returns HTML string with highlighted search terms
 */
export const highlightText = (
  text: string,
  searchTerm: string,
  highlightClass: string = 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded'
): string => {
  if (!searchTerm || !text) return text;

  // Sanitize the search term
  const sanitizedTerm = sanitizeSearchTerm(searchTerm);
  if (!sanitizedTerm) return text;

  // Create regex pattern
  const regex = new RegExp(`(${sanitizedTerm})`, 'gi');

  // Replace matches with highlighted version
  const highlighted = text.replace(
    regex,
    `<mark class="${highlightClass}">$1</mark>`
  );

  // Sanitize the final HTML to ensure safety
  return sanitizeHTML(highlighted, {
    ALLOWED_TAGS: ['mark'],
    ALLOWED_ATTR: ['class'],
  });
};

