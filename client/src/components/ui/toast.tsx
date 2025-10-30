import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-xl border-2 p-5 pr-12 shadow-xl backdrop-blur-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white/95 text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-50",
        destructive:
          "destructive group border-red-200 bg-gradient-to-br from-red-50 to-red-100/80 text-red-900 dark:border-red-900/50 dark:from-red-950/50 dark:to-red-900/30 dark:text-red-100",
        success:
          "success group border-green-200 bg-gradient-to-br from-green-50 to-green-100/80 text-green-900 dark:border-green-900/50 dark:from-green-950/50 dark:to-green-900/30 dark:text-green-100",
        info:
          "info group border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/80 text-blue-900 dark:border-blue-900/50 dark:from-blue-950/50 dark:to-blue-900/30 dark:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastIcon = ({ variant }: { variant?: string }) => {
  const iconClass = "h-5 w-5 shrink-0 mt-0.5"
  
  switch (variant) {
    case "success":
      return <CheckCircle2 className={cn(iconClass, "text-green-600 dark:text-green-400")} />
    case "destructive":
      return <XCircle className={cn(iconClass, "text-red-600 dark:text-red-400")} />
    case "info":
      return <Info className={cn(iconClass, "text-blue-600 dark:text-blue-400")} />
    default:
      return <AlertCircle className={cn(iconClass, "text-slate-600 dark:text-slate-400")} />
  }
}

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 opacity-0 transition-all hover:text-slate-900 hover:bg-slate-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 group-hover:opacity-100 group-[.destructive]:text-red-600 group-[.destructive]:hover:text-red-900 group-[.destructive]:hover:bg-red-200 group-[.destructive]:focus:ring-red-400 group-[.success]:text-green-600 group-[.success]:hover:text-green-900 group-[.success]:hover:bg-green-200 group-[.success]:focus:ring-green-400 group-[.info]:text-blue-600 group-[.info]:hover:text-blue-900 group-[.info]:hover:bg-blue-200 group-[.info]:focus:ring-blue-400 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-80 leading-relaxed mt-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
