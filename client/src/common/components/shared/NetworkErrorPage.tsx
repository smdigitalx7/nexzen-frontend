/**
 * Network Error Page
 * 
 * Full-page creative network error page with unique design
 * Shows when network connection is lost or unstable
 */

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, AlertCircle, Wifi, Coffee } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkErrorPageProps {
  /** Whether to show the network error page */
  isVisible: boolean;
  /** Callback to retry network connection */
  onRetry: () => void;
}

export function NetworkErrorPage({ isVisible, onRetry }: NetworkErrorPageProps) {
  const [dots, setDots] = useState("");

  // Animated dots effect
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[99999] overflow-hidden"
      >
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-900/20 rounded-lg blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-2xl"
          />
        </div>

        {/* Main Content - Professional Split Layout */}
        <div className="relative z-10 h-full flex items-center justify-center px-6 lg:px-12 py-8">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md">
                {/* Desktop Monitor with WiFi Icon */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  {/* Monitor Screen */}
                  <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-2xl border-4 border-slate-300 dark:border-slate-600 relative overflow-hidden">
                    {/* Screen Content */}
                    <div className="aspect-video bg-white dark:bg-slate-900 rounded-lg m-2 flex items-center justify-center">
                      {/* WiFi Icon with Cross */}
                      <div className="relative">
                        <WifiOff className="w-24 h-24 text-red-500 dark:text-red-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-28 h-1 bg-red-500 dark:bg-red-400 rotate-45 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Monitor Stand */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-3 bg-slate-300 dark:bg-slate-600 rounded-b-lg" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-3 bg-slate-400 dark:bg-slate-700 rounded-lg" />
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col space-y-6 lg:space-y-8 text-center lg:text-left"
            >
              {/* Error Message */}
              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  No Internet
                </h1>
                <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium">
                  Slow Internet or You're Not Connected to the Internet
                </p>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-row flex-wrap gap-4 lg:gap-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Unable to reach the server</span>
                </div>
                <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Wifi className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <span className="text-sm font-medium">Checking connection{dots}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={onRetry}
                  size="default"
                  className="w-full lg:w-auto px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh Connection
                </Button>
              </div>

              {/* Helpful Tips */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                  Quick Tips
                </p>
                <div className="grid grid-cols-1 gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">•</span>
                    <span>Check your WiFi or ethernet connection</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">•</span>
                    <span>Restart your router if needed</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">•</span>
                    <span>Try disabling and re-enabling your network</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">•</span>
                    <span>Make sure you're not in airplane mode</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}