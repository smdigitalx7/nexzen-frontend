import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { useMonthlyFeeConfig } from "@/lib/hooks/college/useMonthlyFeeConfig";
import type { MonthlyFeeConfigUpdate } from "@/lib/types/college/monthly-fee-config";

const MonthlyFeeConfigTab = () => {
  const {
    monthlyFeeConfig, // Data from GET /api/v1/college/monthly-fee-config
    isLoadingMonthlyFeeConfig,
    monthlyFeeConfigError,
    refetchMonthlyFeeConfig,
    createMonthlyFeeConfig,
    updateMonthlyFeeConfig,
  } = useMonthlyFeeConfig();

  const [feeAmount, setFeeAmount] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when data loads
  useEffect(() => {
    if (monthlyFeeConfig) {
      // Convert to number first in case it's a string (Decimal from backend)
      const amount = typeof monthlyFeeConfig.fee_amount === 'string' 
        ? parseFloat(monthlyFeeConfig.fee_amount) 
        : monthlyFeeConfig.fee_amount;
      setFeeAmount(amount.toString());
    } else {
      setFeeAmount("");
    }
  }, [monthlyFeeConfig]);

  const handleSave = async () => {
    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    setIsSaving(true);
    try {
      if (monthlyFeeConfig) {
        // Update existing config
        await updateMonthlyFeeConfig.mutateAsync({ fee_amount: amount });
      } else {
        // Create new config
        await createMonthlyFeeConfig.mutateAsync({ fee_amount: amount });
      }
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingMonthlyFeeConfig;
  const errorStatus = monthlyFeeConfigError ? (monthlyFeeConfigError as any)?.response?.status : null;
  const notFound = errorStatus === 404;
  const hasError = monthlyFeeConfigError && !notFound;

  // Show form if: not loading AND (has config OR 404 not found OR no error)
  const showForm = !isLoading && (monthlyFeeConfig || notFound || !monthlyFeeConfigError);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupeeIcon className="h-5 w-5" />
          Monthly Fee Configuration
        </CardTitle>
        <CardDescription>
          {monthlyFeeConfig 
            ? "Update the monthly fee amount for this college branch"
            : "Create the monthly fee amount for this college branch"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading configuration...
          </div>
        )}

        {hasError && (
          <div className="text-sm text-destructive">
            Error loading configuration: {(monthlyFeeConfigError as any)?.response?.data?.detail || "Unknown error"}
          </div>
        )}

        {showForm && (
          <>
            {/* Display current config from GET request */}
            {monthlyFeeConfig && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Configuration</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{(() => {
                        const amount = typeof monthlyFeeConfig.fee_amount === 'string' 
                          ? parseFloat(monthlyFeeConfig.fee_amount) 
                          : monthlyFeeConfig.fee_amount;
                        return amount.toFixed(2);
                      })()} per month
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fee_amount">
                {monthlyFeeConfig ? "Update Monthly Fee Amount (₹)" : "Set Monthly Fee Amount (₹)"}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fee_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder={monthlyFeeConfig ? "Enter new fee amount" : "Enter monthly fee amount"}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !feeAmount || isNaN(parseFloat(feeAmount)) || parseFloat(feeAmount) < 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {monthlyFeeConfig ? "Update Config" : "Create Config"}
                </Button>
              </div>
              {notFound && (
                <p className="text-xs text-muted-foreground">
                  No configuration found. Enter the fee amount above and click "Create Config" to set it up.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyFeeConfigTab;

