import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Download, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `receipt-${Date.now()}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "The PDF is being downloaded.",
      });
    }
  };


  const handleConfirmClose = () => {
    setIsLoading(false);
    setHasError(false);
    onClose();
  };


  // Allow modal to close on backdrop click
  const handleBackdropClick = () => {
    handleConfirmClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          // Don't call handleClose here as it shows confirmation dialog
          // Instead, directly call onClose to avoid conflicts
          onClose();
        }
      }} modal={false}>
        <DialogContent
          className="max-w-3xl w-full h-[95vh] p-0 z-[9999]"
          onPointerDownOutside={handleBackdropClick}
          onEscapeKeyDown={() => {
            handleConfirmClose();
          }}
          showCloseButton={false}
          aria-describedby="receipt-preview-description"
          aria-modal="true"
          role="dialog"
        >
        <DialogHeader className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Receipt Preview
              </DialogTitle>
              <div id="receipt-preview-description" className="sr-only">
                Payment receipt preview with options to print, download, or close
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="default" size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handlePrint} variant="default" size="sm">
                <Printer className="h-4 w-4 " />
                Print
              </Button>
              <Button onClick={() => {
                handleConfirmClose();
              }} variant="outline" size="sm">
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
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
                src={blobUrl}
                className="w-full h-full border-0 rounded-md"
                title="Receipt Preview"
                style={{ minHeight: "700px" }}
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
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Failed to display PDF
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  You can still download the PDF
                </p>
                <Button onClick={handleDownload} variant="outline" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    </>
  );
};

export default ReceiptPreviewModal;
