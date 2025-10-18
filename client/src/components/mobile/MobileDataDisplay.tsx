import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useMobileDetection, useTouchFeedback } from '@/lib/utils/mobile-enhancements';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';

export interface MobileDataItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
  };
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  }>;
  collapsible?: boolean;
  children?: React.ReactNode;
}

export interface MobileDataDisplayProps {
  items: MobileDataItem[];
  title?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  showToggle?: boolean;
  defaultExpanded?: boolean;
}

export const MobileDataDisplay: React.FC<MobileDataDisplayProps> = ({
  items,
  title,
  className,
  loading = false,
  emptyMessage = 'No data available',
  showToggle = false,
  defaultExpanded = true,
}) => {
  const { isMobile } = useMobileDetection();
  const { touchProps } = useTouchFeedback();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    defaultExpanded ? new Set(items.map(item => item.id)) : new Set()
  );
  const [isAllExpanded, setIsAllExpanded] = useState(defaultExpanded);

  const toggleItem = (itemId: string) => {
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

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set(items.map(item => item.id)));
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <CardContent>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {(title || showToggle) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className={cn(
              'font-semibold',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              {title}
            </h3>
          )}
          {showToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="flex items-center gap-2"
            >
              {isAllExpanded ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        const isCollapsible = item.collapsible !== false;

        return (
          <Card 
            key={item.id} 
            className={cn(
              'transition-all duration-200',
              isCollapsible && 'cursor-pointer hover:shadow-md',
              isExpanded && 'ring-2 ring-primary/20'
            )}
            onClick={isCollapsible ? () => toggleItem(item.id) : undefined}
            {...(isCollapsible ? touchProps : {})}
          >
            <CardHeader className={cn('pb-3', isMobile && 'px-4 py-3')}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn(
                    'text-base font-semibold leading-tight',
                    isMobile ? 'text-sm' : 'text-lg',
                    'truncate'
                  )}>
                    {item.title}
                  </CardTitle>
                  {item.subtitle && (
                    <p className={cn(
                      'text-muted-foreground mt-1',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {item.status && (
                    <Badge 
                      variant={item.status.variant} 
                      size={isMobile ? 'sm' : 'default'}
                    >
                      {item.status.text}
                    </Badge>
                  )}
                  {isCollapsible && (
                    isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className={cn('pt-0', isMobile && 'px-4')}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'font-bold',
                    isMobile ? 'text-lg' : 'text-xl'
                  )}>
                    {item.value}
                  </span>
                  {item.trend && (
                    <div className={cn(
                      'flex items-center gap-1',
                      getTrendColor(item.trend.direction)
                    )}>
                      {getTrendIcon(item.trend.direction)}
                      <span className={cn(
                        'text-xs font-medium',
                        isMobile ? 'text-xs' : 'text-sm'
                      )}>
                        {item.trend.value}%
                      </span>
                    </div>
                  )}
                </div>

                {item.progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.progress.label || 'Progress'}</span>
                      <span>{item.progress.value}%</span>
                    </div>
                    <Progress 
                      value={item.progress.value} 
                      max={item.progress.max || 100}
                      className="h-2"
                    />
                  </div>
                )}

                {isExpanded && item.children && (
                  <div className="pt-3 border-t">
                    {item.children}
                  </div>
                )}

                {item.actions && item.actions.length > 0 && (
                  <div className={cn(
                    'flex gap-2 pt-3',
                    isMobile ? 'flex-col' : 'flex-row'
                  )}>
                    {item.actions.map((action, index) => (
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
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Mobile-optimized stats grid
export const MobileStatsGrid: React.FC<{
  stats: Array<{
    id: string;
    title: string;
    value: string | number;
    change?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
    icon?: React.ReactNode;
  }>;
  className?: string;
}> = ({ stats, className }) => {
  const { isMobile } = useMobileDetection();

  return (
    <div className={cn(
      'grid gap-4',
      isMobile ? 'grid-cols-2' : 'grid-cols-4',
      className
    )}>
      {stats.map((stat) => (
        <Card key={stat.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                'text-muted-foreground',
                isMobile ? 'text-xs' : 'text-sm'
              )}>
                {stat.title}
              </p>
              <p className={cn(
                'font-bold',
                isMobile ? 'text-lg' : 'text-2xl'
              )}>
                {stat.value}
              </p>
            </div>
            {stat.icon && (
              <div className="text-muted-foreground">
                {stat.icon}
              </div>
            )}
          </div>
          {stat.change && (
            <div className={cn(
              'flex items-center gap-1 mt-2',
              stat.change.direction === 'up' ? 'text-success-600' : 
              stat.change.direction === 'down' ? 'text-destructive' : 
              'text-muted-foreground'
            )}>
              {getTrendIcon(stat.change.direction)}
              <span className="text-xs font-medium">
                {stat.change.value}%
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
