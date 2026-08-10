import { createClient } from "@/lib/supabase/server";
import { ItemCard } from "@/components/browse/ItemCard";
import { BrowseFilters } from "@/components/browse/BrowseFilters";
import type { Item, ItemType } from "@/lib/types/database.types";

export const metadata = {
  title: "Browse Items — Campus Lost & Found",
};

type SearchParams = Promise<{
  q?: string;
  type?: string;
  category?: string;
  location?: string;
  sort?: string;
}>;

// Items shown on the board — never returned/closed listings.
const BROWSE_VISIBLE_STATUSES = ["open", "claimed"];

// PostgREST's .or() filter uses "," to separate conditions and wraps values
// in parentheses, so strip characters that would break the filter string.
function sanitizeForOrFilter(value: string) {
  return value.replace(/[,()]/g, " ").trim();
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const type = params.type ?? "all";
  const category = params.category ?? "all";
  const location = params.location?.trim() ?? "";
  const sort = params.sort === "oldest" ? "oldest" : "newest";

  const supabase = await createClient();

  let query = supabase
    .from("items")
    .select("*")
    .in("status", BROWSE_VISIBLE_STATUSES);

  if (q) {
    const safeQ = sanitizeForOrFilter(q);
    query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }

  if (type === "lost" || type === "found") {
    query = query.eq("type", type satisfies ItemType);
  }

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  query = query.order("created_at", { ascending: sort === "oldest" });

  const { data: items, error } = await query.returns<Item[]>();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <span className="mb-2 inline-block -rotate-1 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
          the board
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">
          Browse Lost &amp; Found Items
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Search open listings from around campus.
        </p>
      </div>

      <BrowseFilters />

      {error && (
        <p className="rounded-flyer border-2 border-brick bg-paper px-4 py-3 text-sm text-brick">
          Couldn&apos;t load items: {error.message}
        </p>
      )}

      {!error && items && items.length === 0 && (
        <p className="rounded-flyer border-2 border-dashed border-ink/20 px-4 py-10 text-center text-sm text-ink-faint">
          No items match your search.
        </p>
      )}

      {!error && items && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
