export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File | null): string | null {
  if (!file || file.size === 0) {
    return "An item photo is required.";
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be a JPG, JPEG, or PNG file.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}
