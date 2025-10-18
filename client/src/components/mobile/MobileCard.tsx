import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileDetection, useTouchFeedback, mobileClasses } from '@/lib/utils/mobile-enhancements';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

export interface MobileCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  }>;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  children?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  description,
  subtitle,
  badge,
  actions = [],
  onClick,
  className,
  loading = false,
  disabled = false,
  showChevron = false,
  children,
}) => {
  const { isMobile } = useMobileDetection();
  const { touchProps } = useTouchFeedback();

  const cardContent = (
    <Card
      className={cn(
        'transition-all duration-200',
        onClick && !disabled && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
        loading && 'opacity-60 pointer-events-none',
        disabled && 'opacity-50 pointer-events-none',
        isMobile ? 'p-4' : 'p-6',
        onClick && !disabled && touchProps.className,
        className
      )}
      onClick={onClick}
      {...(onClick && !disabled ? { onTouchStart: touchProps.onTouchStart, onTouchEnd: touchProps.onTouchEnd, onTouchCancel: touchProps.onTouchCancel } : {})}
    >
      <CardHeader className={cn('pb-3', isMobile && 'px-0')}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              'text-base font-semibold leading-tight',
              isMobile ? 'text-sm' : 'text-lg',
              'truncate'
            )}>
              {title}
            </CardTitle>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground mt-1',
                isMobile ? 'text-xs' : 'text-sm'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {badge && (
              <Badge 
                variant={badge.variant || 'default'} 
                size={isMobile ? 'sm' : 'default'}
              >
                {badge.text}
              </Badge>
            )}
            {showChevron && onClick && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        {description && (
          <CardDescription className={cn(
            'mt-2',
            isMobile ? 'text-xs' : 'text-sm'
          )}>
            {description}
          </CardDescription>
        )}
      </CardHeader>

      {children && (
        <CardContent className={cn('pt-0', isMobile && 'px-0')}>
          {children}
        </CardContent>
      )}

      {actions.length > 0 && (
        <div className={cn(
          'flex gap-2 pt-3 border-t',
          isMobile ? 'px-0' : 'px-6',
          isMobile ? 'flex-col' : 'flex-row'
        )}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={isMobile ? 'sm' : 'default'}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={cn(
                isMobile && 'w-full',
                'flex items-center gap-2'
              )}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );

  return cardContent;
};

// Mobile-optimized card grid
export const MobileCardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}> = ({ children, className, columns = 1 }) => {
  const { isMobile } = useMobileDetection();
  
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      isMobile && 'gap-3',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized list card
export const MobileListCard: React.FC<{
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    icon?: React.ReactNode;
    badge?: {
      text: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
    };
    onClick?: () => void;
  }>;
  className?: string;
  loading?: boolean;
}> = ({ items, className, loading = false }) => {
  const { isMobile } = useMobileDetection();

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <MobileCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          description={item.description}
          badge={item.badge}
          onClick={item.onClick}
          showChevron={!!item.onClick}
          className={cn(
            'p-3',
            isMobile && 'py-3'
          )}
        >
          {item.icon && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {item.icon}
              </div>
            </div>
          )}
        </MobileCard>
      ))}
    </div>
  );
};
