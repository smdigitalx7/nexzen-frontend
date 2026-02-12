/**
 * Indian Rupee Icon Component
 * Displays the ₹ symbol as a reusable icon component compatible with LucideIcon interface
 */
import React from 'react';
import { cn } from '@/common/utils';

interface IndianRupeeIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const IndianRupeeIcon: React.FC<IndianRupeeIconProps> = ({ 
  className,
  ...props
}) => {
  // Extract size from className if present (Lucide icons typically use h-* w-* classes)
  const sizeMatch = className?.match(/(?:h-|w-)(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16; // Convert Tailwind size to px
  
  return (
    <span 
      className={cn("font-bold inline-flex items-center justify-center", className)}
      style={{ 
        fontSize: `${size}px`, 
        lineHeight: 1,
        ...(props.style || {})
      }}
      {...props}
    >
      ₹
    </span>
  );
};

export default IndianRupeeIcon;

