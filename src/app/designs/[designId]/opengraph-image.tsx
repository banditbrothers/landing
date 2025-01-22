import { designs } from "@/data/designs";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Bandit Brothers";
export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: { params: { designId: string } }) {
  const design = designs.find(design => design.id === params.designId);

  //   const src = await fetch(new URL(design.image, import.meta.url)).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {design?.name || "Design not found"}
      </div>
    )
  );
}
