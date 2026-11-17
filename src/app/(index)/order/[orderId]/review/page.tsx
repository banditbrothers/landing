"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { getOrder } from "@/actions/orders";
import { getVariantsByIds } from "@/actions/products";
import { ProductVariant } from "@/types/product";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { StarRatingInput } from "@/components/misc/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getWhatsappHelpWithCreateReviewLink, getWhatsappUpdateReviewLink } from "@/utils/whatsappMessageLinks";
import { ArrowRightIcon, ArrowUpRightIcon, Loader2, MessageCircleIcon } from "lucide-react";
import { FileDropzone } from "@/components/misc/FileUploader";
import { processImage } from "@/utils/image";
import Link from "next/link";
import { getCollectionDocumentId, signInAnonymously, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Collections } from "@/constants/collections";
import { createReview } from "@/actions/reviews";
import { getProductVariantName, getSizeLabel } from "@/utils/product";
import { getProductVariantUrl } from "@/utils/share";
import { Sticker } from "@/components/cards/ShopCard";
import { track } from "@/utils/analytics";

signInAnonymously();

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  rating: z.number().min(1, "Oops! You forgot to rate us 5 stars!").max(5),
});

// Only 4 and 5 read as good; 1-3 are all some flavour of letdown
const VERDICTS = ["Pick a rating", "Total miss", "Disappointed", "Not quite there", "Good enough", "Legendary"];

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3">{children}</p>
);

