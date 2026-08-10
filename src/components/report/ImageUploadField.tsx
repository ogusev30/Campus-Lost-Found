"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { validateImageFile } from "@/lib/validation/imageValidation";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  defaultPreviewUrl,
  required = !defaultPreviewUrl,
}: {
  defaultPreviewUrl?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(defaultPreviewUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function processFile(file: File | null) {
    if (!file) {
      setPreview(defaultPreviewUrl ?? null);
      setError(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(defaultPreviewUrl ?? null);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    processFile(event.target.files?.[0] ?? null);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file || !inputRef.current) return;

    // Assign the dropped file to the real file input so it's included in
    // the form's FormData on submit, same as a manual file-picker choice.
    inputRef.current.files = event.dataTransfer.files;
    processFile(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-sm font-semibold text-ink">
        Upload Photo
      </span>

      <label
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-flyer border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragging
            ? "border-brick bg-mustard/20"
            : "border-ink/40 bg-paper-dark hover:border-brick",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Item preview"
            className="pointer-events-none max-h-48 rounded-flyer object-contain"
          />
        ) : (
          <>
            <span className="pointer-events-none font-display text-sm font-semibold text-ink">
              {isDragging
                ? "Drop the image here"
                : "Drag & drop an image, or click to browse"}
            </span>
            <span className="pointer-events-none text-xs text-ink-faint">
              JPG, JPEG, PNG up to 5MB
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleChange}
          required={required}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
