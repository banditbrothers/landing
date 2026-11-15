// One-off: builds public/og-default.jpg, the share image for every page without its own opengraph-image.
// Run `node scripts/generate-og-image.mjs` after changing the logo, tagline or mugshots, and commit the result.
import { readFile, writeFile } from "fs/promises";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const W = 1200;
const H = 630;
const PHOTO_H = 400;
const MUGSHOTS = ["mugshot-1", "mugshot-2", "mugshot-3", "mugshot-balaclava"];
const TILE_W = W / MUGSHOTS.length;
const LOGO_H = 190;

const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;
const el = (type, style, children) => ({ type, props: { style, children } });
const img = (src, width, height) => ({ type: "img", props: { src, width, height } });

const calera = await readFile("src/fonts/calera-display-regular-400.otf");
const mugshots = await Promise.all(
  MUGSHOTS.map(async name =>
    dataUri(
      await sharp(`public/how-to-wear/${name}.webp`)
        // no per-photo crop or zoom: all four share one backdrop, so the wall lines only meet at identical framing
        .resize(TILE_W, PHOTO_H, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer(),
      "image/jpeg"
    )
  )
);
const logoPng = await sharp("public/logo-full.svg").resize({ height: LOGO_H * 2 }).png().toBuffer({ resolveWithObject: true });
const logoW = Math.round(logoPng.info.width / 2);

const card = el(
  "div",
  { width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "Calera" },
  [
    el("div", { display: "flex", height: PHOTO_H }, mugshots.map(src => img(src, TILE_W, PHOTO_H))),
    el("div", { height: 6, background: "#fd6e00" }),
    el(
      "div",
      {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 56px 0 36px",
        backgroundImage: "radial-gradient(circle at 100% 100%, rgba(253,110,0,0.28), transparent 55%)",
      },
      [
        img(dataUri(logoPng.data, "image/png"), logoW, LOGO_H),
        el("div", { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }, [
          el("div", { fontSize: 58, color: "#fff", letterSpacing: 2 }, "WEAR YOUR MISCHIEF"),
          el("div", { fontSize: 25, color: "#a3a3a3", letterSpacing: 3 }, "BANDANAS  /  BALACLAVAS  /  JERSEYS"),
          el("div", { fontSize: 25, color: "#fd6e00", letterSpacing: 2 }, "banditbrothers.in"),
        ]),
      ]
    ),
  ]
);

const png = new ImageResponse(card, {
  width: W,
  height: H,
  fonts: [{ name: "Calera", data: calera, style: "normal", weight: 400 }],
});
const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
await writeFile("public/og-default.jpg", jpeg);
console.log(`public/og-default.jpg ${(jpeg.length / 1024).toFixed(0)}KB`);
