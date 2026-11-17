import { addCoupon, updateCoupon, validateCoupon } from "@/actions/coupons";
import { useState } from "react";

export const useCouponActions = () => {
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [addingCoupon, setAddingCoupon] = useState(false);
  const [updatingCoupon, setUpdatingCoupon] = useState(false);

  const validateCouponAction = async (...rest: Parameters<typeof validateCoupon>) => {
    setValidatingCoupon(true);
    try {
      return await validateCoupon(...rest);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const addCouponAction = async (...rest: Parameters<typeof addCoupon>) => {
    setAddingCoupon(true);
    try {
      return await addCoupon(...rest);
    } finally {
      setAddingCoupon(false);
    }
  };

  const updateCouponAction = async (...rest: Parameters<typeof updateCoupon>) => {
    setUpdatingCoupon(true);
    try {
      return await updateCoupon(...rest);
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
