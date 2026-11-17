import "server-only";
import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// Shared by the opengraph-image.tsx routes. Link previews (WhatsApp especially) want a ~1200x630 JPEG under ~300KB;
// our mockups are multi-MB WebP, which next/og can't even decode. So: sharp converts the mockup, next/og lays out
// the card, sharp re-encodes the PNG result as JPEG.
export const shareImageSize = { width: 1200, height: 630 };
export const shareImageContentType = "image/jpeg";

export const ORANGE = "#fd6e00";
export const GREY = "#a3a3a3";

const PHOTO = shareImageSize.height; // square photo on the left, full height

export const loadCalera = () => readFile(join(process.cwd(), "src/fonts/calera-display-regular-400.otf"));

/** Remote URL, or a path under public/ ("/how-to-wear/x.webp"), as a cover-cropped JPEG data URI. null on failure. */
export const toJpegDataUri = async (src: string, width = PHOTO, height = PHOTO) => {
  try {
    let input: Buffer;
    if (src.startsWith("/")) input = await readFile(join(process.cwd(), "public", src));
    else {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
      input = Buffer.from(await res.arrayBuffer());
    }
    const jpeg = await sharp(input).rotate().resize(width, height, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (error) {
    console.error("Share image: could not load photo", error);
    return null; // card still renders, just without the photo
  }
};

/** Lays out the card with next/og, then re-encodes it as a small JPEG. */
export const toShareImageResponse = async (element: React.ReactElement, calera: Buffer) => {
  const png = new ImageResponse(element, {
    ...shareImageSize,
    fonts: [{ name: "Calera", data: calera, style: "normal", weight: 400 }],
  });
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": shareImageContentType } });
};

// Calera has a single, very heavy weight: at title size the holes in B, D, O, A nearly close up, and CSS can't
// make it lighter (text-stroke only paints outside the glyph in next/og). So thin it as an image: render the
// text at 2x, erode the glyph mask (blur, then raise the alpha cut-off), trim, and scale back down.
const THIN_SCALE = 2;

export const renderThinText = async (text: string, fontSize: number, maxWidth: number, calera: Buffer) => {
  const width = maxWidth * THIN_SCALE;
  const height = Math.ceil(fontSize * 1.1 * 4) * THIN_SCALE; // room for up to 4 lines; trimmed below
  const layer = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          fontFamily: "Calera",
          fontSize: fontSize * THIN_SCALE,
          lineHeight: 1.1,
          color: "#fff",
        }}>
        {text}
      </div>
    ),
    { width, height, fonts: [{ name: "Calera", data: calera, style: "normal", weight: 400 }] }
  );

  const alpha = await sharp(Buffer.from(await layer.arrayBuffer())).extractChannel(3).png().toBuffer();
  const blurred = await sharp(alpha)
    .blur(fontSize * THIN_SCALE * 0.035)
    .png()
    .toBuffer();
  // Blurred alpha 175 -> 0 and 215 -> 255: everything near an edge drops out, so strokes thin and counters open
  const mask = await sharp(blurred)
    .linear(255 / 40, -(255 / 40) * 175)
    .png()
    .toBuffer();
  const white = await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .joinChannel(mask)
    .png()
    .toBuffer();
  const trimmed = await sharp(white).trim().png().toBuffer({ resolveWithObject: true });

  const w = Math.round(trimmed.info.width / THIN_SCALE);
  const h = Math.round(trimmed.info.height / THIN_SCALE);
  const png = await sharp(trimmed.data).resize(w, h).png().toBuffer();
  return { src: `data:image/png;base64,${png.toString("base64")}`, width: w, height: h };
};

const TEXT_COLUMN = shareImageSize.width - PHOTO - 2 * 56; // right column minus its padding

export const renderShareImage = async ({
  imageUrl,
  eyebrow,
  title,
}: {
  imageUrl?: string;
  eyebrow: string;
  title: string;
}) => {
  const calera = await loadCalera();
  const [photo, titleImage] = await Promise.all([
    imageUrl ? toJpegDataUri(imageUrl) : null,
    renderThinText(title.toUpperCase(), title.length > 22 ? 60 : 72, TEXT_COLUMN, calera),
  ]);

  return toShareImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "Calera",
        }}>
        {photo && <img src={photo} width={PHOTO} height={PHOTO} style={{ objectFit: "cover" }} alt="" />}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 56px 48px",
            backgroundImage: "radial-gradient(circle at 100% 0%, rgba(253,110,0,0.22), transparent 60%)",
          }}>
          <div style={{ fontSize: 40, color: ORANGE }}>BANDIT BROTHERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 26, letterSpacing: 4, color: GREY, textTransform: "uppercase" }}>{eyebrow}</div>
            <img src={titleImage.src} width={titleImage.width} height={titleImage.height} alt="" />
          </div>
          <div style={{ fontSize: 26, color: GREY }}>banditbrothers.in</div>
        </div>
      </div>
    ),
    calera
  );
};

const WALL_GAP = 42;

/** Text-only card: brand at the top, children in the middle, domain at the bottom, on a faint lineup wall. */
export const TextCard = ({ children, footer = "banditbrothers.in" }: { children: React.ReactNode; footer?: string }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      background: "#0a0a0a",
      backgroundImage: "radial-gradient(circle at 100% 100%, rgba(253,110,0,0.28), transparent 55%)",
      color: "#fff",
      fontFamily: "Calera",
    }}>
    {Array.from({ length: Math.floor(shareImageSize.height / WALL_GAP) }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: (i + 1) * WALL_GAP,
          height: i % 2 ? 1 : 2,
          background: `rgba(255,255,255,${i % 2 ? 0.04 : 0.07})`,
        }}
      />
    ))}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: ORANGE }} />
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px 48px",
      }}>
      <div style={{ fontSize: 36, color: ORANGE }}>BANDIT BROTHERS</div>
      {children}
      <div style={{ fontSize: 24, color: GREY, letterSpacing: 2 }}>{footer}</div>
    </div>
  </div>
);

/** Text-only card with one big title, for pages with nothing to picture (policies). */
export const renderTitleCard = async ({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) => {
  const calera = await loadCalera();
  const titleImage = await renderThinText(title.toUpperCase(), 104, 1000, calera);
  return toShareImageResponse(
    <TextCard footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 26, letterSpacing: 4, color: GREY }}>{eyebrow.toUpperCase()}</div>
        <img src={titleImage.src} width={titleImage.width} height={titleImage.height} alt="" />
      </div>
    </TextCard>,
    calera
  );
};
