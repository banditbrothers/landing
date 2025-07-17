import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InternationalOrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueShopping: () => void;
  email: string;
}

export function InternationalOrderSuccessDialog({
  open,
  onOpenChange,
  onContinueShopping,
  email: email,
}: InternationalOrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Order Placed! 🎉</DialogTitle>
          <DialogDescription asChild className="text-center ">
            <div className="space-y-2">
              <p className="text-base">Your international order has been submitted!</p>

              <p className="text-sm text-muted-foreground">
                You'll receive an email from <strong>{email}</strong> within 24 hours with payment details and exact
                shipping costs.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onContinueShopping} className="w-full">
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
