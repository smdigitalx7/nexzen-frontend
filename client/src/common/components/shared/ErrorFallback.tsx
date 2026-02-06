import React from 'react';
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { router } from "@/routes/router";

interface ErrorFallbackProps {
    error: Error | null;
    errorCode?: string;
    onRetry?: () => void;
    enableRetry?: boolean;
    onGoHome?: () => void;
    onReload?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    errorCode = "ERR-500",
    onRetry,
    enableRetry = true,
    onGoHome = () => router.navigate("/", { replace: true }),
    onReload = () => window.location.reload()
}) => {
    // Determine if we can retry
    const canRetry = enableRetry && !!onRetry;

    // Split error code for display
    const codeNumber = errorCode.split("-")[1] || "500";

    return (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
          {/* Main Content - Side by Side Layout */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-8 gap-4 sm:gap-6 md:gap-8 lg:gap-12 min-h-0">
            {/* Left Side - Error Code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-4 sm:space-y-5 md:space-y-6 w-full md:w-auto">
              <div className="relative w-full flex items-center justify-center">
                <div className="text-[6rem] sm:text-[7rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
                  {codeNumber}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 dark:text-slate-300">
                    {errorCode}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error?.message && (
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm mx-auto">
                  <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 break-words text-center">
                    <span className="mr-1.5 sm:mr-2 text-sm sm:text-base">
                      ❌
                    </span>
                    <span className="font-semibold">Error:</span>{" "}
                    {error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 max-w-2xl w-full space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 text-center md:text-left">
              {/* Error Icon with Emoji */}
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="text-5xl sm:text-6xl md:text-7xl">🚨</div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight px-2 sm:px-0">
                  Oops! Something Went Wrong
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed px-2 sm:px-0">
                  <span className="text-lg sm:text-xl mr-1.5 sm:mr-2">😔</span>
                  We're sorry, but something unexpected happened. Our team has
                  been notified and is working on a fix.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-2 w-full sm:w-auto sm:justify-start md:justify-start">
                {canRetry && (
                  <Button
                    onClick={onRetry}
                    size="default"
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Try Again
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={onGoHome}
                  size="default"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-md"
                >
                  <Home className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Go Home
                </Button>

                <Button
                  variant="outline"
                  onClick={onReload}
                  size="default"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-md"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Reload Page
                </Button>
              </div>
            </div>
          </div>

          {/* Footer - Professional Design */}
          <div className="w-full px-3 sm:px-4 md:px-6 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-6xl mx-auto">
              {/* Subtle Separator */}
              <div className="relative mb-4 sm:mb-6 md:mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
                {/* Help Text */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8 px-2">
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="mr-1.5 sm:mr-2 text-sm sm:text-base md:text-lg">
                      💡
                    </span>
                    If this problem persists, please contact support with error
                    code{" "}
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs sm:text-sm md:text-base break-all sm:break-normal">
                      {errorCode}
                    </span>
                  </p>
                </div>

                {/* Contact Information */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 w-full px-2">
                  <a
                    href="mailto:contact@smdigitalx.com"
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all sm:break-normal"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">
                      📧
                    </span>
                    <span className="text-center sm:text-left">
                      contact@smdigitalx.com
                    </span>
                  </a>

                  <div className="hidden sm:block w-px h-4 sm:h-5 bg-slate-300 dark:bg-slate-700" />

                  <a
                    href="tel:+918184919998"
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">
                      📞
                    </span>
                    <span>+91 8184919998</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};
