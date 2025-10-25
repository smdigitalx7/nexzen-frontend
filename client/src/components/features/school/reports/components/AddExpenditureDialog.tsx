import { useState, memo, useCallback, useMemo } from "react";
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
import { useCreateSchoolExpenditure } from "@/lib/hooks/school/use-school-income-expenditure";

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

// Initial form values - moved outside component for better performance
const initialFormValues: ExpenditureFormData = {
  expenditure_purpose: "",
  amount: 0.01,
  bill_date: new Date().toISOString().split('T')[0],
  payment_method: "",
  payment_date: "",
  remarks: "",
};

// Memoized form field component
const FormFieldWrapper = memo(({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = "text", 
  step, 
  rows,
  onChange 
}: { 
  control: any;
  name: keyof ExpenditureFormData;
  label: string;
  placeholder: string;
  type?: string;
  step?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {type === "textarea" ? (
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
            />
          ) : (
            <Input
              type={type}
              step={step}
              placeholder={placeholder}
              {...field}
              onChange={onChange ? onChange : field.onChange}
            />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

FormFieldWrapper.displayName = "FormFieldWrapper";

// Memoized dialog header component
const DialogHeaderContent = memo(() => (
  <DialogHeader>
    <DialogTitle>Add New Expenditure Record</DialogTitle>
    <DialogDescription>
      Create a new expenditure record for the school.
    </DialogDescription>
  </DialogHeader>
));

DialogHeaderContent.displayName = "DialogHeaderContent";

// Memoized dialog footer component
const DialogFooterContent = memo(({ 
  isSubmitting, 
  onCancel 
}: { 
  isSubmitting: boolean;
  onCancel: () => void;
}) => (
  <DialogFooter>
    <Button
      type="button"
      variant="outline"
      onClick={onCancel}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Creating..." : "Create Expenditure"}
    </Button>
  </DialogFooter>
));

DialogFooterContent.displayName = "DialogFooterContent";

// Memoized amount field component
const AmountField = memo(({ control }: { control: any }) => (
  <FormField
    control={control}
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
));

AmountField.displayName = "AmountField";

const AddExpenditureDialogComponent = ({ open, onOpenChange }: AddExpenditureDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createExpenditureMutation = useCreateSchoolExpenditure();

  const form = useForm<ExpenditureFormData>({
    resolver: zodResolver(expenditureSchema),
    defaultValues: initialFormValues,
  });

  // Memoized handlers
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onSubmit = useCallback(async (data: ExpenditureFormData) => {
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
  }, [createExpenditureMutation, form, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeaderContent />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldWrapper
              control={form.control}
              name="expenditure_purpose"
              label="Purpose"
              placeholder="e.g., Office Supplies, Maintenance"
            />
            <AmountField control={form.control} />
            <FormFieldWrapper
              control={form.control}
              name="bill_date"
              label="Bill Date"
              type="date"
              placeholder=""
            />
            <FormFieldWrapper
              control={form.control}
              name="payment_method"
              label="Payment Method (Optional)"
              placeholder="e.g., Cash, Bank Transfer, Cheque"
            />
            <FormFieldWrapper
              control={form.control}
              name="payment_date"
              label="Payment Date (Optional)"
              type="date"
              placeholder=""
            />
            <FormFieldWrapper
              control={form.control}
              name="remarks"
              label="Remarks (Optional)"
              type="textarea"
              placeholder="Additional details about this expenditure"
              rows={3}
            />
            <DialogFooterContent
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddExpenditureDialog = AddExpenditureDialogComponent;
export default AddExpenditureDialogComponent;
