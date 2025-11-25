import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestoreEvent, Change } from "firebase-functions/v2/firestore";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { getS3KeyFromUrl } from "./utils";

type ImageSet = {
  thumbnail?: string;
  main?: string[];
  detail?: string[];
  lifestyle?: string[];
  mockup: string[];
};

type Event = FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, { variantId: string }>;

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET!;

/**
 * Gets all image URLs from an ImageSet
 */
function getAllImageUrls(images: ImageSet | undefined): string[] {
  if (!images) return [];
  
  const urls: string[] = [];
  
  if (images.thumbnail) urls.push(images.thumbnail);
  if (images.main) urls.push(...images.main);
  if (images.detail) urls.push(...images.detail);
  if (images.lifestyle) urls.push(...images.lifestyle);
  if (images.mockup) urls.push(...images.mockup);
  
  return urls;
}

/**
 * Deletes an image from S3
 */
async function deleteImageFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`Successfully deleted S3 object: ${key}`);
  } catch (error) {
    console.error(`Error deleting S3 object ${key}:`, error);
    throw error;
  }
}

export const onVariantUpdated = async (event: Event) => {
  const variantId = event.params.variantId;
  
  // Handle undefined case
  if (!event.data) {
    console.log(`No data in event for variantId: ${variantId}`);
    return;
  }

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  console.log(`Processing variant update for variantId: ${variantId}`);

  // Get old and new images
  const oldImages = beforeData.images as ImageSet | undefined;
  const newImages = afterData.images as ImageSet | undefined;

  // Get all image URLs from before and after
  const oldImageUrls = getAllImageUrls(oldImages);
  const newImageUrls = getAllImageUrls(newImages);

  // Find deleted image URLs (present in old but not in new)
  const deletedImageUrls = oldImageUrls.filter((url) => !newImageUrls.includes(url));

  if (deletedImageUrls.length === 0) {
    console.log(`No images deleted for variantId: ${variantId}`);
    return;
  }

  console.log(`Found ${deletedImageUrls.length} deleted image(s) for variantId: ${variantId}`);

  // Extract S3 keys and delete images
  const deletePromises = deletedImageUrls
    .map((url) => {
      const s3Key = getS3KeyFromUrl(url);
      if (!s3Key) {
        console.warn(`Could not extract S3 key from URL: ${url}`);
        return null;
      }
      return deleteImageFromS3(s3Key);
    })
    .filter((promise): promise is Promise<void> => promise !== null);

  if (deletePromises.length === 0) {
    console.log(`No valid S3 URLs found to delete for variantId: ${variantId}`);
    return;
  }

  // Execute all deletions
  const results = await Promise.allSettled(deletePromises);
  
  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `Deleted ${successful} image(s) successfully, ${failed} failed for variantId: ${variantId}`
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to delete image ${deletedImageUrls[index]}:`,
        result.reason
      );
    }
  });
};

