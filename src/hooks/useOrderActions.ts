import { createOrder, updateOrder } from "@/actions/firestore";
import { useState } from "react";

export const useOrderActions = () => {
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);
  const [loadingUpdateOrder, setLoadingUpdateOrder] = useState(false);

  const createOrderAction = async (...rest: Parameters<typeof createOrder>) => {
    setLoadingCreateOrder(true);
    const result = await createOrder(...rest);
    setLoadingCreateOrder(false);
    return result;
  };

  const updateOrderAction = async (...rest: Parameters<typeof updateOrder>) => {
    setLoadingUpdateOrder(true);
    const result = await updateOrder(...rest);
    setLoadingUpdateOrder(false);
    return result;
  };

  return {
    orderLoading: { create: loadingCreateOrder, update: loadingUpdateOrder },
    createOrder: createOrderAction,
    updateOrder: updateOrderAction,
  };
};
