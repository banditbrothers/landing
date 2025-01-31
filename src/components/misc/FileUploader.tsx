import React from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";

export function FileDropzone({ loading, onDrop }: { loading: boolean; onDrop: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
      <input {...getInputProps()} disabled={loading} />
      {loading ? (
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
      ) : (
        <UploadCloud className="w-10 h-10 text-muted-foreground" />
      )}
      {isDragActive ? (
        <p className="text-sm text-muted-foreground text-center">Drop your image here</p>
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Drag and drop an image, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports: JPG, PNG, WEBP</p>
        </div>
      )}
    </div>
  );
}
