import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMobileDetection, useMobileNavigation, useTouchFeedback } from '@/lib/utils/mobile-enhancements';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
  };
  children?: NavigationItem[];
  disabled?: boolean;
}

export interface MobileNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  title?: string;
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  logo,
  title = 'Menu',
  className,
  onItemClick,
}) => {
  const { isMobile } = useMobileDetection();
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileNavigation();
  const { touchProps } = useTouchFeedback();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      if (item.onClick) {
        item.onClick();
      }
      if (onItemClick) {
        onItemClick(item);
      }
      closeMenu();
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-auto p-3 text-left',
            level > 0 && 'ml-4',
            item.disabled && 'opacity-50 cursor-not-allowed',
            'hover:bg-muted/50',
            touchProps.className
          )}
          onClick={() => !item.disabled && handleItemClick(item)}
          disabled={item.disabled}
          onTouchStart={touchProps.onTouchStart}
          onTouchEnd={touchProps.onTouchEnd}
          onTouchCancel={touchProps.onTouchCancel}
        >
          <div className="flex items-center w-full gap-3">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-medium truncate',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant || 'default'} 
                    size="sm"
                  >
                    {item.badge.text}
                  </Badge>
                )}
              </div>
            </div>
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </div>
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isMobile) {
    // Desktop navigation - render as regular nav
    return (
      <nav className={cn('space-y-2', className)}>
        {items.map(item => renderNavigationItem(item))}
      </nav>
    );
  }

  return (
    <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              {logo}
              <SheetTitle className="text-lg font-semibold">
                {title}
              </SheetTitle>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {items.map(item => renderNavigationItem(item))}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Mobile bottom navigation
export const MobileBottomNav: React.FC<{
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: string;
    active?: boolean;
  }>;
  className?: string;
}> = ({ items, className }) => {
  const { isMobile } = useMobileDetection();
  const { touchProps } = useTouchFeedback();

  if (!isMobile) return null;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background border-t border-border',
      'safe-area-pb',
      className
    )}>
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              'flex flex-col items-center justify-center h-full p-2',
              'text-xs font-medium',
              item.active && 'text-primary bg-primary/10',
              'relative',
              touchProps.className
            )}
            onClick={item.onClick}
            onTouchStart={touchProps.onTouchStart}
            onTouchEnd={touchProps.onTouchEnd}
            onTouchCancel={touchProps.onTouchCancel}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  size="sm"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <span className="mt-1 truncate max-w-full">
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

// Mobile search bar
export const MobileSearchBar: React.FC<{
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
}> = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className,
  showFilters = false,
  onFilterClick 
}) => {
  const { isMobile } = useMobileDetection();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-2 p-2 bg-muted rounded-lg',
        isMobile && 'mx-4',
        className
      )}
    >
      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={cn(
          'flex-1 bg-transparent border-none outline-none',
          'text-sm placeholder:text-muted-foreground',
          isMobile && 'text-base' // Prevent zoom on iOS
        )}
      />
      {showFilters && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFilterClick}
          className="h-8 w-8"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};
