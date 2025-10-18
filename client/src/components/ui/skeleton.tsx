import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md relative overflow-hidden';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (animation === 'wave') {
    return (
      <div className={cn('relative overflow-hidden', variantClasses[variant], className)} style={style}>
        <div className={cn(baseClasses, 'absolute inset-0')} />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
    );
  }

  if (animation === 'pulse') {
    return (
      <motion.div
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        style={style}
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 3, className, lastLineWidth = 'w-3/4' }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? lastLineWidth : '100%'}
        height="1rem"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ 
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}> = ({ className, showAvatar = true, lines = 3 }) => (
  <div className={cn('p-6 space-y-4', className)}>
    {showAvatar && (
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.875rem" />
        </div>
      </div>
    )}
    <SkeletonText lines={lines} />
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, className, showHeader = true }) => (
  <div className={cn('space-y-3', className)}>
    {showHeader && (
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height="2rem"
          />
        ))}
      </div>
    )}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            width={colIndex === columns - 1 ? '20%' : '100%'}
            height="1.5rem"
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number;
  className?: string;
  showAvatar?: boolean;
}> = ({ items = 5, className, showAvatar = true }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        {showAvatar && (
          <Skeleton variant="circular" width={32} height={32} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height="1rem" />
          <Skeleton width="50%" height="0.875rem" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonForm: React.FC<{ 
  fields?: number;
  className?: string;
  showLabels?: boolean;
}> = ({ fields = 4, className, showLabels = true }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        {showLabels && (
          <Skeleton width="30%" height="1rem" />
        )}
        <Skeleton width="100%" height="2.5rem" />
      </div>
    ))}
    <div className="flex space-x-2 pt-4">
      <Skeleton width="80px" height="2.5rem" />
      <Skeleton width="80px" height="2.5rem" />
    </div>
  </div>
);

// Skeleton for data visualization
export const SkeletonChart: React.FC<{ 
  className?: string;
  type?: 'bar' | 'line' | 'pie';
}> = ({ className, type = 'bar' }) => {
  if (type === 'pie') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Skeleton variant="circular" width={200} height={200} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-end h-40">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            width="20px"
            height={`${Math.random() * 100 + 50}px`}
            animation="wave"
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} width="20px" height="1rem" />
        ))}
      </div>
    </div>
  );
};

export default Skeleton;