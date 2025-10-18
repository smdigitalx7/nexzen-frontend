import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Zap, Sparkles, Clock, Database, FileText, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, SkeletonForm, SkeletonText } from './skeleton';

// Loading component variants
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'success' | 'error' | 'wave' | 'bounce' | 'shimmer' | 'orbit' | 'ripple';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingContext = 'data' | 'page' | 'form' | 'upload' | 'save' | 'delete' | 'search' | 'general';

interface BaseLoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  context?: LoadingContext;
  className?: string;
  message?: string;
  showMessage?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
  progress?: number;
  showPercentage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
}

// Size configurations
const sizeConfig = {
  xs: { icon: 'h-3 w-3', text: 'text-xs', container: 'p-2', spacing: 'gap-1' },
  sm: { icon: 'h-4 w-4', text: 'text-sm', container: 'p-3', spacing: 'gap-2' },
  md: { icon: 'h-6 w-6', text: 'text-base', container: 'p-4', spacing: 'gap-3' },
  lg: { icon: 'h-8 w-8', text: 'text-lg', container: 'p-6', spacing: 'gap-4' },
  xl: { icon: 'h-12 w-12', text: 'text-xl', container: 'p-8', spacing: 'gap-6' }
};

// Context-based configurations
const contextConfig = {
  data: { icon: Database, message: 'Loading data...', color: 'text-blue-500' },
  page: { icon: FileText, message: 'Loading page...', color: 'text-purple-500' },
  form: { icon: Settings, message: 'Processing form...', color: 'text-green-500' },
  upload: { icon: Zap, message: 'Uploading files...', color: 'text-orange-500' },
  save: { icon: CheckCircle, message: 'Saving changes...', color: 'text-green-500' },
  delete: { icon: AlertCircle, message: 'Deleting...', color: 'text-red-500' },
  search: { icon: Clock, message: 'Searching...', color: 'text-indigo-500' },
  general: { icon: Sparkles, message: 'Loading...', color: 'text-primary' }
};

// Enhanced Spinner Component with multiple rings
const SpinnerLoader: React.FC<{ size: LoadingSize; className?: string; color?: string }> = ({ 
  size, 
  className, 
  color = 'text-primary' 
}) => {
  const { icon } = sizeConfig[size];
  
  return (
    <div className={cn('relative', className)}>
      {/* Outer ring */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent',
          'border-t-primary/20 border-r-primary/20'
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Middle ring */}
      <motion.div
        className={cn(
          'absolute inset-1 rounded-full border-2 border-transparent',
          'border-t-primary/40 border-r-primary/40'
        )}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner ring */}
      <motion.div
        className={cn(
          'absolute inset-2 rounded-full border-2 border-transparent',
          'border-t-primary border-r-primary'
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center icon */}
      <motion.div
        className="flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Loader2 className={cn(icon, color)} />
      </motion.div>
    </div>
  );
};

