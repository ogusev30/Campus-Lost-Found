import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { ClaimStatusLabel } from "@/components/claims/ClaimStatusLabel";
import { OwnerContact } from "@/components/claims/OwnerContact";
import { formatItemDate } from "@/lib/utils";
import type { Claim, Item } from "@/lib/types/database.types";

export const metadata = {
  title: "Sent Claims — Campus Lost & Found",
};

export default async function SentClaimsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: claimRows } = await supabase
    .from("claims")
    .select("*")
    .eq("claimant_id", user.id)
    .order("created_at", { ascending: false });

  const claims = (claimRows ?? []) as Claim[];
  const itemIds = [...new Set(claims.map((c) => c.item_id))];

  const itemsById = new Map<string, Item>();
  const ownerContactByItemId = new Map<
    string,
    { owner_name: string | null; owner_email: string }
  >();

  if (itemIds.length > 0) {
    const { data: itemRows } = await supabase
      .from("items")
      .select("*")
      .in("id", itemIds);
    for (const item of (itemRows ?? []) as Item[]) {
      itemsById.set(item.id, item);
    }
  }

  await Promise.all(
    claims
      .filter((c) => c.status === "accepted")
      .map(async (c) => {
        const { data } = await supabase.rpc("get_owner_contact", {
          p_item_id: c.item_id,
        });
        if (data?.[0]) ownerContactByItemId.set(c.item_id, data[0]);
      }),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <span className="mb-2 inline-block rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
          my claims
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">Sent Claims</h1>
      </div>

      {claims.length === 0 ? (
        <p className="rounded-flyer border-2 border-dashed border-ink/20 p-8 text-center text-ink-faint">
          You haven&apos;t sent any claims yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {claims.map((claim) => {
            const item = itemsById.get(claim.item_id);
            const ownerContact = ownerContactByItemId.get(claim.item_id);

            return (
              <FlyerCard key={claim.id} id={claim.id}>
                <div className="flex gap-4">
                  {item && (
                    <ItemThumbnail src={item.image_url} alt={item.title} className="h-24 w-24" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      {item ? (
                        <Link
                          href={`/items/${item.id}`}
                          className="font-display font-bold text-ink hover:text-brick"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-display font-bold text-ink">
                          Item no longer available
                        </span>
                      )}
                      <ClaimStatusLabel status={claim.status} />
                    </div>
                    {item && (
                      <p className="text-sm text-ink-faint">
                        {item.location} · {formatItemDate(item.item_date)}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-3 rounded-flyer border-2 border-ink/10 bg-paper-dark p-3 text-sm text-ink-faint">
                  &ldquo;{claim.message}&rdquo;
                </p>

                {claim.status === "accepted" && ownerContact && (
                  <div className="mt-3">
                    <OwnerContact
                      ownerName={ownerContact.owner_name}
                      ownerEmail={ownerContact.owner_email}
                    />
                  </div>
                )}
              </FlyerCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
