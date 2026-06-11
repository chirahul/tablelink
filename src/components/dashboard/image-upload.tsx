"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/app/(dashboard)/admin-actions";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Fired when an upload starts (true) and finishes (false) so parents can block submit. */
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  aspectRatio?: "square" | "video" | "wide";
  size?: "sm" | "lg";
};

const ASPECT_CLASSES: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[3/2]",
};

export function ImageUpload({
  value,
  onChange,
  onUploadingChange,
  label = "Image",
  aspectRatio = "square",
  size = "sm",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(value);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const widthClass = size === "lg" ? "w-56" : "w-40";

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onUploadingChange?.(true);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      URL.revokeObjectURL(objectUrl);

      if (result.success && result.data) {
        setPreview(result.data.url);
        onChange(result.data.url);
        toast.success("Image uploaded");
      } else {
        setPreview(value);
        toast.error(result.success === false ? result.error : "Upload failed");
      }
      onUploadingChange?.(false);
    });
  }

  function clear() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {preview ? (
        <div className={cn("relative", widthClass)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className={cn(
              widthClass,
              ASPECT_CLASSES[aspectRatio],
              "object-cover rounded-lg border"
            )}
          />
          <button
            type="button"
            onClick={clear}
            disabled={isPending}
            className="absolute top-1 right-1 p-1 bg-background border rounded-full shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            widthClass,
            ASPECT_CLASSES[aspectRatio],
            "rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors",
            dragOver
              ? "border-primary bg-primary/5 text-primary"
              : "hover:border-foreground/40 hover:bg-accent"
          )}
        >
          <Upload className="w-5 h-5" />
          {isPending ? "Uploading..." : "Upload or drop image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Uploading..." : "Replace"}
        </Button>
      )}
    </div>
  );
}
