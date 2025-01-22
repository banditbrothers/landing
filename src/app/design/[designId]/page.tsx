import Footer from "@/components/footer";
import NavBar from "@/components/navbar";
import { ProductPageContents } from "@/components/product-page";
import { designs } from "@/data/designs";
import { notFound } from "next/navigation";
import React from "react";

export default function DesignPage({ params }: { params: Promise<{ designId: string }> }) {
  const resolvedParams = React.use(params);
  const design = designs.find(d => d.id === resolvedParams.designId);

  if (!design) notFound();

  return (
    <>
      <NavBar />
      <ProductPageContents design={design} />
      <Footer />
    </>
  );
}
