import { ACTIVE_PRODUCTS } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import {
  GREY,
  ORANGE,
  loadCalera,
  renderThinText,
  shareImageContentType,
  shareImageSize,
  toJpegDataUri,
  toShareImageResponse,
} from "@/lib/shareImage";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Bandit Brothers: shop bandanas, balaclavas and square bandanas";

const W = shareImageSize.width;
const PHOTO_H = 420;

// One tile per active product (its featured mockup), name tag in the corner, the loot count underneath
export default async function Image() {
  const tileW = Math.floor(W / ACTIVE_PRODUCTS.length);
  const calera = await loadCalera();
  const [photos, title, catalog] = await Promise.all([
    Promise.all(ACTIVE_PRODUCTS.map(p => (p.baseImages?.mockup?.[0] ? toJpegDataUri(p.baseImages.mockup[0], tileW, PHOTO_H) : null))),
    renderThinText("SHOP THE LOOT", 76, 700, calera),
    getCatalog(),
  ]);

  return toShareImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "Calera" }}>
      <div style={{ display: "flex", height: PHOTO_H }}>
        {ACTIVE_PRODUCTS.map((product, i) => (
          <div key={product.id} style={{ display: "flex", position: "relative", width: tileW, height: PHOTO_H, background: "#171717" }}>
            {photos[i] && <img src={photos[i]} width={tileW} height={PHOTO_H} alt="" />}
            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 20,
                padding: "8px 14px",
                background: "#0a0a0a",
                color: "#fff",
                fontSize: 22,
                letterSpacing: 2,
              }}>
              {product.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 6, background: ORANGE }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 56px",
          backgroundImage: "radial-gradient(circle at 100% 100%, rgba(253,110,0,0.28), transparent 55%)",
        }}>
        <img src={title.src} width={title.width} height={title.height} alt="" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          {catalog && <div style={{ fontSize: 34, color: "#fff" }}>{`${new Set(catalog.map(v => v.designId)).size} DESIGNS`}</div>}
          <div style={{ fontSize: 24, color: GREY, letterSpacing: 2 }}>banditbrothers.in</div>
        </div>
      </div>
    </div>,
    calera
  );
}
