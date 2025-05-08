import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload a webp image from the public directory to S3
 * @param imageName - Name of the image in the public folder (without path)
 * @param s3Key - The key (path) to save the image in S3
 * @param bucketName - S3 bucket name
 */
export const uploadWebpImageToS3 = async (
  imageName: string,
  s3Key: string,
  bucketName: string
): Promise<string> => {
  // Only process webp images
  if (!imageName.endsWith(".webp")) {
    throw new Error("Only webp images are supported");
  }

  const publicDir = path.join(process.cwd(), "public", 'designs');
  const imagePath = path.join(publicDir, imageName);

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  // Read file content
  const fileContent = fs.readFileSync(imagePath);

  try {
    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: { Bucket: bucketName, Key: s3Key, Body: fileContent, ContentType: "image/webp" },
    });

    const result = await upload.done();
    return result.Location || "";
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}; 