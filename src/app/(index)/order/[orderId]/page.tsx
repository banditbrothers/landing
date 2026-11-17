"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { getOrder } from "@/actions/orders";
import { getVariantsByIds } from "@/actions/products";
import { ProductVariant } from "@/types/product";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency } from "@/utils/price";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CopyIcon, MessageCircleIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formattedDateTimeLong } from "@/utils/timestamp";
import { getWhatsappNeedHelpWithOrderIdLink } from "@/utils/whatsappMessageLinks";
import { redactEmail, redactPhone, redactName } from "@/utils/redact";
import Link from "next/link";
import { getProductVariantUrl } from "@/utils/share";
import { getProductVariantName, getProductVariantPrice, getSizeLabel } from "@/utils/product";
import { Sticker } from "@/components/cards/ShopCard";

type OrderPageProps = { params: Promise<{ orderId: string }> };

const STATUS: Record<
  OrderStatus,
  { head: string; accent: string; sticker: string; tone: "orange" | "light" | "ghost"; copy: string }
> = {
  paid: {
    head: "Loot",
    accent: "secured",
    sticker: "Paid",
    tone: "orange",
    copy: "Payment's in. We'll pack it up and ship it your way.",
  },
  initiated: {
    head: "Almost",
    accent: "yours",
    sticker: "Awaiting payment",
    tone: "light",
    copy: "We haven't received the payment yet.",
  },
  "payment-failed": {
    head: "Payment",
    accent: "failed",
    sticker: "Payment failed",
    tone: "ghost",
    copy: "The payment didn't go through. If money left your account, message us.",
  },
  cancelled: {
    head: "Order",
    accent: "cancelled",
    sticker: "Cancelled",
    tone: "ghost",
    copy: "This order was cancelled before payment.",
  },
  "admin-cancelled": {
    head: "Order",
    accent: "cancelled",
    sticker: "Cancelled",
    tone: "ghost",
    copy: "We cancelled this order. Message us if you have questions.",
  },
};

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3">{children}</p>
);

