import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useToast } from "@/common/hooks/use-toast";
import { Wallet } from "lucide-react";

interface ConcessionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (amount: number) => Promise<void>;
  currentConcession: number;
  studentName?: string;
  title?: string;
}

export const ConcessionUpdateModal = ({
  isOpen,
  onClose,
  onUpdate,
  currentConcession,
  studentName,
  title = "Update Fee Concession",
}: ConcessionUpdateModalProps) => {
  const [amount, setAmount] = useState<number>(currentConcession);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setAmount(currentConcession);
    }
  }, [isOpen, currentConcession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Concession amount cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await onUpdate(amount);
      onClose();
    } catch (error: any) {
      console.error("Failed to update concession:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update concession amount.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {studentName && (
            <div className="bg-muted/50 p-3 rounded-md mb-4 border border-dashed">
              <p className="text-sm font-medium text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Student Name</p>
              <p className="font-semibold text-foreground">{studentName}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              label="Concession Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              required
              min={0}
              step="any"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Current Concession: ₹{currentConcession.toLocaleString()}
            </p>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-primary text-primary-foreground"
            >
              Update Concession
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
