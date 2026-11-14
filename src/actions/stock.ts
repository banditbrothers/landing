import "server-only";
// Deliberately NOT "use server": these must not be callable as public POST endpoints.
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { revalidateCatalog } from "@/lib/catalog";
import { Order } from "@/types/order";
import { OrderedVariant, ProductVariant } from "@/types/product";
import { isProduction } from "@/utils/misc";
import { getProductVariantName, getSizeLabel } from "@/utils/product";

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
    const stock = variant?.stock?.[item.size];
    if (!variant || stock === undefined || stock >= item.quantity) continue;
    const name = `${getProductVariantName(variant)} (${getSizeLabel(item.size)})`;
    issues.push(stock <= 0 ? `${name} is out of stock` : `Only ${stock} left of ${name}`);
  }
  return issues;
};

/** Deducts ordered quantities from tracked stock exactly once per order. */
export const deductStockForOrder = async (orderId: string) => {
  // variants is shared between dev and prod: dev orders must never touch real stock
  if (!isProduction) return;

  const db = firestore();
  const orderRef = db.collection(Collections.orders).doc(orderId);

  await db.runTransaction(async tx => {
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
        updates[`stock.${item.size}`] = Math.max(0, current - item.quantity);
      }
      if (Object.keys(updates).length) tx.update(snap.ref, updates);
    }

    tx.update(orderRef, { stockDeducted: true });
  });
  revalidateCatalog();
};
