import { AlertCircle, Info } from "lucide-react";

export const DangerBanner = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg shadow-sm">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
};

export const InfoBanner = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-3 p-4 text-sm text-blue-900 bg-blue-50 border border-blue-400 rounded-lg shadow-sm dark:text-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40">
      <Info className="h-5 w-5 flex-shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
};
