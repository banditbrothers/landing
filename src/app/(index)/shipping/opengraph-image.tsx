import { renderTitleCard, shareImageContentType, shareImageSize } from "@/lib/shareImage";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Bandit Brothers Shipping Policy";

export default function Image() {
  return renderTitleCard({ eyebrow: "The fine print", title: "Shipping Policy" });
}
