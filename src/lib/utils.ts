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
