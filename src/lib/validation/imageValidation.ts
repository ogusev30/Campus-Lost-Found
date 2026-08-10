import type { Dictionary } from "@/lib/i18n/dictionary";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(
  file: File | null,
  errors: Dictionary["errors"],
): string | null {
  if (!file || file.size === 0) {
    return errors.imageRequired;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return errors.imageType;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return errors.imageSize;
  }
  return null;
}
