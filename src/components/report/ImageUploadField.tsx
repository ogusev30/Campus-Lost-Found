"use client";

import { useState, type ChangeEvent } from "react";
import { validateImageFile } from "@/lib/validation/imageValidation";

export function ImageUploadField({
  defaultPreviewUrl,
  required = !defaultPreviewUrl,
}: {
  defaultPreviewUrl?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(defaultPreviewUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

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

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-sm font-semibold text-ink">
        Upload Photo
      </span>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-flyer border-2 border-dashed border-ink/40 bg-paper-dark px-4 py-6 text-center transition-colors hover:border-brick">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Item preview"
            className="max-h-48 rounded-flyer object-contain"
          />
        ) : (
          <>
            <span className="font-display text-sm font-semibold text-ink">
              Drag &amp; drop an image, or click to browse
            </span>
            <span className="text-xs text-ink-faint">JPG, JPEG, PNG up to 5MB</span>
          </>
        )}
        <input
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
