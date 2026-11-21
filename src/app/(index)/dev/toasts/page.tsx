import { notFound } from "next/navigation";
import { isProduction } from "@/utils/misc";
import { ToastLab } from "./content";

export const metadata = { title: "Toast lab", robots: { index: false } };

/** Dev-only: every toast style one tap away, for visual checks. 404s in production. */
export default function Page() {
  if (isProduction) notFound();
  return <ToastLab />;
}
