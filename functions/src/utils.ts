const baseUrl = "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/";

export function getPathStorageFromUrl(url: string) {
  let imagePath = url.replace(baseUrl, "");
  const indexOfEndPath = imagePath.indexOf("?");
  imagePath = imagePath.substring(0, indexOfEndPath);
  imagePath = imagePath.replaceAll("%2F", "/");
  return imagePath;
}

/**
 * Extracts the S3 key from an S3 URL
 * Example: https://bucket.s3.region.amazonaws.com/key/path -> key/path
 */
export function getS3KeyFromUrl(url: string): string | null {
  try {
    // Match S3 URL pattern: https://bucket.s3.region.amazonaws.com/key
    const s3UrlPattern = /https:\/\/[^/]+\.s3\.[^/]+\/(.+)/;
    const match = url.match(s3UrlPattern);
    if (match && match[1]) {
      // Decode URL encoding if present
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
}
