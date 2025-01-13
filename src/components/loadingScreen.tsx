import { LoaderPinwheelIcon } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderPinwheelIcon className="animate-spin" />
    </div>
  );
}
