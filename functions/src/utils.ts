const baseUrl = "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/";

export function getPathStorageFromUrl(url: string) {
  let imagePath = url.replace(baseUrl, "");
  const indexOfEndPath = imagePath.indexOf("?");
  imagePath = imagePath.substring(0, indexOfEndPath);
  imagePath = imagePath.replaceAll("%2F", "/");
  return imagePath;
}
