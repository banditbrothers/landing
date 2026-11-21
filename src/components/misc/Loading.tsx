import { LoaderPinwheelIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingIcon />
    </div>
  );
}

export function LoadingIcon({ className }: { className?: string }) {
  return <LoaderPinwheelIcon className={cn("animate-spin", className)} />;
}