const Panel = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-[22px] border border-border bg-card ${className}`}>{children}</div>
);

const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex justify-between items-center gap-4 py-1.5 text-sm">
    <span className="text-muted-foreground flex items-center gap-2">{label}</span>
    <span>{children}</span>
  </div>
);

export default function OrderPage({ params }: OrderPageProps) {
  // Looked up by id, not from the catalog, so items that are no longer sold still render
  const [variants, setVariants] = useState<ProductVariant[]>();

  // undefined = loading, null = no such order
  const [order, setOrder] = useState<Order | null>();
  const { copy, isCopied } = useCopyToClipboard();
  // Checkout lands here the moment Razorpay says "success", usually before the webhook marks the order paid
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      const orderId = (await params).orderId;
      let order = await getOrder(orderId);
      // A failed lookup only costs the item images/names; the order itself still renders
      if (order) setVariants(await getVariantsByIds(order.variants.map(v => v.variantId)).catch(() => []));
      if (cancelled) return;
      setOrder(order);

      // Re-check for ~30s while a fresh Razorpay order is still waiting on the webhook
      const isFresh = (o: Order | null) =>
        o?.status === "initiated" && o.paymentMode === "rzp" && Date.now() / 1000 - o.createdAt < 60 * 60;
      if (!isFresh(order)) return;
      setConfirming(true);
      for (let i = 0; i < 10 && isFresh(order); i++) {
        await new Promise(r => setTimeout(r, 3000));
        if (cancelled) return;
        order = await getOrder(orderId);
        setOrder(order);
      }
      setConfirming(false);
    };
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (order === null)
    return (
      <div className="container mx-auto py-8 px-4 mt-16 min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-calera uppercase text-6xl leading-[0.9]">
          Order <span className="text-bandit-orange">not found</span>
        </h1>
        <p className="text-muted-foreground">Check the link, or message us with your order details.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to the shop</Link>
        </Button>
      </div>
    );
  if (!order || !variants) return <LoadingScreen />;

  const status = STATUS[order.status] ?? STATUS.initiated;
  const isPaid = order.status === "paid";
  const itemCount = order.variants.reduce((n, v) => n + v.quantity, 0);
  const statusCopy =
    order.status === "initiated" && order.paymentMode === "manual"
      ? "We'll send you a payment link once we've worked out international shipping."
      : confirming && order.status === "initiated"
        ? "Confirming your payment with the bank. This usually takes a few seconds."
        : status.copy;
  const paymentMethod =
    order.paymentMode === "rzp"
      ? [order.rzp.paymentMethod?.toUpperCase(), "Razorpay"].filter(Boolean).join(" · ")
      : order.paymentMode === "manual"
        ? "Payment link"
        : "Cash";

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-20 min-h-screen">
      <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">Order {order.id}</span>
      </nav>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 md:pt-12 pb-10 md:pb-12">
        <div>
          <Kicker>
            <span className="inline-flex items-center gap-1">
              Order <span className="normal-case tracking-normal font-mono">{order.id}</span>
              <button
                type="button"
                aria-label="Copy order ID"
                className="p-1 rounded hover:text-foreground"
                onClick={() => copy(order.id)}>
                {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
              </button>
            </span>
          </Kicker>
          <h1 className="font-calera uppercase leading-[0.9] text-[17vw] md:text-[clamp(4.5rem,9vw,8rem)]">
            {status.head} <span className="text-bandit-orange">{status.accent}</span>.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mt-5">
            {statusCopy}
          </p>
          <p className="text-sm text-muted-foreground mt-2">Placed {formattedDateTimeLong(order.createdAt)}</p>
        </div>
        <div className="md:pb-3">
          <Sticker tone={status.tone}>
            {confirming && order.status === "initiated" ? "Confirming" : status.sticker}
          </Sticker>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-10 border-t border-border pt-10">
        <div className="space-y-8 min-w-0">
          <section>
            <Kicker>
              The haul · {itemCount} {itemCount === 1 ? "item" : "items"}
            </Kicker>
            <Panel className="px-4 md:px-5 divide-y divide-border">
              {order.variants.map(orderVariant => {
                const variant = variants.find(v => v.id === orderVariant.variantId);
                const { quantity, size } = orderVariant;
                const key = `${orderVariant.variantId}-${size}`;
                // Price paid; older orders didn't store it, so they fall back to today's price
                const price = orderVariant.price ?? (variant && getProductVariantPrice(variant));
                const meta = [
                  size && getSizeLabel(size),
                  price !== undefined ? `${quantity} × ${formatCurrency(price)}` : `Qty ${quantity}`,
                ]
                  .filter(Boolean)
                  .join(" · ");
                const name = variant
                  ? getProductVariantName(variant, { includeProductName: true })
                  : orderVariant.variantId;

                return (
                  <div key={key} className="flex items-center gap-4 py-4">
                    {/* No longer in the catalog: still listed so the items add up to the subtotal */}
                    {variant ? (
                      <Link href={getProductVariantUrl(variant)} target="_blank" className="shrink-0">
                        <Image
                          width={80}
                          height={80}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-[14px] object-cover bg-secondary"
                          alt={name}
                          src={variant.images.mockup[0]}
                        />
                      </Link>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-[14px] bg-secondary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{meta}</p>
                    </div>
                    {price !== undefined && <span className="font-medium">{formatCurrency(price * quantity)}</span>}
                  </div>
                );
              })}
            </Panel>
          </section>

          <section>
            <Kicker>The bandit</Kicker>
            <Panel className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Name", redactName(order.name)],
                ["Ships to", [order.address?.city, order.address?.state].filter(Boolean).join(", ")],
                ["Email", redactEmail(order.email)],
                ["Phone", redactPhone(order.phone)],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="truncate">{value || "—"}</p>
                </div>
              ))}
            </Panel>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 self-start">
          <Kicker>Receipt</Kicker>
          <Panel className="p-5 md:p-6">
            <Row label="Subtotal">{formatCurrency(order.subtotal, 2)}</Row>
            {order.discount > 0 && (
              <Row
                label={
                  <>
                    Discount
                    {order.couponCode && (
                      <span className="text-[11px] tracking-wide border border-dashed border-bandit-orange text-bandit-orange px-1.5 py-px rounded">
                        {order.couponCode}
                      </span>
                    )}
                  </>
                }>
                −{formatCurrency(order.discount, 2)}
              </Row>
            )}
            <Row label="Shipping">
              {order.shipping === 0 ? <span className="text-bandit-orange">Free</span> : formatCurrency(order.shipping)}
              {order.isInternational && !isPaid && <span className="text-xs text-muted-foreground ml-2">(TBD)</span>}
            </Row>
            <div className="border-t border-dashed border-border my-4" />
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
                {isPaid ? "Total paid" : "Total"}
              </span>
              <span className="font-calera text-5xl leading-none">
                {formatCurrency(order.total, Number.isInteger(order.total) ? 0 : 2)}
              </span>
            </div>
            <div className="mt-3">
              <Row label={isPaid ? "Paid via" : "Payment"}>{paymentMethod}</Row>
            </div>
          </Panel>

          {isPaid && !order.reviewId && (
            <div className="rounded-[22px] p-5 bg-bandit-orange text-black">
              <p className="font-calera uppercase text-3xl leading-[0.9]">Got it? Rate it.</p>
              <p className="text-sm mt-1.5 mb-4">Drop a photo and a few words. Takes a minute.</p>
              <Link
                href={`/order/${order.id}/review`}
                className="inline-flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-black/80">
                Write a review <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}

          <a
            href={getWhatsappNeedHelpWithOrderIdLink(order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-[22px] border border-border bg-card px-5 py-4 text-sm hover:border-muted-foreground transition-colors">
            <MessageCircleIcon className="w-5 h-5 text-bandit-orange" />
            <span className="flex-1">Something off? Message us on WhatsApp</span>
            <ArrowUpRightIcon className="w-4 h-4 text-muted-foreground" />
          </a>
        </aside>
      </div>
    </div>
  );
}
