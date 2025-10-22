import React, { useState, useCallback } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  FileText, 
  Download,
  AlertCircle,
  Loader2
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [reportParams, setReportParams] = useState<SchoolFinanceReportParams | undefined>(undefined);

  // Query for finance report - only enabled when params are provided
  const { 
    data: reportData, 
    isLoading: reportLoading, 
    error: reportError
  } = useSchoolFinanceReport(reportParams);

  // Date validation helper
  const validateDateRange = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) return { isValid: false, message: 'Both dates are required' };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    if (start > end) {
      return { isValid: false, message: 'End date must be after start date' };
    }
    
    if (start > today) {
      return { isValid: false, message: 'Start date cannot be in the future' };
    }
    
    if (start < oneYearAgo) {
      return { isValid: false, message: 'Date range cannot exceed 1 year' };
    }
    
    return { isValid: true, message: '' };
  }, []);

  const handleDailyReport = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setReportParams({ start_date: today, end_date: today });
    setShowReportDialog(true);
  }, []);

  const handleCustomReport = useCallback(() => {
    setShowCustomReportDialog(true);
  }, []);

  const handleGenerateCustomReport = useCallback(() => {
    const validation = validateDateRange(customStartDate, customEndDate);
    if (validation.isValid) {
      setReportParams({ 
        start_date: customStartDate, 
        end_date: customEndDate 
      });
      setShowCustomReportDialog(false);
      setShowReportDialog(true);
    }
  }, [customStartDate, customEndDate, validateDateRange]);

  const handleCloseReportDialog = useCallback(() => {
    setShowReportDialog(false);
    setReportParams(undefined);
  }, []);

  const handleCloseCustomDialog = useCallback(() => {
    setShowCustomReportDialog(false);
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const dateValidation = validateDateRange(customStartDate, customEndDate);

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={handleDailyReport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={reportLoading}
          aria-label="Generate daily finance report"
        >
          {reportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarDays className="h-4 w-4" />
          )}
          Daily Report
        </Button>
        
        <Button
          onClick={handleCustomReport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={reportLoading}
          aria-label="Generate custom date range finance report"
        >
          {reportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
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
            
            {!dateValidation.isValid && customStartDate && customEndDate && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {dateValidation.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCustomDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCustomReport}
              disabled={!dateValidation.isValid || reportLoading}
            >
              {reportLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
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
        <div className="fixed bottom-4 right-4 z-50">
          <Alert variant="destructive" className="max-w-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load finance report. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
};

export default SchoolFinanceReportButtons;
