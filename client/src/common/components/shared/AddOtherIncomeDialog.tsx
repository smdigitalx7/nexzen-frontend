import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { toast } from "@/common/hooks/use-toast";
import {
  PAYMENT_METHOD_OPTIONS,
  calculateCardCharges,
  calculateTotalWithCardCharges,
  formatAmount,
} from "@/common/components/shared/payment/utils/paymentUtils";
import { Separator } from "@/common/components/ui/separator";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";

const otherIncomeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(["CASH", "UPI", "CARD"], {
    required_error: "Payment method is required",
  }),
  income_date: z.string().min(1, "Income date is required"),
});

type OtherIncomeFormData = z.infer<typeof otherIncomeSchema>;

interface AddOtherIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OtherIncomeFormData) => Promise<void>;
  institutionType: "school" | "college";
}

export const AddOtherIncomeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  institutionType,
}: AddOtherIncomeDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OtherIncomeFormData>({
    resolver: zodResolver(otherIncomeSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0.01,
      payment_method: "CASH",
      income_date: new Date().toISOString().split("T")[0],
    },
  });

  const paymentMethod = form.watch("payment_method");
  const amount = form.watch("amount");

  const handleSubmit = async (data: OtherIncomeFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Other income record created successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to create other income:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create other income record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupeeIcon className="h-5 w-5" />
            Add Other Income
          </DialogTitle>
          <DialogDescription>
            Create a new other income record for{" "}
            {institutionType === "school" ? "school" : "college"}. Other income
            includes donations, grants, miscellaneous income, rental income,
            etc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Donation, Grant, Rental Income"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details..."
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      leftIcon={
                        <span className="text-gray-500 font-medium">
                          <IndianRupeeIcon className="h-4 w-4" />
                        </span>
                      }
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="income_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Income Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select income date"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payment Method <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                      className="grid grid-cols-3 gap-3"
                    >
                      {PAYMENT_METHOD_OPTIONS.map((option) => {
                        const isSelected = paymentMethod === option.value;
                        const colorClasses = {
                          green: isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/30",
                          blue: isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30",
                          purple: isSelected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30",
                        };
                        return (
                          <label
                            key={option.value}
                            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              colorClasses[
                                option.color as keyof typeof colorClasses
                              ]
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-2.5 w-full">
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                              <span className="text-2xl">{option.icon}</span>
                              <span
                                className={`font-semibold flex-1 ${
                                  isSelected
                                    ? option.color === "green"
                                      ? "text-green-700"
                                      : option.color === "blue"
                                        ? "text-blue-700"
                                        : "text-purple-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                isSelected
                                  ? option.color === "green"
                                    ? "text-green-600"
                                    : option.color === "blue"
                                      ? "text-blue-600"
                                      : "text-purple-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {option.description}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card Charges Display */}
            {paymentMethod === "CARD" && amount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-purple-200 bg-purple-50/50 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-purple-800">
                    Card Processing Charges
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatAmount(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Processing Charges (1.2%):
                    </span>
                    <span className="font-medium text-purple-700">
                      +{formatAmount(calculateCardCharges(amount))}
                    </span>
                  </div>
                  <Separator className="bg-purple-200" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold text-purple-900">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-purple-900">
                      {formatAmount(calculateTotalWithCardCharges(amount))}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-2 italic">
                    Note: Charges shown for display only. Payment amount:{" "}
                    {formatAmount(amount)}
                  </p>
                </div>
              </motion.div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">
                      <Loader.Button size="xs" />
                    </span>
                    Creating...
                  </>
                ) : (
                  "Create Other Income"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
