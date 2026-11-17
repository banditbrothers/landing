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

// Every pending request (however old), plus the latest `limit` of any status for the "Show all" history
export const getStockNotifications = async (limit: number = 200): Promise<StockNotification[]> => {
  await requireAdmin();
  const col = firestore().collection(Collections.stockNotifications);
  // Pending is sorted here, not in the query, so it needs no composite index
  const [pending, recent] = await Promise.all([
    col.where("status", "==", "pending").get(),
    col.orderBy("createdAt", "desc").limit(limit).get(),
  ]);
  const byId = new Map([...pending.docs, ...recent.docs].map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  return ([...byId.values()] as StockNotification[]).sort((a, b) => b.createdAt - a.createdAt);
};

// One batched write, so a "Mark all notified" either marks every request or none
export const updateStockNotificationStatus = async (ids: string[], status: StockNotificationStatus) => {
  await requireAdmin();
  if (ids.length > 500) throw new Error("Too many requests at once");
  const batch = firestore().batch();
  for (const id of ids) batch.update(firestore().collection(Collections.stockNotifications).doc(id), { status });
  await batch.commit();
  return true;
};
