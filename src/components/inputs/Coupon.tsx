import { useState } from "react";
import { LoadingIcon } from "../misc/Loading";
import { Button } from "../ui/button";

import { Input } from "../ui/input";
import { useCouponActions } from "@/hooks/useCouponActions";
import { Coupon } from "@/types/coupon";
import { CheckIcon } from "../../Icons/icons";
import { validateCouponInCart } from "@/utils/coupon";
import { CartItem } from "@/types/order";
import { ProductVariant } from "@/types/product";
import { track } from "@/utils/analytics";

type CouponInputProps = {
  coupon: Coupon | null;
  cart: CartItem[];
  variants: ProductVariant[];
  onCouponApplied: (coupon: Coupon) => void;
  onCouponRemoved: () => void;
  onCouponError: (error: string) => void;
};

export const CouponInput = ({
  coupon,
  cart,
  variants,
  onCouponApplied,
  onCouponRemoved,
  onCouponError,
}: CouponInputProps) => {
  const { couponLoading, validateCoupon } = useCouponActions();

  const [couponCodeInput, setCouponCodeInput] = useState("");

  const handleValidateCoupon = async () => {
    if (couponCodeInput.length === 0) return;

    const code = couponCodeInput.trim().toUpperCase();
    const rejected = (reason: string) => {
      track("coupon_rejected", { coupon_code: code, reason });
      onCouponError(reason);
    };
    const { error, isValid, coupon } = await validateCoupon(code);
    if (error) return rejected(error);
    if (!isValid) rejected("Invalid coupon code");
    if (coupon && isValid) {
      const { error, message } = validateCouponInCart(coupon, cart, variants);
      if (error) return rejected(message);

      track("coupon_applied", { coupon_code: coupon.code, discount_type: coupon.discountType });
      onCouponApplied(coupon);
    }

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
            placeholder="CODE"
            className="h-11 rounded-xl bg-background uppercase md:text-base"
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
            className="min-w-20 h-11 rounded-xl"
            variant="secondary">
            {!!coupon ? "Remove" : couponLoading.validating ? <LoadingIcon /> : "Apply"}
          </Button>
        </>
      ) : (
        <div className="flex-1 px-3 py-2.5 rounded-xl border border-dashed border-bandit-orange/60 bg-bandit-orange/10 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-bandit-orange" />
            <span className="font-mono font-bold text-bandit-orange">{coupon.code}</span>
            <span className="text-muted-foreground">applied</span>
          </span>
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={onCouponRemoved}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
};
