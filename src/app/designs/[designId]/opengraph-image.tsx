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

  if (!design) {
    return new ImageResponse(
      (
        <div>
          <h1>Design not found</h1>
        </div>
      )
    );
  }

  return new ImageResponse(<img src={design.image} alt={design.name} />);
}
