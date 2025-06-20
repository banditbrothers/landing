"use server";

// import { firestore } from "@/lib/firebase-admin";

// import { DESIGNS } from "@/data/products";
// import { firestore } from "@/lib/firebase-admin";

// import { firestore } from "@/lib/firebase-admin";
// import { OldReview, Review } from "@/types/review";
// import { getSKU } from "@/utils/product";
// import * as admin from "firebase-admin";
// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";
// import fetch from "node-fetch";

// // Initialize S3 client
// const s3Client = new S3Client({
//   region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
//   credentials: {
//     accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
//     secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
//   },
// });

// const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";

// // Function to upload a buffer to S3
// const uploadBufferToS3 = async (
//   buffer: Buffer,
//   s3Key: string,
//   bucketName: string,
//   contentType: string = "image/jpeg"
// ): Promise<string> => {
//   try {
//     // Upload to S3
//     const upload = new Upload({
//       client: s3Client,
//       params: {
//         Bucket: bucketName,
//         Key: s3Key,
//         Body: buffer,
//         ContentType: contentType,
//       },
//     });

//     const result = await upload.done();
//     return result.Location || "";
//   } catch (error) {
//     console.error("Error uploading to S3:", error);
//     throw error;
//   }
// };

// // import { DESIGNS, PRODUCTS } from "@/data/products";
// // import { firestore } from "@/lib/firebase-admin";
// // import { ProductVariant } from "@/types/product";
// // import { getSKU } from "@/utils/product";
// // import { uploadWebpImageToS3 } from "@/utils/s3Upload";

// // export const addVariants = async () => {
// //   const variantRef = firestore().collection("variants");
// //   const batch = firestore().batch();

// //   PRODUCTS.forEach(product => {
// //     DESIGNS.forEach(design => {
// //       const id = getSKU(product.id, design.id);

// //       const variant: ProductVariant = {
// //         productId: product.id,
// //         designId: design.id,
// //         images: { mockup: [], detail: [], lifestyle: [], main: [], thumbnail: "" },
// //         sku: id,
// //       };

// //       const variantDoc = variantRef.doc(id);
// //       batch.set(variantDoc, variant, { merge: true });
// //     });
// //   });

// //   await batch.commit();
// //   console.log("Variants added");
// // };

// // export const uploadImage = async (imageName: string, s3Key: string, bucketName: string, designId: string) => {
// //   const imageUrl = await uploadWebpImageToS3(imageName, s3Key, bucketName);

// //   // toast.success("Image uploaded successfully");
// //   console.log("Uploaded image URL:", imageUrl);

// //   await updateVariantImages(designId, imageUrl);
// //   console.log("Updated variant images");

// //   return imageUrl;
// // };

// // export const updateVariantImages = async (designId: string, mockImageUrl: string) => {
// //   const variantRef = firestore().collection("variants").doc(getSKU("bandana", designId));
// //   await variantRef.update({
// //     images: { mockup: [mockImageUrl] },
// //   });
// // };

// // export const migrateReviews = async () => {
// //   const reviewsRef = firestore().collection("reviews");
// //   const reviews = await reviewsRef.get();

// //   const batch = firestore().batch();

// //   reviews.docs.forEach(async doc => {
// //     const review = doc.data() as OldReview;
// //     const reviewId = doc.id;

// //     // https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/reviews/8sUTNMu1bxPQB853p5Sg/image-0.jpeg

// //     // if (review.images.length > 0) {
// //     //   const response = await fetch(review.images[0]);
// //     //   const buffer = Buffer.from(await response.arrayBuffer());
// //     //   const contentType = response.headers.get("content-type") || "image/jpeg";
// //     //   const extension = contentType.split("/")[1] || "jpg";

// //     //   const s3Key = `reviews/${reviewId}/image-${0}.${extension}`;

// //     //   const newImageUrl = await uploadBufferToS3(
// //     //       buffer,
// //     //       s3Key,
// //     //       s3BucketName,
// //     //       contentType
// //     //     );

// //     //   newImages = [newImageUrl];
// //     // }

// //     const { productIds, images, ...rest } = review;
// //     console.log({productIds, reviewId})

// //     const newReview: Review = {
// //       ...rest,
// //       source: "website",
// //       images: review.images.map(() => `https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/reviews/${reviewId}/image-0.jpeg` ),
// //       variantIds: productIds.map((designId: string) => getSKU("bandana", designId)),
// //     };

// //     batch.set(doc.ref, newReview);
// //   });

// //   await batch.commit();
// // };

// export const setDiscoverable = async () => {
//   const batch = firestore().batch();

//   const variants = await firestore().collection("variants").get();
//   variants.forEach(variant => {
//     if (variant.data().isDiscoverable === undefined) {
//       batch.update(variant.ref, {
//         isDiscoverable: true,
//       });
//     }
//   });
//   await batch.commit();

//   return "done";
// };
