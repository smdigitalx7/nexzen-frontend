import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { DatePicker } from "@/common/components/ui/date-picker";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { Label } from "@/common/components/ui/label";
import { useCreateCollegeExpenditure } from "@/features/college/hooks";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

const expenditureSchema = z.object({
  expenditure_purpose: z.string().min(1, "Purpose is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  bill_date: z.string().min(1, "Bill date is required"),
  payment_method: z.string().optional(),
  payment_date: z.string().optional(),
  remarks: z.string().optional(),
});

type ExpenditureFormData = z.infer<typeof expenditureSchema>;

interface AddExpenditureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenditureDialog = ({ open, onOpenChange }: AddExpenditureDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createExpenditureMutation = useCreateCollegeExpenditure();

  const form = useForm<ExpenditureFormData>({
    resolver: zodResolver(expenditureSchema),
    defaultValues: {
      expenditure_purpose: "",
      amount: 0.01,
      bill_date: new Date().toISOString().split('T')[0],
      payment_method: "",
      payment_date: "",
      remarks: "",
    },
  });

  const onSubmit = (data: ExpenditureFormData) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    onOpenChange(false);
    cleanupDialogState();
    
    setIsSubmitting(true);
    try {
      const payload = {
        expenditure_purpose: data.expenditure_purpose,
        amount: data.amount,
        bill_date: data.bill_date,
        payment_method: data.payment_method && data.payment_method.trim() !== "" ? data.payment_method : null,
        payment_date: data.payment_date && data.payment_date.trim() !== "" ? data.payment_date : null,
        remarks: data.remarks && data.remarks.trim() !== "" ? data.remarks : null,
      };
      
      // RUN MUTATION IN BACKGROUND - DON'T AWAIT
      createExpenditureMutation.mutate(payload, {
        onSuccess: () => {
          form.reset();
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Failed to create expenditure:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expenditure Record</DialogTitle>
          <DialogDescription>
            Create a new expenditure record for the college.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expenditure_purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="expenditure_purpose">Purpose</FormLabel>
                  <FormControl>
                    <Input id="expenditure_purpose" placeholder="e.g., Office Supplies, Maintenance" {...field} />
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
                  <FormLabel htmlFor="amount">Amount</FormLabel>
                  <FormControl>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bill_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="bill_date">Bill Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      id="bill_date"
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select bill date"
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
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label
                        htmlFor="payment_method_cash"
                        className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                          field.value === "CASH"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="CASH" id="payment_method_cash" className="sr-only" />
                        Cash
                      </Label>
                      <Label
                        htmlFor="payment_method_online"
                        className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                          field.value === "ONLINE"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="ONLINE" id="payment_method_online" className="sr-only" />
                        Online
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="payment_date">Payment Date (Optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      id="payment_date"
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select payment date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="remarks">Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="remarks"
                      placeholder="Additional details about this expenditure"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isSubmitting ? "Creating..." : "Create Expenditure"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
