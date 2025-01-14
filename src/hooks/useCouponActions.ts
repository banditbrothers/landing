import { validateCoupon } from "@/actions/coupons";
import { useState } from "react";

export const useCouponActions = () => {
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const validateCouponAction = async (...rest: Parameters<typeof validateCoupon>) => {
    setValidatingCoupon(true);
    const result = await validateCoupon(...rest);
    setValidatingCoupon(false);
    return result;
  };

  return { couponLoading: { validating: validatingCoupon }, validateCoupon: validateCouponAction };
};
