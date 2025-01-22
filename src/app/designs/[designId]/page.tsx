import { LoadingIcon } from "@/components/misc/loadingScreen";
import { Suspense } from "react";

export default function DesignPage() {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <div>Design Page</div>
    </Suspense>
  );
}
