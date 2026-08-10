import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/my-listings/ListingCard";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/locale";
import type { Item, OwnerClaimView } from "@/lib/types/database.types";

export default async function MyListingsPage() {
  const { user } = await requireUserWithProfile();
  const supabase = await createClient();
  const { dict } = await getDictionary();

  const [{ data: items }, { data: claims }] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_owner_claims"),
  ]);

  const claimsByItem = new Map<string, OwnerClaimView[]>();
  for (const claim of (claims ?? []) as OwnerClaimView[]) {
    const list = claimsByItem.get(claim.item_id) ?? [];
    list.push(claim);
    claimsByItem.set(claim.item_id, list);
  }

  const listings = (items ?? []) as Item[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-2 inline-block rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
            {dict.myListings.badge}
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            {dict.myListings.heading}
          </h1>
        </div>
        <Button href="/report" variant="primary">
          {dict.myListings.newItemCta}
        </Button>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-flyer border-2 border-dashed border-ink/20 p-8 text-center text-ink-faint">
          {dict.myListings.empty}
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {listings.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              claims={claimsByItem.get(item.id) ?? []}
              dict={dict}
            />
          ))}
        </div>
      )}
    </div>
  );
}
