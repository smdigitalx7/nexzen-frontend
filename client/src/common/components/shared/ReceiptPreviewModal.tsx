import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/common/components/ui/button";
import {
  Printer,
  X,
  Download,
  AlertCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { toast } from "@/common/hooks/use-toast";
import { cn } from "@/common/utils";

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  receiptNo?: string | null; // Receipt number from backend
  receiptTitle?: string; // Custom title (defaults to "Receipt Preview")
  className?: string;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  receiptNo,
  receiptTitle = "Receipt Preview",
  className,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const originalOverflowRef = useRef<string>("");
  const isClosingRef = useRef(false);
  const escapeHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const closingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate filename from receipt number or fallback
  const downloadFilename = useMemo(() => {
    if (receiptNo) {
      return `Receipt_${receiptNo}.pdf`;
    }
    return `receipt-${Date.now()}.pdf`;
  }, [receiptNo]);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleConfirmClose = useCallback(() => {
    // Prevent multiple simultaneous close operations
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;

    // ✅ CRITICAL FIX: Restore body overflow IMMEDIATELY - synchronous, no delay
    const originalValue = originalOverflowRef.current || "";
    document.body.style.overflow = originalValue;
    originalOverflowRef.current = "";

    // ✅ CRITICAL FIX: Clear iframe src immediately to prevent background processing
    if (iframeRef.current) {
      try {
        iframeRef.current.src = "about:blank";
        iframeRef.current = null;
      } catch {
        // Ignore errors during cleanup
      }
    }

    // ✅ CRITICAL FIX: Reset state immediately - synchronous
    setIsLoading(false);
    setHasError(false);

    // ✅ CRITICAL FIX: Remove Escape key listener immediately - synchronous
    if (escapeHandlerRef.current) {
      document.removeEventListener("keydown", escapeHandlerRef.current);
      escapeHandlerRef.current = null;
    }

    // ✅ CRITICAL FIX: Call onClose in requestAnimationFrame (ensures DOM updates)
    requestAnimationFrame(() => {
      onClose();
    });

    // ✅ FIX: Reset closing flag after a brief delay (with cleanup tracking)
    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
    }
    closingTimeoutRef.current = setTimeout(() => {
      isClosingRef.current = false;
      closingTimeoutRef.current = null;
    }, 100);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && blobUrl) {
      setIsLoading(true);
      setHasError(false);

      // ✅ FIX: Reduced delay to ensure modal shows faster (with cleanup tracking)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 200);
    } else if (isOpen && !blobUrl) {
      setHasError(true);
      setIsLoading(false);
    }

    // ✅ FIX: Cleanup timeouts on unmount
    return () => {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isOpen, blobUrl]);

  // Prevent body scroll when modal is open - with proper cleanup
  useEffect(() => {
    if (isOpen) {
      // Store original overflow value if not already stored
      if (!originalOverflowRef.current) {
        originalOverflowRef.current = document.body.style.overflow || "";
      }
      document.body.style.overflow = "hidden";
    } else {
      // IMMEDIATELY restore original overflow value when modal closes
      const originalValue = originalOverflowRef.current || "";
      document.body.style.overflow = originalValue;
      originalOverflowRef.current = "";
    }
    return () => {
      // ✅ FIX: Always restore on unmount - critical cleanup
      const originalValue = originalOverflowRef.current || "";
      if (originalValue) {
        document.body.style.overflow = originalValue;
        originalOverflowRef.current = "";
      } else {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  // ✅ FIX: Additional safety net - restore body overflow on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      document.body.style.overflow = originalOverflowRef.current || "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.body.style.overflow = originalOverflowRef.current || "";
    };
  }, []);

  // ✅ FIX: Handle Escape key with stable handler reference
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleConfirmClose();
      }
    };

    escapeHandlerRef.current = handleEscape;
    document.addEventListener("keydown", handleEscape);

    return () => {
      if (escapeHandlerRef.current) {
        document.removeEventListener("keydown", escapeHandlerRef.current);
        escapeHandlerRef.current = null;
      }
    };
  }, [isOpen, handleConfirmClose]);

  // ✅ FIX: Cleanup iframe on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = "about:blank";
        iframeRef.current = null;
      }
    };
  }, []);

  const handlePrint = useCallback(() => {
    if (blobUrl) {
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            toast({
              title: "Print Started",
              description: "The print dialog should appear now.",
              variant: "info",
            });
          }, 1000);
        };
      } else {
        toast({
          title: "Print Failed",
          description: "Popup blocked. Please allow popups and try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Print Failed",
        description: "No PDF available to print.",
        variant: "destructive",
      });
    }
  }, [blobUrl]);

  const handleDownload = useCallback(async () => {
    if (!blobUrl) {
      toast({
        title: "Download Failed",
        description: "No PDF available to download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Verify the blob is accessible before attempting download
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error("PDF not ready");
      }

      // Create and trigger download with proper filename
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadFilename; // Use receipt number if available
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Wait a moment to ensure download starts
      await new Promise((resolve) => setTimeout(resolve, 500));

      link.remove();

      // Show success notification
      toast({
        title: "Download Complete",
        description: receiptNo
          ? `Receipt (${receiptNo}) has been downloaded successfully.`
          : "Receipt has been downloaded successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [blobUrl, downloadFilename, receiptNo]);

  const handleOpenInNewTab = useCallback(() => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
      toast({
        title: "Opened in New Tab",
        description: "Receipt has been opened in a new browser tab.",
        variant: "info",
      });
    }
  }, [blobUrl]);

  if (!isOpen || !mounted) {
    return null;
  }

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-[10000] bg-background flex flex-col",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-preview-title"
      aria-describedby="receipt-preview-description"
      onClick={(e) => {
        // Close on backdrop click (but not on content click)
        if (e.target === e.currentTarget) {
          handleConfirmClose();
        }
      }}
      onKeyDown={(e) => {
        // Close on Escape key (backup to the global handler)
        if (e.key === "Escape") {
          handleConfirmClose();
        }
      }}
      style={{ pointerEvents: "auto" }}
      tabIndex={-1}
    >
      {/* Header Bar - Redesigned */}
      <div className="flex items-center justify-between p-4 border-b bg-background shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="receipt-preview-title" className="text-xl font-semibold">
                {receiptTitle}
              </h2>
              {receiptNo && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Receipt No:{" "}
                  <span className="font-medium text-foreground">
                    {receiptNo}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div id="receipt-preview-description" className="sr-only">
            Payment receipt preview with options to print, download, open in new
            tab, or close
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenInNewTab}
            variant="outline"
            size="sm"
            disabled={!blobUrl}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button
            onClick={() => void handleDownload()}
            variant="default"
            size="sm"
            disabled={!blobUrl || isDownloading}
            title="Download receipt"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
          <Button
            onClick={handlePrint}
            variant="default"
            size="sm"
            disabled={!blobUrl}
            title="Print receipt"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleConfirmClose}
            variant="outline"
            size="sm"
            title="Close"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Content Area - Full Screen */}
      <div className="flex-1 relative overflow-hidden bg-muted/30">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">
                Loading receipt...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while the PDF loads
              </p>
            </div>
          </div>
        )}

        {blobUrl ? (
          <div className="w-full h-full">
            <iframe
              ref={iframeRef}
              key={blobUrl}
              src={blobUrl}
              className="w-full h-full border-0"
              title={
                receiptNo ? `Receipt Preview - ${receiptNo}` : "Receipt Preview"
              }
              onLoad={() => {
                setIsLoading(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">No receipt available</p>
              <p className="text-sm mt-2">
                Please try regenerating the receipt
              </p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-20">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                Failed to display PDF
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You can still download the PDF or open it in a new tab
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={handleOpenInNewTab}
                  variant="outline"
                  size="lg"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => void handleDownload()}
                  variant="default"
                  size="lg"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render modal at document body level to avoid z-index conflicts
  return createPortal(modalContent, document.body);
};

export default ReceiptPreviewModal;
