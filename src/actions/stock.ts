import "server-only";
// Deliberately NOT "use server": these must not be callable as public POST endpoints.
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { revalidateCatalog } from "@/lib/catalog";
import { Order, OversoldLine } from "@/types/order";
import { sendDiscordOrderMessage } from "./discord";
import { OrderedVariant, ProductVariant } from "@/types/product";
import { isProduction } from "@/utils/misc";
import { getProductVariantName, getSizeLabel } from "@/utils/product";
import { isProductActive } from "@/data/products";

/** Returns a customer-facing message for every ordered item that exceeds tracked stock (empty = all good). */
export const getStockIssues = async (items: OrderedVariant[]): Promise<string[]> => {
  if (!items?.length) return [];
  const ids = [...new Set(items.map(i => i.variantId))];
  const refs = ids.map(id => firestore().collection(Collections.variants).doc(id));
  const docs = await firestore().getAll(...refs);
  const variants = new Map(docs.map(d => [d.id, { id: d.id, ...d.data() } as ProductVariant]));

  // Same variant+size may appear more than once; check the combined quantity
  const totals = new Map<string, OrderedVariant>();
  for (const item of items) {
    const key = `${item.variantId}|${item.size}`;
    const prev = totals.get(key);
    totals.set(key, { ...item, quantity: (prev?.quantity ?? 0) + item.quantity });
  }

  const issues: string[] = [];
  for (const item of totals.values()) {
    const variant = variants.get(item.variantId);
    // Missing/unavailable variants are hidden from the cart UI and priced at 0, so they must never be ordered
    if (!variant?.productId || variant.isAvailable === false || !isProductActive(variant.productId)) {
      issues.push("An item in your cart is no longer available");
      continue;
    }
    const stock = variant.stock?.[item.size];
    if (stock === undefined || stock >= item.quantity) continue;
    const name = `${getProductVariantName(variant)} (${getSizeLabel(item.size)})`;
    issues.push(stock <= 0 ? `${name} is out of stock` : `Only ${stock} left of ${name}`);
  }
  return [...new Set(issues)];
};

/** Deducts ordered quantities from tracked stock exactly once per order. */
export const deductStockForOrder = async (orderId: string) => {
  // variants is shared between dev and prod: dev orders must never touch real stock
  if (!isProduction) return;

  const db = firestore();
  const orderRef = db.collection(Collections.orders).doc(orderId);
  // Stock is only checked (not held) at checkout, so two buyers can both pay for the last unit. Record and alert.
  // ponytail: detect-and-alert only; reserve stock at order creation if limited drops make this common.
  let oversold: OversoldLine[] = [];

  await db.runTransaction(async tx => {
    oversold = []; // transactions can retry
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) return;
    const order = orderSnap.data() as Order;
    if (order.stockDeducted) return;

    const ids = [...new Set((order.variants ?? []).map(v => v.variantId))];
    const variantRefs = ids.map(id => db.collection(Collections.variants).doc(id));
    const variantSnaps = variantRefs.length ? await tx.getAll(...variantRefs) : [];

    for (const snap of variantSnaps) {
      if (!snap.exists) continue;
      const stock = (snap.data() as ProductVariant).stock;
      if (!stock) continue;

      const updates: Record<string, number> = {};
      for (const item of order.variants.filter(v => v.variantId === snap.id)) {
        const current = updates[`stock.${item.size}`] ?? stock[item.size];
        if (current === undefined) continue; // size not tracked
        if (current < item.quantity) {
          const last = oversold.find(o => o.variantId === snap.id && o.size === item.size);
          if (last) last.short += item.quantity - Math.max(0, current);
          else oversold.push({ variantId: snap.id, size: item.size, short: item.quantity - Math.max(0, current) });
        }
        updates[`stock.${item.size}`] = Math.max(0, current - item.quantity);
      }
      if (Object.keys(updates).length) tx.update(snap.ref, updates);
    }

    tx.update(orderRef, { stockDeducted: true, ...(oversold.length && { oversold }) });
  });
  revalidateCatalog();

  if (oversold.length) {
    const lines = oversold.map(o => `• ${o.variantId} (${getSizeLabel(o.size)}): short by ${o.short}`).join("\n");
    await sendDiscordOrderMessage({
      content: `⚠️ **Oversold** order \`${orderId}\` was paid but stock ran out:\n${lines}\nRefund or offer a swap.`,
    });
  }
};
