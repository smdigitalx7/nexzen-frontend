/**
 * Idle Timeout Warning Dialog
 *
 * Shows a warning dialog before the user is logged out due to inactivity.
 * User can extend their session by clicking "Stay Logged In".
 */

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";

interface IdleTimeoutWarningDialogProps {
  /** Whether the warning dialog should be open */
  readonly isOpen: boolean;
  /** Seconds remaining before logout */
  readonly secondsRemaining: number;
  /** Called when user clicks "Stay Logged In" */
  readonly onExtendSession: () => void;
  /** Called when the countdown reaches 0 */
  readonly onTimeout: () => void;
}

export function IdleTimeoutWarningDialog({
  isOpen,
  secondsRemaining,
  onExtendSession,
  onTimeout,
}: IdleTimeoutWarningDialogProps) {
  const [countdown, setCountdown] = useState(secondsRemaining);

  // Update countdown when secondsRemaining changes
  useEffect(() => {
    if (isOpen && secondsRemaining > 0) {
      setCountdown(secondsRemaining);
    }
  }, [isOpen, secondsRemaining]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return newCount;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdown, onTimeout]);

  // Format time display (e.g., "1:00" or "0:30")
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExtendSession = () => {
    onExtendSession();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-orange-600">
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            You have been inactive for a while. Your session will expire in{" "}
            <span className="font-bold text-orange-600 text-lg">
              {formatTime(countdown)}
            </span>
            {"."}
          </AlertDialogDescription>
          <AlertDialogDescription className="pt-1">
            Click "Stay Logged In" to continue your session, or you will be
            automatically logged out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleExtendSession}
            className="bg-primary hover:bg-primary/90"
          >
            Stay Logged In
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onTimeout}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Log Out Now
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
