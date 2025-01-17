import { createOrder, removeOrder, updateOrder } from "@/actions/orders";
import { useState } from "react";

export const useOrderActions = () => {
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);
  const [loadingUpdateOrder, setLoadingUpdateOrder] = useState(false);
  const [loadingRemoveOrder, setLoadingRemoveOrder] = useState(false);

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

  const removeOrderAction = async (...rest: Parameters<typeof removeOrder>) => {
    setLoadingRemoveOrder(true);
    const result = await removeOrder(...rest);
    setLoadingRemoveOrder(false);
    return result;
  };

  return {
    orderLoading: { create: loadingCreateOrder, update: loadingUpdateOrder, remove: loadingRemoveOrder },
    createOrder: createOrderAction,
    updateOrder: updateOrderAction,
    removeOrder: removeOrderAction,
  };
};
