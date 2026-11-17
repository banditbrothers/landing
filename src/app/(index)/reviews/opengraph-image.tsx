import { getApprovedReviews, getRatingSummary } from "@/lib/reviews";
import {
  GREY,
  ORANGE,
  TextCard,
  loadCalera,
  renderThinText,
  shareImageContentType,
  shareImageSize,
  toShareImageResponse,
} from "@/lib/shareImage";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Bandit Brothers customer reviews";

const Star = () => (
  <svg width="48" height="48" viewBox="0 0 24 24">
    <path fill={ORANGE} d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21.2l1.6-7L2 9.5l7.1-.6z" />
  </svg>
);

// Title on the left, the live average rating on the right
export default async function Image() {
  const calera = await loadCalera();
  const reviews = await getApprovedReviews().catch(() => []);
  const { average, count } = getRatingSummary(reviews);
  const [title, rating] = await Promise.all([
    renderThinText("WORD ON THE STREET", 84, 560, calera),
    renderThinText(count ? average.toFixed(1) : "5.0", 190, 400, calera),
  ]);

  return toShareImageResponse(
    <TextCard footer="banditbrothers.in/reviews">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={title.src} width={title.width} height={title.height} alt="" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
          <img src={rating.src} width={rating.width} height={rating.height} alt="" />
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <Star key={i} />
            ))}
          </div>
          {count > 0 && <div style={{ fontSize: 24, color: GREY, letterSpacing: 2 }}>{`FROM ${count} REVIEWS`}</div>}
        </div>
      </div>
    </TextCard>,
    calera
  );
}
