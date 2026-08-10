import type { Item } from "@/lib/types/database.types";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "with", "for", "to", "my", "i",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 1 && !STOPWORDS.has(word)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function locationScore(a: string, b: string): number {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.7;
  return jaccard(tokenize(na), tokenize(nb));
}

function dateScore(a: string, b: string): number {
  const diffDays = Math.abs(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 3) return 1;
  if (diffDays >= 14) return 0;
  return 1 - (diffDays - 3) / 11;
}

/** Weighted 0-100 similarity score between a lost item and a found item. */
export function scoreMatch(a: Item, b: Item): number {
  const categoryScore = a.category === b.category ? 1 : 0;
  const textScore = jaccard(
    tokenize(`${a.title} ${a.description}`),
    tokenize(`${b.title} ${b.description}`),
  );
  const locScore = locationScore(a.location, b.location);
  const dScore = dateScore(a.item_date, b.item_date);

  const total = categoryScore * 0.35 + textScore * 0.4 + locScore * 0.15 + dScore * 0.1;
  return Math.round(total * 100);
}
