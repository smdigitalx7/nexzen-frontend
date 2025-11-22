import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/common/components/ui/button";
import { Printer, X, Download, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "@/common/hooks/use-toast";

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const originalOverflowRef = useRef<string>("");
  const isClosingRef = useRef(false);

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

    // IMMEDIATELY restore body overflow - CRITICAL for UI responsiveness
    // This must happen synchronously before any other operations
    const originalValue = originalOverflowRef.current || "";
    document.body.style.overflow = originalValue;
    
    // Reset state immediately
    setIsLoading(false);
    setHasError(false);
    
    // Call onClose immediately - must be synchronous, not async
    // Use requestAnimationFrame to ensure DOM updates complete first
    requestAnimationFrame(() => {
      onClose();
      // Reset closing flag after a brief delay to allow modal to fully unmount
      setTimeout(() => {
        isClosingRef.current = false;
      }, 100);
    });
  }, [onClose]);

  useEffect(() => {
    if (isOpen && blobUrl) {
      setIsLoading(true);
      setHasError(false);

      // Reduced delay to ensure modal shows faster
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    } else if (isOpen && !blobUrl) {
      setHasError(true);
      setIsLoading(false);
    }
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
      // This is critical to prevent UI freeze
      const originalValue = originalOverflowRef.current || "";
      document.body.style.overflow = originalValue;
      // Clear the ref after restoring
      originalOverflowRef.current = "";
    }
    return () => {
      // Always restore on unmount - critical cleanup
      // Use synchronous operation to ensure it happens immediately
      const originalValue = originalOverflowRef.current || "";
      if (originalValue) {
        document.body.style.overflow = originalValue;
        originalOverflowRef.current = "";
      } else {
        // Fallback: if ref is empty, just clear any overflow restriction
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleConfirmClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleConfirmClose]);

  const handlePrint = () => {
    if (blobUrl) {
      // Create a new window for printing
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
  };

  const handleDownload = async () => {
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

      // Create and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `receipt-${Date.now()}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Wait a moment to ensure download starts
      await new Promise((resolve) => setTimeout(resolve, 500));

      document.body.removeChild(link);

      // Show success notification
      toast({
        title: "Download Complete",
        description: "Receipt PDF has been downloaded successfully.",
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
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
      toast({
        title: "Opened in New Tab",
        description: "Receipt has been opened in a new browser tab.",
        variant: "info",
      });
    }
  };

  if (!isOpen || !mounted) {
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] bg-background flex flex-col"
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
      style={{ pointerEvents: "auto" }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-background shadow-sm">
        <div className="flex items-center gap-4">
          <h2 id="receipt-preview-title" className="text-xl font-semibold">
            Receipt Preview
          </h2>
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
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button
            onClick={() => void handleDownload()}
            variant="default"
            size="sm"
            disabled={!blobUrl || isDownloading}
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
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleConfirmClose} variant="outline" size="sm">
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
              key={blobUrl} // Force remount when blobUrl changes
              src={blobUrl}
              className="w-full h-full border-0"
              title="Receipt Preview"
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
