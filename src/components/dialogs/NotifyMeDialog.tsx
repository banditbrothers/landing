"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { LoadingIcon } from "@/components/misc/Loading";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStockNotification } from "@/actions/stockNotifications";
import { getSizeLabel } from "@/utils/product";
import { track } from "@/utils/analytics";
import { DEFAULT_SIZE } from "@/data/products";

// Remembered on this device so later "Notify me" requests are pre-filled
const CONTACT_STORAGE_KEY = "notify-me-contact";

const loadSavedContact = (): { email: string; phone: string } => {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY) ?? "{}");
    return {
      email: typeof saved.email === "string" ? saved.email : "",
      phone: typeof saved.phone === "string" ? saved.phone : "",
    };
  } catch {
    return { email: "", phone: "" };
  }
};

type NotifyMeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantName: string;
  size: string;
};

export const NotifyMeDialog = ({ open, onOpenChange, variantId, variantName, size }: NotifyMeDialogProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill from the last successful request whenever the dialog opens (without overwriting typed values)
  useEffect(() => {
    if (!open) return;
    const saved = loadSavedContact();
    setEmail(current => current || saved.email);
    setPhone(current => current || saved.phone);
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setIsSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      toast.error("Add an email or phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createStockNotification({ variantId, size, email: email.trim(), phone: phone.trim() });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setIsSubmitted(true);
        track("stock_notification_requested", { variant_id: variantId, size });
        try {
          localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify({ email: email.trim(), phone: phone.trim() }));
        } catch {
          // storage unavailable (private mode etc.): pre-fill just won't happen
        }
      }
    } catch {
      toast.error("Couldn't save that", { description: "Try again in a moment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeText = size !== DEFAULT_SIZE ? ` (${getSizeLabel(size)})` : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <DialogTitle className="text-xl font-bold">Request submitted</DialogTitle>
            <DialogDescription>
              We&apos;ll contact you as soon as {variantName}
              {sizeText} is back in stock.
            </DialogDescription>
            <Button className="w-full mt-2" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Request a restock</DialogTitle>
              <DialogDescription>
                Request a restock and we&apos;ll prioritise it for you. Leave your email or phone number and we&apos;ll
                let you know when it&apos;s back.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notify-email">Email</Label>
              <Input
                id="notify-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notify-phone">Phone number</Label>
              <Input
                id="notify-phone"
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingIcon className="w-4 h-4 mr-2" />}
              Request restock
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