// Enhanced Dots Loader with wave effect
const DotsLoader: React.FC<{ size: LoadingSize; className?: string; color?: string }> = ({ 
  size, 
  className, 
  color = 'bg-primary' 
}) => {
  const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', color, dotSize)}
          animate={{
            scale: [0.8, 1.4, 0.8],
            opacity: [0.4, 1, 0.4],
            y: [0, -8, 0]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.15,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Pulse Loader with ripple effect
const PulseLoader: React.FC<{ size: LoadingSize; className?: string; color?: string }> = ({ 
  size, 
  className, 
  color = 'bg-primary' 
}) => {
  const { icon } = sizeConfig[size];
  
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Ripple effect */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('absolute rounded-full border-2 border-primary/30', icon)}
          animate={{
            scale: [0.8, 2.5, 3],
            opacity: [0.8, 0.4, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.6,
            ease: 'easeOut'
          }}
        />
      ))}
      {/* Center dot */}
      <motion.div
        className={cn('rounded-full', color, icon)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

// Wave Loader
const WaveLoader: React.FC<{ size: LoadingSize; className?: string; color?: string }> = ({ 
  size, 
  className, 
  color = 'bg-primary' 
}) => {
  const barSize = size === 'xs' ? 'w-1 h-3' : size === 'sm' ? 'w-1.5 h-4' : size === 'md' ? 'w-2 h-6' : size === 'lg' ? 'w-2.5 h-8' : 'w-3 h-10';
  
  return (
    <div className={cn('flex items-end justify-center space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', color, barSize)}
          animate={{
            scaleY: [0.3, 1, 0.3],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Orbit Loader
const OrbitLoader: React.FC<{ size: LoadingSize; className?: string; color?: string }> = ({ 
  size, 
  className, 
  color = 'text-primary' 
}) => {
  const { icon } = sizeConfig[size];
  
  return (
    <div className={cn('relative', className)}>
      {/* Orbiting dots */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.3
          }}
        >
          <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full', color)} />
        </motion.div>
      ))}
      {/* Center icon */}
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={cn(icon, color)} />
        </motion.div>
      </div>
    </div>
  );
};

// Shimmer Loader
const ShimmerLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const { icon } = sizeConfig[size];
  
  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <motion.div
        className={cn('bg-gradient-to-r from-transparent via-primary/20 to-transparent', icon)}
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
};

// Skeleton Loader
const SkeletonLoader: React.FC<{ 
  size: LoadingSize; 
  className?: string;
  lines?: number;
  width?: string;
}> = ({ size, className, lines = 3, width = 'w-full' }) => {
  const { container } = sizeConfig[size];
  
  return (
    <div className={cn('space-y-2', container, className)}>
      <SkeletonText lines={lines} lastLineWidth={width} />
    </div>
  );
};

// Progress Loader
const ProgressLoader: React.FC<{ 
  size: LoadingSize; 
  className?: string;
  progress?: number;
  showPercentage?: boolean;
}> = ({ size, className, progress = 0, showPercentage = false }) => {
  const { container } = sizeConfig[size];
  
  return (
    <div className={cn('w-full', container, className)}>
      <div className="w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-2 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <div className="text-center mt-2 text-sm text-muted-foreground">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Success State
const SuccessState: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const { icon } = sizeConfig[size];
  
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <CheckCircle className={cn(icon, 'text-green-500')} />
    </motion.div>
  );
};

// Error State
const ErrorState: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const { icon } = sizeConfig[size];
  
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AlertCircle className={cn(icon, 'text-destructive')} />
    </motion.div>
  );
};

