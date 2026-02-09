import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export all utilities from subdirectories for backward compatibility
export * from './formatting';
export * from './performance';
export * from './export';
export * from './factory';
export * from './navigation';
export * from './payment';
export * from './query';
export * from './security';
export * from './accessibility';
export * from './auth';
export * from './cookie';