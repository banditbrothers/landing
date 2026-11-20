import { CONTACT } from "@/lib/site";
import {
  ORANGE,
  TextCard,
  loadCalera,
  renderBrand,
  renderThinText,
  shareImageContentType,
  shareImageSize,
  toShareImageResponse,
} from "@/lib/shareImage";

export const size = shareImageSize;
export const contentType = shareImageContentType;
export const alt = "Contact Bandit Brothers on WhatsApp, email or Instagram";

const CHANNELS = [
  { label: "WHATSAPP", value: CONTACT.phone },
  { label: "EMAIL", value: CONTACT.email },
  { label: "INSTAGRAM", value: CONTACT.instagramHandle },
];

// Title on the left, every way to reach us on the right
export default async function Image() {
  const calera = await loadCalera();
  const [title, brand] = await Promise.all([
    renderThinText("HOLLER AT THE BANDITS", 74, 540, calera),
    renderBrand(calera),
  ]);

  return toShareImageResponse(
    <TextCard brand={brand}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={title.src} width={title.width} height={title.height} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {CHANNELS.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 18, letterSpacing: 2, color: ORANGE }}>{label}</div>
              <div style={{ fontSize: 24, color: "#fff" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </TextCard>
  );
}
