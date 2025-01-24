import { validateCoupon } from "@/actions/coupons";
import { addCoupon } from "@/actions/coupons";
import { updateCoupon } from "@/actions/coupons";
import { useState } from "react";

export const useCouponActions = () => {
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [addingCoupon, setAddingCoupon] = useState(false);
  const [updatingCoupon, setUpdatingCoupon] = useState(false);

  const validateCouponAction = async (...rest: Parameters<typeof validateCoupon>) => {
    setValidatingCoupon(true);
    try {
      return await validateCoupon(...rest);
    } catch (error) {
      throw error;
    } finally {
      setValidatingCoupon(false);
    }
  };

  const addCouponAction = async (...rest: Parameters<typeof addCoupon>) => {
    setAddingCoupon(true);
    try {
      return await addCoupon(...rest);
    } catch (error) {
      throw error;
    } finally {
      setAddingCoupon(false);
    }
  };

  const updateCouponAction = async (...rest: Parameters<typeof updateCoupon>) => {
    setUpdatingCoupon(true);
    try {
      return await updateCoupon(...rest);
    } catch (error) {
      throw error;
    } finally {
      setUpdatingCoupon(false);
    }
  };

  return {
    couponLoading: {
      validating: validatingCoupon,
      adding: addingCoupon,
      updating: updatingCoupon,
    },
    validateCoupon: validateCouponAction,
    addCoupon: addCouponAction,
    updateCoupon: updateCouponAction,
  };
};
