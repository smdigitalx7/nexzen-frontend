import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  FileText, 
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSchoolFinanceReport } from '@/lib/hooks/school/use-school-income-expenditure';
import { FinanceReportDialog } from './FinanceReportDialog';
import { SchoolFinanceReportParams } from '@/lib/types/school/income';
import { useAuthStore } from '@/store/authStore';

interface SchoolFinanceReportButtonsProps {
  className?: string;
}

export const SchoolFinanceReportButtons: React.FC<SchoolFinanceReportButtonsProps> = ({
  className,
}) => {
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportParams, setReportParams] = useState<SchoolFinanceReportParams | null>(null);

  // Query for finance report
  const { 
    data: reportData, 
    isLoading: reportLoading, 
    error: reportError
  } = useSchoolFinanceReport(reportParams || undefined);

  const handleDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportParams({ start_date: today, end_date: today });
    setShowReportDialog(true);
  };

  const handleCustomReport = () => {
    setShowCustomReportDialog(true);
  };

  const handleGenerateCustomReport = () => {
    if (customStartDate && customEndDate) {
      setReportParams({ 
        start_date: customStartDate, 
        end_date: customEndDate 
      });
      setShowCustomReportDialog(false);
      setShowReportDialog(true);
    }
  };

  const handleCloseReportDialog = () => {
    setShowReportDialog(false);
    setReportParams(null);
  };

  const handleCloseCustomDialog = () => {
    setShowCustomReportDialog(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={handleDailyReport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          Daily Report
        </Button>
        
        <Button
          onClick={handleCustomReport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Custom Report
        </Button>
      </div>

      {/* Custom Report Date Picker Dialog */}
      <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Custom Finance Report
            </DialogTitle>
            <DialogDescription>
              Select the date range for your custom finance report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                placeholder="Select start date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                placeholder="Select end date"
              />
            </div>
            
            {customStartDate && customEndDate && customStartDate > customEndDate && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                End date must be after start date.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCustomDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCustomReport}
              disabled={!customStartDate || !customEndDate || customStartDate > customEndDate}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finance Report Display Dialog */}
      <FinanceReportDialog
        open={showReportDialog}
        onOpenChange={handleCloseReportDialog}
        reportData={reportData || []}
        loading={reportLoading}
      />

      {/* Error Display */}
      {reportError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="text-red-600 text-sm">
              ❌ Failed to load finance report. Please try again.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolFinanceReportButtons;
