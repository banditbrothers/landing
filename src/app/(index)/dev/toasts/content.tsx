"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useVariants } from "@/hooks/useVariants";
import { PRODUCTS_OBJ } from "@/data/products";

type Demo = [label: string, fire: () => void];

const wait = (ms: number, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(new Error("nope")) : resolve(null)), ms));

const BASICS: Demo[] = [
  ["Success", () => toast.success("Saved")],
  ["Error", () => toast.error("That's all we have in stock")],
  ["Warning", () => toast.warning("Payment window didn't load")],
  ["Info", () => toast.info("Heads up")],
  ["Plain (no type)", () => toast("Just a message")],
  ["Loading", () => toast.loading("Working on it…", { duration: 3000 })],
];

const SHAPES: Demo[] = [
  [
    "Title + description",
    () => toast.success("Review sent", { description: "Thanks for taking the time to tell us." }),
  ],
  [
    "With action",
    () => toast.error("Couldn't save that", { action: { label: "Retry", onClick: () => toast.success("Retried") } }),
  ],
  ["With cancel", () => toast("Remove from bag?", { cancel: { label: "Undo", onClick: () => {} } })],
  [
    "Long text",
    () =>
      toast.info(
        "Payment link: https://rzp.io/i/an-extremely-long-payment-link-that-has-no-spaces-and-must-wrap-somewhere-sensible",
        { description: "Copy it and send it on WhatsApp. This line is long on purpose to check wrapping on phones." }
      ),
  ],
  [
    "Stays until dismissed",
    () => toast.info("Sticky toast", { duration: Infinity, action: { label: "Close", onClick: () => {} } }),
  ],
  [
    "Promise → success",
    () => toast.promise(wait(1500), { loading: "Placing order…", success: "Order's in", error: "Failed" }),
  ],
  [
    "Promise → error",
    () =>
      toast.promise(wait(1500, true), {
        loading: "Placing order…",
        success: "Order's in",
        error: "Payment didn't go through",
      }),
  ],
  [
    "Burst of 4 (stacking)",
    () => {
      toast.success("One");
      setTimeout(() => toast.error("Two"), 150);
      setTimeout(() => toast.warning("Three"), 300);
      setTimeout(() => toast.info("Four"), 450);
    },
  ],
];

// The exact customer-facing messages the storefront sends
const STOREFRONT: Demo[] = [
  ["Order placed", () => toast.success("Order's in", { description: "We'll get it packed and on its way." })],
  [
    "Payment failed",
    () => toast.error("Payment didn't go through", { description: "Try again, or pick another payment method." }),
  ],
  [
    "Razorpay didn't load",
    () =>
      toast.warning("Payment window didn't load", {
        description: "Refresh the page and try again. Your bag is saved.",
      }),
  ],
  ["Coupon copied", () => toast.success("BANDIT15 copied", { description: "Paste it at checkout." })],
  ["Coupon error", () => toast.error("SUMMER10: Coupon has expired")],
  ["Out of stock", () => toast.error("That's all we have in stock")],
  ["Review sent", () => toast.success("Review sent", { description: "Thanks for taking the time to tell us." })],
  ["Bad upload", () => toast.error("That file won't upload", { description: "Use a JPG, PNG or WebP photo." })],
  [
    "Order not found",
    () => toast.error("We couldn't find that order", { description: "Message us and we'll sort it out." }),
  ],
  [
    "Missing product",
    () => toast.error("That product isn't around anymore", { description: "Here's everything that is." }),
  ],
  ["Restock: no contact", () => toast.error("Add an email or phone number")],
  ["Restock: save failed", () => toast.error("Couldn't save that", { description: "Try again in a moment." })],
];

const Group = ({ title, demos }: { title: string; demos: Demo[] }) => (
  <section className="grid gap-3">
    <h2 className="text-xs tracking-[0.18em] uppercase text-muted-foreground">{title}</h2>
    <div className="flex flex-wrap gap-2">
      {demos.map(([label, fire]) => (
        <Button key={label} variant="outline" className="rounded-full" onClick={fire}>
          {label}
        </Button>
      ))}
    </div>
  </section>
);

export const ToastLab = () => {
  const { data: variants = [] } = useVariants();
  const addToCart = useAddToCart();
  const variant = variants.find(v => v.images.mockup[0]);
  const size = variant && PRODUCTS_OBJ[variant.productId].sizes[0];

  // Real add-to-bag path (thumbnail, free-shipping line, View bag); this does add the item to your dev cart
  const CART: Demo[] =
    variant && size
      ? [
          ["Add to bag (real)", () => addToCart(variant, size)],
          ["Add + open bag (product page)", () => addToCart(variant, size, 1, { openCart: true })],
        ]
      : [];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-40 grid gap-10">
      <header className="grid gap-2">
        <h1 className="font-calera uppercase text-5xl leading-[0.9]">Toast lab</h1>
        <p className="text-muted-foreground">Every toast style one tap away. Dev only; this page 404s in production.</p>
        <div>
          <Button variant="ghost" className="rounded-full px-0 text-muted-foreground" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </div>
      </header>
      <Group title="Types" demos={BASICS} />
      <Group title="Shapes" demos={SHAPES} />
      {CART.length > 0 && <Group title="Add to bag (touches your dev cart)" demos={CART} />}
      <Group title="Storefront messages" demos={STOREFRONT} />
    </div>
  );
};
