import React from "react";
import { DropzoneProps, useDropzone } from "react-dropzone";
import { CameraIcon } from "lucide-react";
import { LoadingIcon } from "@/components/misc/Loading";

export function FileDropzone({ loading, onDrop }: DropzoneProps & { loading: boolean }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-[22px] border-2 border-dashed bg-card min-h-[200px] p-8 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-center hover:border-bandit-orange ${
        isDragActive ? "border-bandit-orange" : "border-border"
      }`}>
      <input {...getInputProps()} disabled={loading} />
      {loading ? (
        <LoadingIcon className="w-9 h-9 text-bandit-orange" />
      ) : (
        <CameraIcon strokeWidth={1.6} className="w-9 h-9 text-bandit-orange" />
      )}
      <p className="text-sm font-medium">{isDragActive ? "Drop it here" : "Drop a photo or tap to upload"}</p>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
    </div>
  );
}
