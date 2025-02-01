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

signInAnonymously();

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  rating: z.number().min(1, "Oops! You forgot to rate us 5 stars!").max(5),
});

type OrderPageProps = { params: Promise<{ orderId: string }> };

export default function OrderReviewPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"not-submitted" | "submitting" | "submitted">("not-submitted");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      title: "",
      comment: "",
      rating: 0,
    },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = (await params).orderId;
      const order = await getOrder(orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }
      setSubmitStatus(order.reviewId ? "submitted" : "not-submitted");
      setOrder(order);
    };
    fetchOrder();
  }, [params]);

  useEffect(() => {
    if (order) {
      form.setValue("name", order.name);
      form.setValue("email", order.email);
    }
  }, [order, form]);

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    if (!order) {
      console.error("[OrderReviewPage] Order not found while submitting review");
      return;
    }

    setSubmitStatus("submitting");
    const reviewId = getCollectionDocumentId(Collections.reviews);

    let imageUrl = "";
    if (image) {
      const storageRef = ref(storage, `${Collections.reviews}/${reviewId}/${image.name}`);
      const uploadTask = await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(uploadTask.ref);
    }

    const review: Omit<Review, "id"> = {
      ...data,
      status: "pending",
      orderId: order.id,
      createdAt: getTimestamp(),
      productIds: order.products.map(product => product.id),
      images: imageUrl ? [imageUrl] : [],
    };

    await createReview(reviewId, review);
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
    setImage(compressedFile);
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
                    {order.products.map(product => (
                      <Link href={`/designs/${product.id}`} target="_blank" key={product.id}>
                        <Card key={product.id} className="">
                          <CardContent className="flex flex-col items-start gap-4 p-4">
                            <div className="relative w-full h-48 md:h-32">
                              <Image
                                fill
                                quality={40}
                                src={product.image}
                                alt={product.name}
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
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
                      disabled
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input autoComplete="off" placeholder="Enter your email" {...field} />
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

                    {!image && (
                      <FormItem>
                        <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                          <FileDropzone loading={isCompressing} onDrop={handleOnImageSelect} />
                        </FormControl>
                        <FormDescription>We will use this image to showcase your review</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                    {image && (
                      <div className="relative w-full h-64">
                        <Image
                          fill
                          src={URL.createObjectURL(image)}
                          alt="Review image preview"
                          className="object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setImage(null)}>
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
                  className="w-full"
                  disabled={submitStatus === "submitting"}
                  onClick={form.handleSubmit(onSubmit)}>
                  Submit Review
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
