#!/usr/bin/env node

/**
 * Script to compress all images in AWS S3 bucket that are larger than 550KB
 * Usage: node scripts/compress-s3-images.js
 */

const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Try to load Sharp for image compression, fallback to simple approach if not available
let sharp;
sharp = require('sharp');
try {
  sharp = require('sharp');
  console.log('✅ Using Sharp for image compression');
} catch (e) {
  console.log('⚠️  Sharp not available, using fallback compression');
}

// Configuration
const MAX_SIZE_KB = 550;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🧪 DRY RUN MODE: No files will be uploaded');
}

// S3 Client setup
// const s3Client = new S3Client({
//   region: "",
//   credentials: {
//     accessKeyId: "",
//     secretAccessKey: "",
//   },
// });

// const BUCKET_NAME = "";

// Image compression function using Sharp or fallback
async function compressImageBuffer(buffer, originalName, targetSizeKB = MAX_SIZE_KB) {
  try {
    if (!sharp) {
      console.log('⚠️  Sharp not available - this image will be skipped for now');
      console.log('💡 To enable compression, please fix Sharp installation:');
      console.log('   npm install sharp --force');
      console.log('   or try: yarn add sharp');
      return null; // Return null to indicate skipping
    }

    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    console.log(`📐 Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);

    // Start with high quality and reduce if needed
    let quality = 85;
    let compressedBuffer;
    let attempts = 0;
    const maxAttempts = 6;
    let currentImage = image;

    do {
      attempts++;
      
      try {
        // Always convert to WebP for best compression
        compressedBuffer = await currentImage
          .webp({ 
            quality, 
            effort: 6,
            lossless: false
          })
          .toBuffer();
      } catch (sharpError) {
        console.log(`⚠️  Sharp error, falling back to original: ${sharpError.message}`);
        return buffer;
      }

      const compressedSizeKB = compressedBuffer.length / 1024;
      console.log(`🔄 Attempt ${attempts}: Quality ${quality}, Size: ${compressedSizeKB.toFixed(2)}KB`);

      // If size is acceptable, break
      if (compressedSizeKB <= targetSizeKB) {
        break;
      }

      // If we've tried multiple qualities and still too big, try resizing
      if (attempts === 4 && compressedSizeKB > targetSizeKB) {
        const newWidth = Math.floor(metadata.width * 0.8);
        const newHeight = Math.floor(metadata.height * 0.8);
        console.log(`📏 Resizing to ${newWidth}x${newHeight}`);
        try {
          currentImage = image.resize(newWidth, newHeight, { 
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true 
          });
        } catch (resizeError) {
          console.log(`⚠️  Resize error: ${resizeError.message}`);
          break;
        }
        quality = 85; // Reset quality after resize
      } else if (attempts === 5 && compressedSizeKB > targetSizeKB) {
        const newWidth = Math.floor(metadata.width * 0.6);
        const newHeight = Math.floor(metadata.height * 0.6);
        console.log(`📏 Resizing to ${newWidth}x${newHeight}`);
        try {
          currentImage = image.resize(newWidth, newHeight, { 
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true 
          });
        } catch (resizeError) {
          console.log(`⚠️  Resize error: ${resizeError.message}`);
          break;
        }
        quality = 80;
      } else {
        // Reduce quality for next attempt
        quality = Math.max(15, quality - 20);
      }
      
      // If we've tried everything and it's still too big, accept it
      if (attempts >= maxAttempts) {
        break;
      }
      
    } while (attempts < maxAttempts);

    return compressedBuffer;
    
  } catch (error) {
    console.error(`Error compressing image ${originalName}:`, error.message);
    console.log('📋 Falling back to original image');
    return buffer;
  }
}

// Convert stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Check if file is an image
function isImageFile(key) {
  const imageExtensions = ['.webp'];
  const ext = path.extname(key.toLowerCase());
  return imageExtensions.includes(ext);
}

// Get object size
async function getObjectSize(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.ContentLength;
  } catch (error) {
    console.error(`Error getting size for ${key}:`, error);
    return 0;
  }
}

// Download object from S3
async function downloadFromS3(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return await streamToBuffer(response.Body);
  } catch (error) {
    console.error(`Error downloading ${key}:`, error);
    throw error;
  }
}

// Upload compressed image back to S3
async function uploadToS3(buffer, key, contentType = 'image/webp') {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    console.log(`✅ Uploaded compressed image: ${key}`);
  } catch (error) {
    console.error(`Error uploading ${key}:`, error);
    throw error;
  }
}

// List all objects in S3 bucket
async function listAllObjects() {
  const objects = [];
  let continuationToken;

  do {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      });
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        objects.push(...response.Contents);
      }
      
      continuationToken = response.NextContinuationToken;
    } catch (error) {
      console.error('Error listing objects:', error);
      throw error;
    }
  } while (continuationToken);

  return objects;
}

// Main compression function
async function compressS3Images() {
  console.log('🚀 Starting S3 image compression process...');
  console.log(`📊 Target: Compress images larger than ${MAX_SIZE_KB}KB`);
  console.log(`🪣 Bucket: ${BUCKET_NAME}`);
  console.log('');

  try {
    // List all objects
    console.log('📋 Listing all objects in S3 bucket...');
    const objects = await listAllObjects();
    console.log(`Found ${objects.length} total objects`);

    // Filter image files
    const imageObjects = objects.filter(obj => isImageFile(obj.Key));
    console.log(`Found ${imageObjects.length} image files`);
    console.log('');

    let processedCount = 0;
    let compressedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each image
    for (const obj of imageObjects) {
      const key = obj.Key;
      const size = obj.Size;
      
      console.log(`\n🔍 Processing: ${key} (${(size / 1024).toFixed(2)}KB)`);
      
      try {
        // Skip if already under target size
        if (size <= MAX_SIZE_BYTES) {
          console.log(`⏭️  Skipped: Already under ${MAX_SIZE_KB}KB`);
          skippedCount++;
          processedCount++;
          continue;
        }

        // Download the image
        console.log('⬇️  Downloading...');
        const buffer = await downloadFromS3(key);

        // Compress the image
        console.log('🗜️  Compressing...');
        const compressedBuffer = await compressImageBuffer(buffer, key);
        
        // Check if compression was successful
        if (compressedBuffer === null) {
          console.log('⏭️  Skipped: Compression not available');
          skippedCount++;
          processedCount++;
          continue;
        }
        
        const originalSizeKB = (size / 1024).toFixed(2);
        const compressedSizeKB = (compressedBuffer.length / 1024).toFixed(2);
        const savings = (((size - compressedBuffer.length) / size) * 100).toFixed(1);
        
        console.log(`📉 Size: ${originalSizeKB}KB → ${compressedSizeKB}KB (${savings}% reduction)`);

        // Upload compressed image back
        if (!isDryRun) {
          console.log('⬆️  Uploading compressed version...');
          await uploadToS3(compressedBuffer, key);
        } else {
          console.log('🧪 [DRY RUN] Would upload compressed version');
        }
        
        compressedCount++;
        console.log(`✅ Successfully compressed: ${key}`);
        
      } catch (error) {
        console.error(`❌ Error processing ${key}:`, error.message);
        errorCount++;
      }
      
      processedCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPRESSION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total images processed: ${processedCount}`);
    console.log(`Images compressed: ${compressedCount}`);
    console.log(`Images skipped (already small): ${skippedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log('✨ Process completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  compressS3Images().catch(console.error);
}

module.exports = { compressS3Images };
