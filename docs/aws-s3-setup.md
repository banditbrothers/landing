# AWS S3 Setup for Image Uploads

This document outlines how to set up AWS S3 for image uploads in the Bandit Brothers application.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```
# AWS S3 Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
```

## Setting Up AWS S3 Bucket

1. Create an S3 bucket in your AWS account
2. Create an IAM user with permissions to upload to this bucket
3. Generate access keys for this IAM user
4. Configure CORS for your S3 bucket to allow uploads from your application domain

## CORS Configuration Example

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

## Usage

The application is set up to upload WebP images from the public directory to your S3 bucket using the "Upload Variant Images" button on the home page.

To upload different images, modify the `uploadVariantImages` function in `src/components/pages/home/hero/HeroSection.tsx`.
