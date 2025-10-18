import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useMobileDetection, useTouchFeedback } from '@/lib/utils/mobile-enhancements';
import { Eye, EyeOff, Search, X, Check, AlertCircle } from 'lucide-react';

export interface MobileInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  required?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  success = false,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  showClearButton = false,
  showSearchButton = false,
  onSearch,
  onClear,
  required = false,
  fullWidth = false,
  variant = 'default',
  size = 'md',
  className,
  value,
  onChange,
  ...props
}) => {
  const { isMobile } = useMobileDetection();
  const { touchProps } = useTouchFeedback();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = props.id || `mobile-input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  const isPassword = props.type === 'password';
  const inputType = isPassword && showPassword ? 'text' : props.type;

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return 'bg-muted border-0 focus:bg-background';
      case 'outlined':
        return 'bg-transparent border-2';
      default:
        return 'bg-background border';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return isMobile ? 'h-10 text-base' : 'h-8 text-sm';
      case 'lg':
        return isMobile ? 'h-12 text-lg' : 'h-10 text-base';
      default:
        return isMobile ? 'h-11 text-base' : 'h-9 text-sm';
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    if (onSearch && value) {
      onSearch(value.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      handleSearch();
    }
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <Label 
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            success && 'text-success-600',
            isMobile && 'text-base'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <Input
          ref={inputRef}
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            getVariantStyles(),
            getSizeStyles(),
            leftIcon && 'pl-10',
            (rightIcon || showPasswordToggle || showClearButton || showSearchButton) && 'pr-10',
            error && 'border-destructive focus:border-destructive focus:ring-destructive',
            success && 'border-success-500 focus:border-success-500 focus:ring-success-500',
            isFocused && 'ring-2 ring-offset-2',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={cn(errorId, helperId)}
          aria-required={required}
          {...props}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showPasswordToggle && isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              {...touchProps}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {showClearButton && value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              aria-label="Clear input"
              {...touchProps}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showSearchButton && onSearch && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleSearch}
              aria-label="Search"
              {...touchProps}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {rightIcon && !isPassword && !showClearButton && !showSearchButton && (
            <div className="text-muted-foreground" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
      
      {(error || helperText) && (
        <div className="space-y-1">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {helperText && !error && (
            <p className="text-sm text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-sm text-success-600">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Valid</span>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized search input
export const MobileSearchInput: React.FC<{
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  className,
  showFilters = false,
  onFilterClick,
  value = '',
  onChange,
}) => {
  const { isMobile } = useMobileDetection();
  const { touchProps } = useTouchFeedback();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleSearch = () => {
    onSearch?.(value);
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  return (
    <div className={cn('relative', className)}>
      <MobileInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        leftIcon={<Search className="h-4 w-4" />}
        showClearButton={!!value}
        showSearchButton={!!onSearch}
        onSearch={handleSearch}
        onClear={handleClear}
        className="pr-20"
      />
      
      {showFilters && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
          onClick={onFilterClick}
          {...touchProps}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Mobile-optimized textarea
export const MobileTextarea: React.FC<{
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
} & Omit<React.ComponentProps<'textarea'>, 'size'>> = ({
  label,
  error,
  success = false,
  helperText,
  required = false,
  fullWidth = false,
  className,
  rows = 3,
  maxLength,
  showCharCount = false,
  value,
  ...props
}) => {
  const { isMobile } = useMobileDetection();
  const textareaId = props.id || `mobile-textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <Label 
          htmlFor={textareaId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            success && 'text-success-600',
            isMobile && 'text-base'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          isMobile && 'text-base min-h-[44px]', // Prevent zoom on iOS
          error && 'border-destructive focus:border-destructive focus:ring-destructive',
          success && 'border-success-500 focus:border-success-500 focus:ring-success-500',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={cn(errorId, helperId)}
        aria-required={required}
        {...props}
      />
      
      {(error || helperText || showCharCount) && (
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            {error && (
              <p className="text-destructive">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className={cn(
              'text-muted-foreground',
              currentLength > maxLength * 0.9 && 'text-warning-600',
              currentLength >= maxLength && 'text-destructive'
            )}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