const Panel = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-[22px] border border-border bg-card ${className}`}>{children}</div>
);

const PageHeader = ({ order, head, accent, copy }: { order: Order; head: string; accent: string; copy: string }) => (
  <>
    <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      <span className="opacity-50">/</span>
      <Link href={`/order/${order.id}`} className="hover:text-foreground">
        Order {order.id}
      </Link>
      <span className="opacity-50">/</span>
      <span className="text-foreground">Review</span>
    </nav>
    <div className="pt-8 md:pt-12">
      <Kicker>
        Order <span className="normal-case tracking-normal font-mono">{order.id}</span> · Review
      </Kicker>
      <h1 className="font-calera uppercase leading-[0.9] text-[17vw] md:text-[clamp(4.5rem,9vw,8rem)]">
        {head} <span className="text-bandit-orange">{accent}</span>.
      </h1>
      <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mt-5">{copy}</p>
    </div>
  </>
);

type OrderPageProps = { params: Promise<{ orderId: string }> };

export default function OrderReviewPage({ params }: OrderPageProps) {
  const router = useRouter();

  // Looked up by id, not from the catalog, so items that are no longer sold still render
  const [variants, setVariants] = useState<ProductVariant[]>();

  const [order, setOrder] = useState<Order | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"not-submitted" | "submitting" | "submitted">("not-submitted");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: { name: "", title: "", comment: "", rating: 0 },
  });
  const rating = useWatch({ control: form.control, name: "rating" });
  const commentLength = useWatch({ control: form.control, name: "comment" }).length;
  const previewUrl = useMemo(() => images[0] && URL.createObjectURL(images[0]), [images]);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = (await params).orderId;
      const order = await getOrder(orderId);
      if (!order) {
        toast.error("We couldn't find that order", { description: "Message us and we'll sort it out." });
        router.push("/");
        return;
      }
      setVariants(await getVariantsByIds(order.variants.map(v => v.variantId)).catch(() => []));
      setSubmitStatus(order.reviewId ? "submitted" : "not-submitted");
      setOrder(order);
    };
    fetchOrder();
  }, [params, router]);

  useEffect(() => {
    if (order) {
      form.setValue("name", order.name);
    }
  }, [order, form]);

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    if (!order) {
      console.error("[OrderReviewPage] Order not found while submitting review");
      return;
    }

    setSubmitStatus("submitting");
    try {
      const reviewId = getCollectionDocumentId(Collections.reviews);

      const imageUrls = [];
      if (images.length > 0) {
        const imageExtension = images[0].name.split(".").pop();
        const storageRef = ref(storage, `${Collections.reviews}/${reviewId}/0.${imageExtension}`);
        const uploadTask = await uploadBytes(storageRef, images[0]);
        imageUrls.push(await getDownloadURL(uploadTask.ref));
      }

      const result = await createReview(reviewId, { ...data, orderId: order.id, images: imageUrls });
      if ("error" in result) throw new Error(result.error);

      track("review_submitted", { order_id: order.id, rating: data.rating, has_photo: imageUrls.length > 0 });
      toast.success("Review sent", { description: "Thanks for taking the time to tell us." });
      setOrder({ ...order, reviewId }); // the submitted screen links to this review
      setSubmitStatus("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("[OrderReviewPage] Error submitting review", error);
      toast.error(
        error instanceof Error && error.message ? error.message : "Couldn't submit your review. Please try again."
      );
      setSubmitStatus("not-submitted");
    }
  };

  const handleOnImageSelect = async (files: File[]) => {
    if (files.length === 0) {
      toast.error("That file won't upload", { description: "Use a JPG, PNG or WebP photo." });
      return;
    }

    setIsCompressing(true);
    const processedFile = await processImage(files[0], { maxWidthOrHeight: 1920 });
    setIsCompressing(false);
    setImages([processedFile]);
  };

  if (!order) return <LoadingScreen />;
  if (submitStatus === "submitted") return <ReviewSubmitted order={order} />;
  if (!variants) return <LoadingScreen />;

  const items = order.variants.flatMap(orderVariant => {
    const variant = variants.find(v => v.id === orderVariant.variantId);
    if (!variant) return [];
    return [{ ...orderVariant, variant, name: getProductVariantName(variant, { includeProductName: true }) }];
  });
  const itemCount = order.variants.reduce((n, v) => n + v.quantity, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-20 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 md:pb-12">
        <div>
          <PageHeader
            order={order}
            head="Rate the"
            accent="loot"
            copy="Stars, a few honest words and a photo of you wearing it. Takes a minute."
          />
        </div>
        <a
          href={getWhatsappHelpWithCreateReviewLink(order.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground md:pb-3">
          Need help? Message us
        </a>
      </header>

      {/* Mobile: the haul as a thumbnail strip above the form */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-6">
        {items.map(item => (
          <Image
            key={`${item.variantId}-${item.size}`}
            width={56}
            height={56}
            quality={40}
            alt={item.name}
            src={item.variant.images.mockup[0]}
            className="w-14 h-14 shrink-0 rounded-[14px] object-cover bg-secondary"
          />
        ))}
        <p className="text-xs text-muted-foreground ml-1 shrink-0">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-10 border-t border-border pt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 min-w-0">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Kicker>01 · Your verdict</Kicker>
                  <Panel className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <FormControl>
                      <StarRatingInput
                        value={field.value}
                        onChange={field.onChange}
                        className="w-9 h-9 md:w-11 md:h-11"
                      />
                    </FormControl>
                    <div className="sm:text-right">
                      <p
                        className={`font-calera uppercase text-4xl leading-none ${rating ? "" : "text-muted-foreground"}`}>
                        {VERDICTS[rating]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posting as <span className="text-foreground">{order.name}</span>
                      </p>
                    </div>
                  </Panel>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Kicker>02 · The headline</Kicker>
                  <FormControl>
                    <Input className="h-12 rounded-xl text-base" placeholder="How was your loot?" {...field} />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Kicker>03 · The story</Kicker>
                  <FormControl>
                    <Textarea
                      placeholder="Bandits don't hesitate! Unload your loot experience"
                      className="min-h-[140px] rounded-xl text-base"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between gap-4 mt-2 text-xs text-muted-foreground">
                    <FormMessage />
                    <span className="ml-auto">{commentLength}</span>
                  </div>
                </FormItem>
              )}
            />

            <section>
              <Kicker>
                04 · Show it off <span className="normal-case tracking-normal">(optional)</span>
              </Kicker>
              {previewUrl ? (
                <div className="relative w-full h-72 rounded-[22px] overflow-hidden bg-secondary">
                  <Image fill src={previewUrl} alt="Review image preview" className="object-contain" />
                  <button
                    type="button"
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80"
                    onClick={() => setImages([])}>
                    Remove
                  </button>
                </div>
              ) : (
                <FileDropzone loading={isCompressing} onDrop={handleOnImageSelect} />
              )}
              <p className="text-xs text-muted-foreground mt-2">Photos with the gear on get featured on the site.</p>
            </section>

            <Button
              type="submit"
              disabled={submitStatus === "submitting"}
              className="w-full h-auto rounded-full bg-bandit-orange text-black hover:bg-bandit-orange/90 py-4 text-base text-wrap">
              {submitStatus === "submitting" ? (
                <>
                  Submitting... This may take a while <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  Submit review <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <aside className="hidden lg:block space-y-4 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 self-start">
          <Kicker>
            What you&apos;re reviewing · {itemCount} {itemCount === 1 ? "item" : "items"}
          </Kicker>
          <Panel className="px-5 divide-y divide-border">
            {items.map(({ variant, name, size, quantity, variantId }) => (
              <Link
                key={`${variantId}-${size}`}
                href={getProductVariantUrl(variant)}
                target="_blank"
                className="flex items-center gap-4 py-4 group">
                <Image
                  width={64}
                  height={64}
                  quality={40}
                  alt={name}
                  src={variant.images.mockup[0]}
                  className="w-16 h-16 shrink-0 rounded-[14px] object-cover bg-secondary"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate group-hover:text-bandit-orange">{name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {[size && getSizeLabel(size), `Qty ${quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </Panel>
          <div className="rounded-[22px] p-5 bg-bandit-orange text-black">
            <p className="font-calera uppercase text-3xl leading-[0.9]">Your word counts.</p>
            <p className="text-sm mt-1.5">We read every single one. It helps the next bandit pick their loot.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const ReviewSubmitted = ({ order }: { order: Order }) => (
  <div className="max-w-screen-xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-20 min-h-screen">
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-10 items-end">
      <div>
        <PageHeader
          order={order}
          head="Review"
          accent="received"
          copy="Thanks for backing the gang. Your words help the next bandit pick their loot."
        />
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-bandit-orange text-black text-sm font-medium px-5 py-2.5 hover:bg-bandit-orange/90">
            Back to the shop <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href={`/order/${order.id}`}
            className="rounded-full border border-border text-sm px-5 py-2.5 hover:border-muted-foreground">
            View order
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        <div className="lg:text-right">
          <Sticker tone="light">Thanks, bandit</Sticker>
        </div>
        <a
          href={getWhatsappUpdateReviewLink(order.reviewId!, order.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[22px] border border-border bg-card px-5 py-4 text-sm hover:border-muted-foreground transition-colors">
          <MessageCircleIcon className="w-5 h-5 text-bandit-orange" />
          <span className="flex-1">Want to change something? Message us on WhatsApp</span>
          <ArrowUpRightIcon className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>
    </div>
  </div>
);
