import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

interface BulkPayrollOperationsProps {
  employees: any[];
  onBulkCreate: (data: any[]) => void;
  onBulkExport: () => void;
  isLoading?: boolean;
}

export const BulkPayrollOperations = ({
  employees,
  onBulkCreate,
  onBulkExport,
  isLoading = false,
}: BulkPayrollOperationsProps) => {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [bulkMonth, setBulkMonth] = useState("");

  const handleBulkCreate = () => {
    try {
      const parsedData = JSON.parse(bulkData);
      onBulkCreate(parsedData);
      setShowBulkDialog(false);
      setBulkData("");
    } catch (error) {
      console.error("Invalid JSON data:", error);
    }
  };

  const generateSampleData = () => {
    const sampleData = employees.slice(0, 3).map(emp => ({
      employee_id: emp.employee_id,
      payroll_month: bulkMonth || new Date().toISOString().slice(0, 7),
      gross_pay: emp.salary || 50000,
      lop: 0,
      advance_deduction: 0,
      other_deductions: 0,
    }));
    setBulkData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setShowBulkDialog(true)}
                className="w-full h-20 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Upload className="h-6 w-6" />
                <span>Bulk Create Payrolls</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onBulkExport}
                className="w-full h-20 flex flex-col items-center gap-2"
                variant="outline"
                disabled={isLoading}
              >
                <Download className="h-6 w-6" />
                <span>Export Payrolls</span>
              </Button>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Bulk operations allow you to process multiple payrolls at once</span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Create Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Create Payrolls</DialogTitle>
            <DialogDescription>
              Create multiple payrolls at once by providing JSON data. Use the sample generator to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-month">Payroll Month</Label>
              <Input
                id="bulk-month"
                type="month"
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                placeholder="Select month"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bulk-data">Payroll Data (JSON)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSampleData}
                >
                  Generate Sample
                </Button>
              </div>
              <Textarea
                id="bulk-data"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="Enter JSON data for bulk payroll creation..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreate} disabled={!bulkData.trim()}>
              Create Payrolls
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
