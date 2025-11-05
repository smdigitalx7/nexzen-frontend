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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCollegeExpenditure } from "@/lib/hooks/college";

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

  const onSubmit = async (data: ExpenditureFormData) => {
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
      await createExpenditureMutation.mutateAsync(payload);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create expenditure:", error);
    } finally {
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
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office Supplies, Maintenance" {...field} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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
                  <FormLabel>Bill Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Payment Method (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cash, Bank Transfer, Cheque" {...field} />
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
                  <FormLabel>Payment Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
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
