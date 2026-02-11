import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { LogOut, Clock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

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
  
  // Dynamic color based on time remaining
  const isCritical = secondsLeft <= 10;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onStayLoggedIn()}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-amber-500">
        <DialogHeader className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200"
          >
            <ShieldAlert 
              className="h-8 w-8 text-amber-600" 
              aria-hidden="true" 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <DialogTitle className="text-center text-xl font-semibold">
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your session will expire due to inactivity. Would you like to continue?
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-amber-50/50 to-transparent rounded-lg border border-amber-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className={cn("h-6 w-6", isCritical ? "text-red-500" : "text-amber-600")} />
            <motion.span
              key={secondsLeft}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-4xl font-bold tabular-nums",
                isCritical ? "text-red-600" : "text-amber-600"
              )}
            >
              {secondsLeft}
            </motion.span>
            <span className={cn("text-xl font-medium", isCritical ? "text-red-600" : "text-amber-600")}>
              seconds
            </span>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Time Remaining
          </p>
        </motion.div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            className="w-full sm:flex-1 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout Now
          </Button>
          <Button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper for class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
