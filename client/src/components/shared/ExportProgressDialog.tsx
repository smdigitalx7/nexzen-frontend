import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/ProfessionalLoader";

interface ExportProgressDialogProps {
  open: boolean;
  progress: number;
  status: 'processing' | 'completed' | 'error';
  message?: string;
}

export const ExportProgressDialog = ({ open, progress, status, message }: ExportProgressDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporting Data</DialogTitle>
          <DialogDescription>
            {status === 'processing' && 'Please wait while we prepare your export...'}
            {status === 'completed' && 'Export completed successfully!'}
            {status === 'error' && 'An error occurred during export.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {status === 'processing' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{message || 'Processing...'}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          {status === 'completed' && (
            <div className="flex items-center justify-center py-4">
              <div className="text-center space-y-2">
                <div className="text-green-600 text-2xl">✓</div>
                <p className="text-sm text-muted-foreground">Export completed successfully!</p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center justify-center py-4">
              <div className="text-center space-y-2">
                <div className="text-red-600 text-2xl">✗</div>
                <p className="text-sm text-destructive">{message || 'An error occurred during export.'}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

