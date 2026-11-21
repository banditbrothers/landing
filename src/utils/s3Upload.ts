"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/admin-auth";

// Server-only credentials. Not AWS_* names: Vercel reserves those.
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

// Images are compressed to ~0.5MB in the browser first, well under the 1MB server action body limit
export const uploadToS3 = async (file: File, productId: string, designId: string): Promise<string> => {
  await requireAdmin();
  if (!file.type.startsWith("image/")) throw new Error("Only images can be uploaded");

  const key = `${productId}/${designId}/mockup-${Date.now()}.webp`;
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      })
    );
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
  return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
};
