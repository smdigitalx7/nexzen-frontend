import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { AlertTriangle, LogOut, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IdleTimeoutWarningDialogProps {
  open: boolean;
  remainingTime: number; // in milliseconds
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function IdleTimeoutWarningDialog({
  open,
  remainingTime,
  onStayLoggedIn,
  onLogout,
}: IdleTimeoutWarningDialogProps) {
  const secondsLeft = Math.ceil(remainingTime / 1000);
  
  // Dynamic color based on time remaining (turns deep red under 10s)
  const isCritical = secondsLeft <= 10;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onStayLoggedIn()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <DialogHeader>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4",
              isCritical ? "bg-red-100" : "bg-amber-100"
            )}
          >
            <AlertTriangle 
              className={cn("h-8 w-8", isCritical ? "text-red-600" : "text-amber-600")} 
              aria-hidden="true" 
            />
          </motion.div>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            Session Expiring
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Your session will expire soon due to inactivity. You'll be logged out automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={secondsLeft}
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "flex items-center gap-3 text-5xl font-black mb-1",
                isCritical ? "text-red-600" : "text-amber-600",
                isCritical && "animate-pulse"
              )}
            >
              <Clock className="h-10 w-10" />
              <span>{secondsLeft}s</span>
            </motion.div>
          </AnimatePresence>
          <motion.p 
            animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2"
          >
            Time Remaining
          </motion.p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onLogout}
            className="w-full sm:flex-1 h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Button
            type="button"
            onClick={onStayLoggedIn}
            className={cn(
              "w-full sm:flex-1 h-12 text-white font-semibold transition-all duration-300",
              isCritical 
                ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200" 
                : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper for class merging if not already available in this scope
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
