import { LoaderPinwheelIcon } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingIcon />
    </div>
  );
}

export function LoadingIcon() {
  return <LoaderPinwheelIcon className="animate-spin" />;
}
