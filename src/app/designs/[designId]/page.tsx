import { ProductPageContents } from "@/components/pages/designs";
import { DESIGNS_OBJ } from "@/data/designs";
import { Metadata } from "next";
import React from "react";

type DesignPageProps = { params: Promise<{ designId: string }> };

export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const designId = (await params).designId;
  const design = DESIGNS_OBJ[designId];

  if (design) {
    return {
      title: design.name + " | " + "by Bandit Brothers",
      openGraph: { images: [design.image] },
      twitter: { images: [design.image] },
    };
  }
  return {};
}

export default function DesignPage({ params }: DesignPageProps) {
  const resolvedParams = React.use(params);

  return (
    <>
      <ProductPageContents designId={resolvedParams.designId} />
    </>
  );
}
