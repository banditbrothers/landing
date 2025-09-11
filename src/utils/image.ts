import imageCompression, { Options } from "browser-image-compression";

/**
 * Check if a file is in WebP format by examining its MIME type
 */
export function isWebPFile(file: File): boolean {
  return file.type === 'image/webp';
}

/**
 * Convert an image file to WebP format using Canvas API
 * @param file - The image file to convert
 * @param quality - WebP quality (0-1, default: 0.8)
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(file: File, quality: number = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Create new File object with WebP blob
          const webpFile = new File([blob], getWebPFileName(file.name), {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate WebP filename from original filename
 */
function getWebPFileName(originalName: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}.webp`;
}

/**
 * Process image: convert to WebP if needed, then compress
 * @param file - The original image file
 * @param compressionOptions - Options for compression
 * @returns Promise<File> - The processed file
 */
export async function processImage(
  file: File,
  compressionOptions: Options = { maxSizeMB: 0.5, useWebWorker: true }
): Promise<File> {
  let processedFile = file;

  // Convert to WebP if not already in WebP format
  if (!isWebPFile(file)) {
    try {
      processedFile = await convertToWebP(file, 1);
    } catch (error) {
      console.warn('Failed to convert to WebP, proceeding with original format:', error);
      // Continue with original file if conversion fails
    }
  }

  // Compress the image (WebP or original format)
  const compressedFile = await compressImage(processedFile, compressionOptions);
  return compressedFile;
}

export async function compressImage(
  imageFile: File,
  options: Options = { maxSizeMB: 0.5, useWebWorker: true }
) {
  const compressedFile = await imageCompression(imageFile, options);
  return compressedFile;
}
