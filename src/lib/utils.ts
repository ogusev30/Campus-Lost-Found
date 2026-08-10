/** Deterministic small tilt for flyer cards, derived from a stable id so it never
 * shifts between server and client render (avoids hydration mismatches). */
export function tiltForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const angles = [-2, -1.2, 1.2, 2];
  return angles[Math.abs(hash) % angles.length];
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Fills `{token}` placeholders in a dictionary string, e.g. formatMessage("Hi {name}", { name: "Sevim" }). */
export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

/** Formats a plain "YYYY-MM-DD" date string without shifting a day due to timezone parsing. */
export function formatItemDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
