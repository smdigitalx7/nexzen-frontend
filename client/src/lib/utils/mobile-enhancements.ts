import { useState, useEffect, useCallback } from 'react';

/**
 * Mobile enhancement utilities for better touch and responsive experience
 */

// Enhanced mobile detection with more accurate breakpoints
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 768;
      const isTabletDevice = width >= 768 && width < 1024;
      const isDesktopDevice = width >= 1024;

      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
      setIsDesktop(isDesktopDevice);

      if (isMobileDevice) {
        setScreenSize('mobile');
      } else if (isTabletDevice) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop, screenSize };
};

// Touch gesture detection
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return null;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe || isUpSwipe || isDownSwipe) {
      return {
        direction: isLeftSwipe ? 'left' : isRightSwipe ? 'right' : isUpSwipe ? 'up' : 'down',
        distance: Math.max(Math.abs(distanceX), Math.abs(distanceY)),
      };
    }

    return null;
  }, [touchStart, touchEnd, minSwipeDistance]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// Enhanced responsive breakpoints
export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultra: '1536px',
} as const;

// Responsive class generator
export const getResponsiveClasses = (classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
  ultra?: string;
}) => {
  const responsiveClasses = [];
  
  if (classes.mobile) responsiveClasses.push(`sm:${classes.mobile}`);
  if (classes.tablet) responsiveClasses.push(`md:${classes.tablet}`);
  if (classes.desktop) responsiveClasses.push(`lg:${classes.desktop}`);
  if (classes.wide) responsiveClasses.push(`xl:${classes.wide}`);
  if (classes.ultra) responsiveClasses.push(`2xl:${classes.ultra}`);
  
  return responsiveClasses.join(' ');
};

// Mobile-optimized spacing
export const mobileSpacing = {
  xs: 'p-1 sm:p-2',
  sm: 'p-2 sm:p-3',
  md: 'p-3 sm:p-4',
  lg: 'p-4 sm:p-6',
  xl: 'p-6 sm:p-8',
} as const;

// Touch-friendly sizing
export const touchSizing = {
  button: 'min-h-[44px] min-w-[44px]', // iOS recommended minimum touch target
  input: 'min-h-[44px]',
  link: 'min-h-[44px] min-w-[44px]',
  icon: 'h-6 w-6 sm:h-5 sm:w-5',
} as const;

// Mobile-optimized typography
export const mobileTypography = {
  heading: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  subheading: 'text-base sm:text-lg md:text-xl',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',
  small: 'text-xs',
} as const;

// Enhanced scroll behavior for mobile
export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return { scrollToElement, scrollToTop };
};

// Mobile viewport utilities
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Mobile-optimized animations
export const mobileAnimations = {
  slideIn: 'animate-slide-in-from-bottom sm:animate-slide-in-from-right',
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  bounce: 'animate-bounce-subtle',
  pulse: 'animate-pulse-subtle',
} as const;

// Touch feedback utilities
export const useTouchFeedback = () => {
  const [isPressed, setIsPressed] = useState(false);

  const touchProps = {
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    onTouchCancel: () => setIsPressed(false),
    className: isPressed ? 'scale-95 opacity-80' : 'transition-transform duration-150',
  };

  return { isPressed, touchProps };
};

// Mobile navigation utilities
export const useMobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen, closeMenu]);

  return { isMenuOpen, toggleMenu, closeMenu };
};

// Mobile form enhancements
export const useMobileForm = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      // Detect if virtual keyboard is open (rough estimation)
      const isKeyboardOpen = height < width * 0.75;
      setIsKeyboardOpen(isKeyboardOpen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isKeyboardOpen };
};

// Mobile performance optimizations
export const useMobilePerformance = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Detect low-end devices based on hardware concurrency and memory
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 4;
    
    setIsLowEndDevice(hardwareConcurrency <= 2 || memory <= 2);
  }, []);

  return { isLowEndDevice };
};

// Mobile-specific CSS classes
export const mobileClasses = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  card: 'p-4 sm:p-6',
  button: 'w-full sm:w-auto',
  input: 'text-base sm:text-sm', // Prevent zoom on iOS
  modal: 'mx-4 sm:mx-0',
  table: 'text-xs sm:text-sm',
  grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;
