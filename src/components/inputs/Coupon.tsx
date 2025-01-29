import { useState } from "react";
import { LoadingIcon } from "../misc/Loading";
import { Button } from "../ui/button";

import { Input } from "../ui/input";
import { useCouponActions } from "@/hooks/useCouponActions";
import { Coupon } from "@/types/coupon";
import { CheckIcon, XMarkIcon } from "../misc/icons";

type CouponInputProps = {
  coupon: Coupon | null;
  onCouponApplied: (coupon: Coupon) => void;
  onCouponRemoved: () => void;
  onCouponError: (error: string) => void;
};

export const CouponInput = ({ coupon, onCouponApplied, onCouponRemoved, onCouponError }: CouponInputProps) => {
  const { couponLoading, validateCoupon } = useCouponActions();

  const [couponCodeInput, setCouponCodeInput] = useState("");

  const handleValidateCoupon = async () => {
    if (couponCodeInput.length === 0) return;

    const { error, isValid, coupon } = await validateCoupon(couponCodeInput.trim());
    if (error) return onCouponError(error);
    if (!isValid) onCouponError("Invalid coupon code");
    if (coupon && isValid) onCouponApplied(coupon);

    setCouponCodeInput("");
  };

  let isButtonDisabled = false;
  if (couponLoading.validating) isButtonDisabled = true;
  if (!coupon && couponCodeInput.length === 0) isButtonDisabled = true;

  return (
    <div className="flex gap-2 items-center w-full">
      {!coupon ? (
        <>
          <Input
            placeholder="Enter coupon code"
            disabled={!!coupon}
            value={couponCodeInput}
            onChange={e => setCouponCodeInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleValidateCoupon();
              }
            }}
          />
          <Button
            disabled={isButtonDisabled}
            onClick={handleValidateCoupon}
            type="button"
            className="min-w-20"
            variant="secondary">
            {!!coupon ? "Remove" : couponLoading.validating ? <LoadingIcon /> : "Apply"}
          </Button>
        </>
      ) : (
        <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 dark:bg-green-500/20 p-1.5 rounded-md">
              <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Coupon Applied 🎉</p>
              <p className="text-xs text-green-600 dark:text-green-400">{coupon.code}</p>
            </div>
          </div>
          <Button variant="ghost" className="p-1 hover:bg-transparent" onClick={onCouponRemoved}>
            <XMarkIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
};
