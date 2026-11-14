import { getCatalog } from "@/lib/catalog";
import { ServerVariantsProvider } from "@/hooks/useVariants";
import { IndexClientLayout } from "./IndexClientLayout";

export default async function IndexLayout({ children }: { children: React.ReactNode }) {
  const variants = await getCatalog();

  return (
    <ServerVariantsProvider variants={variants}>
      <IndexClientLayout>{children}</IndexClientLayout>
    </ServerVariantsProvider>
  );
}