// Main Loading Component
export const Loading: React.FC<BaseLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  context = 'general',
  className,
  message,
  showMessage = true,
  fullScreen = false,
  overlay = false,
  progress,
  showPercentage = false,
  showIcon = true,
  animated = true
}) => {
  const { text, container, spacing } = sizeConfig[size];
  const contextInfo = contextConfig[context];
  const displayMessage = message || contextInfo.message;
  const contextColor = contextInfo.color;
  
  const renderLoader = () => {
    const commonProps = { size, className: 'mx-auto' };
    
    switch (variant) {
      case 'spinner':
        return <SpinnerLoader {...commonProps} color={contextColor} />;
      case 'dots':
        return <DotsLoader {...commonProps} color={contextColor.replace('text-', 'bg-')} />;
      case 'pulse':
        return <PulseLoader {...commonProps} color={contextColor.replace('text-', 'bg-')} />;
      case 'wave':
        return <WaveLoader {...commonProps} color={contextColor.replace('text-', 'bg-')} />;
      case 'orbit':
        return <OrbitLoader {...commonProps} color={contextColor} />;
      case 'shimmer':
        return <ShimmerLoader {...commonProps} />;
      case 'skeleton':
        return <SkeletonLoader size={size} />;
      case 'progress':
        return <ProgressLoader size={size} progress={progress} showPercentage={showPercentage} />;
      case 'success':
        return <SuccessState size={size} />;
      case 'error':
        return <ErrorState size={size} />;
      default:
        return <SpinnerLoader {...commonProps} color={contextColor} />;
    }
  };

  const content = (
    <motion.div 
      className={cn(
        'flex flex-col items-center justify-center',
        spacing,
        container,
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Context icon */}
      {showIcon && variant !== 'skeleton' && (
        <motion.div
          className="mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <contextInfo.icon className={cn('h-6 w-6', contextColor)} />
        </motion.div>
      )}
      
      {/* Main loader */}
      <div className="relative">
        {renderLoader()}
      </div>
      
      {/* Message */}
      {showMessage && displayMessage && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className={cn('font-medium', text, contextColor)}>
            {displayMessage}
          </p>
          {progress !== undefined && showPercentage && (
            <p className={cn('text-xs text-muted-foreground mt-1')}>
              {Math.round(progress)}% complete
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Simple Circle Loading for Page Center
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-4">
      {/* Simple circle spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Message */}
      <motion.p
        className="text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  </div>
);

export const DataLoading: React.FC<{ 
  message?: string; 
  skeleton?: boolean;
}> = ({ 
  message = 'Loading data...', 
  skeleton = false
}) => {
  if (skeleton) {
    return <SkeletonCard lines={4} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {/* Simple circle spinner */}
      <div className="relative">
        <div className="w-8 h-8 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Message */}
      <p className="text-sm font-medium text-muted-foreground">
        {message}
      </p>
    </div>
  );
};

export const ButtonLoading: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  size = 'sm'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-2'
  };

  return (
    <div className="relative">
      <div className={cn('border-primary/20 rounded-full', sizeClasses[size])}></div>
      <div className={cn('absolute top-0 left-0 border-primary border-t-transparent rounded-full animate-spin', sizeClasses[size])}></div>
    </div>
  );
};

export const FormLoading: React.FC<{ message?: string }> = ({ message }) => (
  <Loading
    variant="wave"
    context="form"
    size="md"
    message={message}
  />
);

export const UploadLoading: React.FC<{ message?: string; progress?: number }> = ({ 
  message, 
  progress 
}) => (
  <Loading
    variant={progress !== undefined ? 'progress' : 'pulse'}
    context="upload"
    size="lg"
    message={message}
    progress={progress}
    showPercentage={true}
  />
);

export const SearchLoading: React.FC<{ message?: string }> = ({ message }) => (
  <Loading
    variant="wave"
    context="search"
    size="md"
    message={message}
  />
);

export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 4 }) => (
  <SkeletonCard lines={lines} />
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <SkeletonTable rows={rows} columns={columns} />
);

// Loading with retry functionality
interface LoadingWithRetryProps extends BaseLoadingProps {
  onRetry?: () => void;
  retryMessage?: string;
  maxRetries?: number;
  retryCount?: number;
}

export const LoadingWithRetry: React.FC<LoadingWithRetryProps> = ({
  onRetry,
  retryMessage = 'Something went wrong. Please try again.',
  maxRetries = 3,
  retryCount = 0,
  ...props
}) => {
  const canRetry = retryCount < maxRetries && onRetry;
  
  if (retryCount >= maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive mb-4">{retryMessage}</p>
        <p className="text-sm text-muted-foreground">
          Maximum retry attempts reached.
        </p>
      </div>
    );
  }

  if (canRetry) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive mb-4">{retryMessage}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again ({retryCount + 1}/{maxRetries})
        </button>
      </div>
    );
  }

  return <Loading {...props} />;
};

// Loading states for different contexts
export const LoadingStates = {
  Page: PageLoading,
  Data: DataLoading,
  Button: ButtonLoading,
  Form: FormLoading,
  Upload: UploadLoading,
  Search: SearchLoading,
  Card: CardSkeleton,
  Table: TableSkeleton,
  WithRetry: LoadingWithRetry
};

// Simple Circle Spinner - Most commonly used
export const CircleSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}> = ({ 
  size = 'md', 
  message,
  className 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      <div className="relative">
        <div className={cn('border-primary/20 rounded-full', sizeClasses[size])}></div>
        <div className={cn('absolute top-0 left-0 border-primary border-t-transparent rounded-full animate-spin', sizeClasses[size])}></div>
      </div>
      
      {message && (
        <motion.p
          className="text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default Loading;
