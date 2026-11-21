import { AlertCircle } from "lucide-react";

export const DangerBanner = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg shadow-sm">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
};
