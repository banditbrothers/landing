"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Order } from "@/types/order";
import { updateOrder } from "@/actions/orders";
import { createPaymentLinkForInternationalOrder } from "@/actions/payments/rzp";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InternationalOrderPaymentDialogProps {
  onClose: () => void;
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
}

interface FormData {
  subtotal: number;
  shipping: number;
  discount: number;
}

export const InternationalOrderPaymentDialog = ({ onClose, order, onUpdate }: InternationalOrderPaymentDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isCopied, copy } = useCopyToClipboard(3000);

  const calculateTotal = () => {
    return formData.subtotal + formData.shipping - formData.discount;
  };

  const handleSave = async () => {
    if (formData.subtotal <= 0 || formData.shipping < 0 || formData.discount < 0) {
      toast.error("Please enter valid amounts");
      return;
    }

    const newTotal = calculateTotal();
    if (newTotal <= 0) {
      toast.error("Total amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      // Update the order in Firebase
      const updateData = {
        subtotal: formData.subtotal,
        shipping: formData.shipping,
        discount: formData.discount,
        total: newTotal,
      };

      await updateOrder(order.id, updateData);

      // Create payment link using the new total
      const paymentLink = await createPaymentLinkForInternationalOrder(order, newTotal);

      // Copy payment link to clipboard
      copy(paymentLink);

      // Update the local order object
      const updatedOrder = { ...order, ...updateData };
      onUpdate(updatedOrder);

      // Show persistent toast with payment link
      toast.success("Payment link copied!");

      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order and generate payment link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-foreground">Update Order Amounts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                min="0"
                value={formData.subtotal}
                onChange={e => handleInputChange("subtotal", e.target.value)}
                placeholder="Enter subtotal amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Cost</Label>
              <Input
                id="shipping"
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping}
                onChange={e => handleInputChange("shipping", e.target.value)}
                placeholder="Enter shipping cost"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={e => handleInputChange("discount", e.target.value)}
                placeholder="Enter discount amount"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total:</span>
              <span className="text-lg font-bold text-foreground">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Subtotal + Shipping - Discount</div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="min-w-[80px]">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || formData.subtotal <= 0}
              className="min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Generate Link"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
