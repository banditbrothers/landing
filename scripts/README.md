# S3 Image Compression Script

This script compresses all images in your AWS S3 bucket that are larger than 550KB.

## Prerequisites

1. Make sure you have a `.env.local` file in the project root with your AWS credentials:

   ```
   NEXT_PUBLIC_AWS_REGION=your-region
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
   NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
   ```

2. All required dependencies should already be installed via the main project's package.json

## Usage

Run the script from the project root:

```bash
# Production run (will actually compress and upload)
node scripts/compress-s3-images.js

# Dry run (test without uploading)
node scripts/compress-s3-images.js --dry-run

# Using npm script
npm run compress-s3-images

# Using npm script with dry run
npm run compress-s3-images -- --dry-run
```

## What it does

1. **Lists all objects** in your S3 bucket
2. **Filters image files** (jpg, jpeg, png, webp, gif)
3. **Checks file sizes** and skips images already under 550KB
4. **Downloads large images** from S3
5. **Compresses them** using the same compression logic as your app
6. **Uploads the compressed versions** back to S3 with the same filename
7. **Provides detailed logging** of the process

## Features

- ✅ **Smart compression** using Sharp library with WebP conversion
- ✅ **Adaptive quality reduction** - tries multiple quality levels
- ✅ **Intelligent resizing** - reduces dimensions if quality alone isn't enough
- ✅ **Preserves original filenames** and S3 paths
- ✅ **Skips images** already under 550KB
- ✅ **Dry-run mode** for testing without uploading
- ✅ **Detailed progress logging** with compression ratios
- ✅ **Error handling** for individual files without stopping
- ✅ **Process summary** at the end
- ✅ **Rate limiting** to avoid AWS throttling

## Output Example

```
🚀 Starting S3 image compression process...
📊 Target: Compress images larger than 550KB
🪣 Bucket: your-bucket-name

📋 Listing all objects in S3 bucket...
Found 45 total objects
Found 32 image files

🔍 Processing: bandana/design-1/mockup-123456.webp (1250.45KB)
⬇️  Downloading...
🗜️  Compressing...
📉 Size: 1250.45KB → 487.32KB (61.0% reduction)
⬆️  Uploading compressed version...
✅ Successfully compressed: bandana/design-1/mockup-123456.webp

==================================================
📊 COMPRESSION SUMMARY
==================================================
Total images processed: 32
Images compressed: 15
Images skipped (already small): 17
Errors encountered: 0
✨ Process completed!
```

## Notes

- The script uses a 100ms delay between operations to avoid rate limiting
- Original images are replaced with compressed versions
- Make sure to backup your S3 bucket before running if you want to preserve originals
- The script handles Node.js environment compatibility for browser-image-compression
