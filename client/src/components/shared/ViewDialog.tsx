import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

// Icon imports
import {
  User,
  CreditCard,
  Receipt,
  FileText,
  Calendar,
  Phone,
  Hash,
  Building,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';

// Types for the ViewDialog component
export interface ViewDialogField {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'currency' | 'date' | 'phone' | 'email' | 'badge' | 'link';
  icon?: React.ReactNode;
  className?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface ViewDialogSection {
  title: string;
  icon?: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  fields: ViewDialogField[];
  className?: string;
}

export interface ViewDialogAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  className?: string;
}

export interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  headerContent?: React.ReactNode;
  sections?: ViewDialogSection[];
  actions?: ViewDialogAction[];
  children?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  showCloseButton?: boolean;
  closeButtonText?: string;
  isLoading?: boolean;
  loadingText?: string;
}

// Utility functions
const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') return 'N/A';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'Invalid Amount';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

const formatDate = (dateString: string | number | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getIconColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};

const getBadgeVariant = (variant: string): "default" | "secondary" | "destructive" | "outline" => {
  const variantMap = {
    default: 'default' as const,
    secondary: 'secondary' as const,
    destructive: 'destructive' as const,
    outline: 'outline' as const,
  };
  return variantMap[variant as keyof typeof variantMap] || 'default';
};

const getButtonVariant = (variant: string): "default" | "outline" | "secondary" | "destructive" | "ghost" => {
  const variantMap = {
    default: 'default' as const,
    outline: 'outline' as const,
    secondary: 'secondary' as const,
    destructive: 'destructive' as const,
    ghost: 'ghost' as const,
    link: 'outline' as const, // Map link to outline since Button doesn't support link
  };
  return variantMap[variant as keyof typeof variantMap] || 'default';
};

const renderFieldValue = (field: ViewDialogField) => {
  const { value, type, badgeVariant } = field;
  
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">N/A</span>;
  }

  switch (type) {
    case 'currency':
      return (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      );
    case 'date':
      return (
        <span className="font-semibold text-gray-900">
          {formatDate(value)}
        </span>
      );
    case 'phone':
      return (
        <span className="font-semibold text-gray-900 flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {value}
        </span>
      );
    case 'email':
      return (
        <span className="font-semibold text-gray-900 flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {value}
        </span>
      );
    case 'badge':
      return (
        <Badge variant={getBadgeVariant(badgeVariant || 'default')}>
          {String(value)}
        </Badge>
      );
    case 'link':
      return (
        <span className="font-semibold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer">
          {value}
          <ExternalLink className="h-3 w-3" />
        </span>
      );
    default:
      return (
        <span className="font-semibold text-gray-900">
          {String(value)}
        </span>
      );
  }
};

const ViewDialog: React.FC<ViewDialogProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  iconColor = 'blue',
  headerContent,
  sections = [],
  actions = [],
  children,
  className,
  maxWidth = '2xl',
  showCloseButton = true,
  closeButtonText = 'Close',
  isLoading = false,
  loadingText = 'Loading data...',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        `${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col p-0`,
        className
      )}>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {icon && (
              <div className={cn("p-2 rounded-lg", getIconColorClasses(iconColor))}>
                {icon}
              </div>
            )}
            <div>
              <div>{title}</div>
              {subtitle && (
                <div className="text-sm font-normal text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading 
                size="lg" 
                variant="spinner" 
                context="data" 
                message={loadingText}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn("space-y-6", className?.includes("compact") && "space-y-3")}
            >
            {/* Custom Header Content */}
            {headerContent && (
              <>
                {headerContent}
                <Separator />
              </>
            )}

            {/* Sections */}
            {sections && sections.length > 0 ? sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={cn(
                "bg-white border border-gray-200 rounded-xl p-6 shadow-sm",
                section.className
              )}
            >
              <div className={cn("flex items-center gap-3 mb-4", section.className?.includes("compact") && "mb-2")}>
                {section.icon && (
                  <div className={cn(
                    "p-2 rounded-lg",
                    getIconColorClasses(section.iconColor || 'blue')
                  )}>
                    {section.icon}
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h4>
              </div>
              <div className={cn("space-y-4", section.className?.includes("compact") && "space-y-2")}>
                {section.fields && section.fields.length > 0 ? (
                  section.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      className={cn(
                        "flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0",
                        section.className?.includes("compact") && "py-1",
                        field.className
                      )}
                    >
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        {field.icon}
                        {field.label}
                      </span>
                      {renderFieldValue(field)}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No information available</div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm italic">No information to display</div>
            </div>
          )}

          {/* Custom Children Content */}
          {children}

            {/* Footer Actions */}
            {(actions.length > 0 || showCloseButton) && (
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {/* You can add last updated info here if needed */}
                </div>
                <div className="flex gap-3">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={getButtonVariant(action.variant || 'default')}
                      onClick={action.onClick}
                      className={cn("px-6", action.className)}
                      disabled={isLoading}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </Button>
                  ))}
                  {showCloseButton && (
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="px-6"
                      disabled={isLoading}
                    >
                      {closeButtonText}
                    </Button>
                  )}
                </div>
              </div>
            )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDialog;

// Export utility functions and types for external use
export {
  formatCurrency,
  formatDate,
  getIconColorClasses,
  getBadgeVariant,
  getButtonVariant,
  renderFieldValue,
};

