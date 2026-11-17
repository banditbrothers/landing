"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { ProductVariant } from "@/types/product";
import { StockNotification, StockNotificationStatus } from "@/types/stockNotification";
import { getTimestamp } from "@/utils/timestamp";
import { getProductVariantName } from "@/utils/product";
import { getDiscordStockNotificationMessage } from "@/utils/discordMessages";
import { sendDiscordStockNotificationMessage } from "./discord";

const stockNotificationSchema = z
  .object({
    variantId: z.string().min(1).max(200),
    size: z.string().min(1).max(50),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{10,16}$/)
      .optional()
      .or(z.literal("")),
  })
  .refine(data => !!data.email || !!data.phone, { message: "Email or phone is required" });

export const createStockNotification = async (
  input: z.input<typeof stockNotificationSchema>
): Promise<{ success: true } | { error: string }> => {
  const parsed = stockNotificationSchema.safeParse(input);
  if (!parsed.success) return { error: "Please enter a valid email or phone number" };
  const { variantId, size, email, phone } = parsed.data;

  const variantSnap = await firestore().collection(Collections.variants).doc(variantId).get();
  if (!variantSnap.exists) return { error: "Product not found" };
  const variant = { id: variantSnap.id, ...variantSnap.data() } as ProductVariant;

  const ref = firestore().collection(Collections.stockNotifications).doc();
  const request: StockNotification = {
    id: ref.id,
    variantId,
    size,
    email: email || null,
    phone: phone ? phone.replace(/[\s-]/g, "") : null,
    createdAt: getTimestamp(),
    status: "pending",
  };
  const { id: _id, ...data } = request; // eslint-disable-line @typescript-eslint/no-unused-vars
  await ref.set(data);

  try {
    await sendDiscordStockNotificationMessage(
      getDiscordStockNotificationMessage(request, getProductVariantName(variant, { includeProductName: true }))
    );
  } catch (error) {
    console.error("Error sending stock notification Discord message:", error);
  }

  return { success: true };
};

export const getStockNotifications = async (limit: number = 200): Promise<StockNotification[]> => {
  await requireAdmin();
  const snap = await firestore()
    .collection(Collections.stockNotifications)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StockNotification[];
};

export const updateStockNotificationStatus = async (id: string, status: StockNotificationStatus) => {
  await requireAdmin();
  await firestore().collection(Collections.stockNotifications).doc(id).update({ status });
  return true;
};
