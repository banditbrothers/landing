"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { getOrder } from "@/actions/orders";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { StarRatingInput } from "@/components/misc/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Review } from "@/types/review";
import { getTimestamp } from "@/utils/timestamp";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getWhatsappHelpWithCreateReviewLink, getWhatsappUpdateReviewLink } from "@/utils/whatsappMessageLinks";
import { CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { FileDropzone } from "@/components/misc/FileUploader";
import { compressImage } from "@/utils/image";
import Link from "next/link";
import { getCollectionDocumentId, signInAnonymously, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Collections } from "@/constants/collections";
import { createReview } from "@/actions/reviews";
import { getDiscordReviewMessage } from "@/utils/discordMessages";
import { sendDiscordReviewMessage } from "@/actions/discord";
import { useVariants } from "@/hooks/useVariants";
import { getProductVariantName } from "@/utils/product";
import { getProductVariantUrl } from "@/utils/share";

signInAnonymously();

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  rating: z.number().min(1, "Oops! You forgot to rate us 5 stars!").max(5),
});

type OrderPageProps = { params: Promise<{ orderId: string }> };

export default function OrderReviewPage({ params }: OrderPageProps) {
  const router = useRouter();

  const { data: variants } = useVariants();

  const [order, setOrder] = useState<Order | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"not-submitted" | "submitting" | "submitted">("not-submitted");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: { name: "", title: "", comment: "", rating: 0 },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = (await params).orderId;
      const order = await getOrder(orderId);
      if (!order) {
        toast.error("Invalid Order ID... Please contact us to resolve this issue");
        router.push("/");
        return;
      }
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
    const reviewId = getCollectionDocumentId(Collections.reviews);

    const imageUrls = [];
    if (images.length > 0) {
      const imageExtension = images[0].name.split(".").pop();
      const storageRef = ref(storage, `${Collections.reviews}/${reviewId}/0.${imageExtension}`);
      const uploadTask = await uploadBytes(storageRef, images[0]);
      imageUrls.push(await getDownloadURL(uploadTask.ref));
    }

    const review: Omit<Extract<Review, { source: "website" }>, "id"> = {
      ...data,
      status: "pending",
      email: order.email,
      source: "website",
      orderId: order.id,
      createdAt: getTimestamp(),
      variantIds: order.variants.map(variant => variant.variantId),
      images: imageUrls,
    };

    await createReview(reviewId, review);
    await sendDiscordReviewMessage(getDiscordReviewMessage({ ...review, id: reviewId }));

    toast.success("Review submitted successfully");
    setSubmitStatus("submitted");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOnImageSelect = async (files: File[]) => {
    if (files.length === 0) {
      toast.error("Oops, this file is not supported");
      return;
    }

    setIsCompressing(true);
    const compressedFile = await compressImage(files[0]);
    setIsCompressing(false);
    setImages([compressedFile]);
  };

  if (!order) return <LoadingScreen />;
  if (submitStatus === "submitted") return <ReviewSubmitted order={order} />;

  return (
    <div className="container mx-auto max-w-2xl mt-20 min-h-screen">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Leave Us A Review</CardTitle>
            <Button
              variant="link"
              className="px-0"
              onClick={() =>
                window.open(getWhatsappHelpWithCreateReviewLink(order.id), "_blank", "noreferrer noopener")
              }>
              Need Help?
            </Button>
          </div>
          <CardDescription>We value your feedback and would love to hear about your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Products Review Section */}
            <Accordion type="single" collapsible className="w-full mb-8 rounded-lg bg-bandit-orange/10 ">
              <AccordionItem value="products" className="border-none">
                <AccordionTrigger className="px-6 py-3">
                  <div>
                    <h3 className="text-lg font-semibold">Your Mischief</h3>
                    <p className="text-sm text-muted-foreground">Click to view your products</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {order.variants.map(orderVariant => {
                      const variant = variants.find(v => v.id === orderVariant.variantId)!;

                      const name = getProductVariantName(variant, { includeProductName: true });
                      const quantity = orderVariant.quantity;

                      return (
                        <Link href={getProductVariantUrl(variant)} target="_blank" key={variant.id}>
                          <Card key={variant.id} className="">
                            <CardContent className="flex flex-col items-start gap-4 p-4">
                              <div className="relative w-full h-48 md:h-32">
                                <Image
                                  fill
                                  alt={name}
                                  quality={40}
                                  src={variant.images.mockup[0]}
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium">{name}</h3>
                                <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Review Form */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Write Your Review</CardTitle>
                <CardDescription>Share your experience with these products</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      disabled
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input autoComplete="off" placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <StarRatingInput value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl>
                            <Input placeholder="How was your loot?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Bandits don't hesitate! Unload your loot experience"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!images.length && (
                      <FormItem>
                        <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                          <FileDropzone loading={isCompressing} onDrop={handleOnImageSelect} />
                        </FormControl>
                        <FormDescription>We will use this image to showcase your review</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                    {images.length > 0 && (
                      <div className="relative w-full h-64">
                        <Image
                          fill
                          src={URL.createObjectURL(images[0])}
                          alt="Review image preview"
                          className="object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setImages([])}>
                          Remove
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full text-wrap"
                  disabled={submitStatus === "submitting"}
                  onClick={form.handleSubmit(onSubmit)}>
                  {submitStatus === "submitting" ? "Submitting... This may take a while" : "Submit Review"}
                  {submitStatus === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ReviewSubmitted = ({ order }: { order: Order }) => {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-2xl mt-20 min-h-screen px-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mb-2">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          </div>
          <CardTitle className="text-3xl font-semibold text-foreground">Review Submitted</CardTitle>
          <p className="text-muted-foreground mt-2">Thank you for taking the time to share your feedback!</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 px-6 py-8">
          <div className="text-center">
            <p className="text-card-foreground font-medium mb-3">Need to update your review?</p>
            <Button
              variant="outline"
              className="hover:bg-accent transition-colors"
              onClick={() => {
                const link = getWhatsappUpdateReviewLink(order.reviewId!, order.id);
                window.open(link, "_blank");
              }}>
              <MessageCircle className="w-4 h-4" />
              Contact Us
            </Button>
          </div>
          <div className="w-full pt-4 border-t border-border">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              onClick={() => router.push("/")}>
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
