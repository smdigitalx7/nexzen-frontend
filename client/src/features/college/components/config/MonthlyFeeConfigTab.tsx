import { useState, useEffect } from "react";
import { Save, Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { useMonthlyFeeConfig } from "@/features/college/hooks/useMonthlyFeeConfig";
import type { MonthlyFeeConfigCreate, MonthlyFeeConfigUpdate } from "@/features/college/types/monthly-fee-config";

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

  const handleCreate = async () => {
    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    setIsSaving(true);
    try {
      // Create new config using POST /api/v1/college/monthly-fee-config
      await createMonthlyFeeConfig.mutateAsync({ fee_amount: amount } as MonthlyFeeConfigCreate);
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    setIsSaving(true);
    try {
      // Update existing config using PUT /api/v1/college/monthly-fee-config
      await updateMonthlyFeeConfig.mutateAsync({ fee_amount: amount } as MonthlyFeeConfigUpdate);
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingMonthlyFeeConfig;
  // If monthlyFeeConfig is null, it means 404 (config doesn't exist) - this is handled gracefully
  // If monthlyFeeConfigError exists, it's a real error (not 404)
  const hasError = monthlyFeeConfigError !== null && monthlyFeeConfigError !== undefined;
  const notFound = monthlyFeeConfig === null; // null means 404 was handled gracefully

  // Show form if: not loading AND no real error
  // Form should always show when not loading, allowing user to create config
  const showForm = !isLoading && !hasError;

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
                {monthlyFeeConfig ? "Update Monthly Fee Amount (₹)" : "Create Monthly Fee Amount (₹)"}
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
                {monthlyFeeConfig ? (
                  <Button
                    onClick={handleUpdate}
                    disabled={isSaving || !feeAmount || isNaN(parseFloat(feeAmount)) || parseFloat(feeAmount) < 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Config
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreate}
                    disabled={isSaving || !feeAmount || isNaN(parseFloat(feeAmount)) || parseFloat(feeAmount) < 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Config
                  </Button>
                )}
              </div>
              {notFound && (
                <p className="text-xs text-muted-foreground">
                  No configuration found. Enter the fee amount above and click "Create Config" to create a new monthly fee configuration using POST /api/v1/college/monthly-fee-config.
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
