import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { Button } from "../ui/button";
import { QRCodeSVG } from "qrcode.react";
import { getWhatsappSharePaymentScreenshotLink } from "@/utils/whatsappMessageLinks";
import Link from "next/link";
import { Order } from "@/types/order";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { TextTooltip } from "../tooltip";

const upiId = "abbas.i.merchant@okaxis";
const storeName = "Bandit Brothers";

type PaymentDrawerProps = {
  open: boolean;
  onComplete: () => void;
  onCancel: () => void;
  amount: number;
  orderDetails: Order;
};

export default function PaymentDrawer({ open, onComplete, onCancel, amount, orderDetails }: PaymentDrawerProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isPaymentShared, setIsPaymentShared] = useState(false);

  const handleUpiAppClick = (_upiUrl: string) => {
    window.location.href = _upiUrl;
  };

  const handleSharePaymentScreenshot = () => {
    setTimeout(() => setIsPaymentShared(true), 2000);
  };

  const upiUrl = `upi://pay?pa=${upiId}&pn=${storeName}&am=${amount}&cu=INR&tn=${orderDetails.id}`;
  return (
    <>
      <Drawer open={open} dismissible={false} handleOnly>
        <DrawerContent
          hideBar
          aria-describedby="upi-qr-code"
          className="p-6 flex flex-col self-center justify-self-center items-center gap-6 max-w-lg">
          <DrawerTitle className="text-xl font-semibold">Scan QR Code to Pay</DrawerTitle>

          <div className="flex flex-col gap-6">
            <Step title="Payment Instructions" step={1}>
              <div className="max-w-md">
                <ul className="list-disc list-inside text-sm ml-8">
                  <li>Make the payment using the button or QR code</li>
                  <li className="font-semibold">Make sure you take a screenshot of the payment</li>
                </ul>
              </div>
            </Step>

            <Step title="Make Payment" step={2}>
              <div className="flex flex-col gap-3 items-center justify-self-center max-w-md">
                <QRCodeSVG value={upiUrl} className="bg-primary rounded-lg" size={256} marginSize={2} />
                <span className="flex flex-row gap-2 items-center justify-center w-full">
                  <Button className="max-w-xs" onClick={() => handleUpiAppClick(upiUrl)}>
                    Pay with UPI App
                  </Button>
                </span>
              </div>
            </Step>

            <Step title="Share Payment Proof" step={3}>
              <Link
                href={getWhatsappSharePaymentScreenshotLink(orderDetails)}
                onClick={handleSharePaymentScreenshot}
                rel="noopener noreferrer"
                className="ml-8"
                target="_blank">
                <Button variant="default" className="max-w-xs">
                  Share Payment Screenshot on WhatsApp
                </Button>
              </Link>
            </Step>

            <Step
              step={4}
              title="Order Confirmation"
              description="if you did you job honestly, we will confirm your order"
            />

            <div className="flex flex-row justify-between w-full gap-2">
              <Button variant="destructive" className="max-w-xs" onClick={() => setShowCancelDialog(true)}>
                Cancel
              </Button>
              <TextTooltip disabled={isPaymentShared} content="Share the payment proof before closing">
                <Button disabled={!isPaymentShared} variant="outline" onClick={onComplete} className="max-w-xs">
                  Close
                </Button>
              </TextTooltip>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? <br /> This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              No, Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelDialog(false);
                onCancel();
              }}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type StepProps = {
  title: string;
  description?: string;
  step: number;
  children?: React.ReactNode;
};

const Step = ({ title, description, step, children }: StepProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full text-sm self-start">{step}</span>
        <span className="font-semibold flex flex-col self-start">
          {title}
          <span className="text-sm text-muted-foreground">{description}</span>
        </span>
      </div>
      {children}
    </div>
  );
};
