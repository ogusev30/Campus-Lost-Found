import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { StampBadge } from "@/components/ui/StampBadge";
import { Button } from "@/components/ui/Button";
import { OwnerContact } from "@/components/claims/OwnerContact";
import { ClaimStatusLabel } from "@/components/claims/ClaimStatusLabel";
import { formatItemDate } from "@/lib/utils";
import { ClaimForm } from "@/app/items/[id]/ClaimForm";
import type { Claim, Item } from "@/lib/types/database.types";

type Params = Promise<{ id: string }>;

export default async function ItemDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .maybeSingle<Item>();

  if (!item) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const user = currentUser?.user ?? null;
  const isOwnItem = user?.id === item.owner_id;

  const { data: existingClaim } = user
    ? await supabase
        .from("claims")
        .select("*")
        .eq("item_id", item.id)
        .eq("claimant_id", user.id)
        .maybeSingle<Claim>()
    : { data: null };

  let ownerContact: { owner_name: string | null; owner_email: string } | null = null;
  if (existingClaim?.status === "accepted") {
    const { data } = await supabase.rpc("get_owner_contact", { p_item_id: item.id });
    ownerContact = data?.[0] ?? null;
  }

  const canSendNewClaim =
    item.type === "found" && item.status === "open" && !isOwnItem && !existingClaim;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <FlyerCard id={item.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.title}
          className="max-h-96 w-full rounded-flyer border-2 border-ink/10 object-cover"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-stamp text-xs uppercase tracking-wide text-ink-faint">
            {item.type}
          </span>
          <StampBadge status={item.status} />
        </div>

        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{item.title}</h1>
        <p className="mt-2 text-ink-faint">{item.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-flyer border-2 border-dashed border-ink/15 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-faint">Category</dt>
            <dd className="font-semibold text-ink">{item.category}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Location</dt>
            <dd className="font-semibold text-ink">{item.location}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Item Date</dt>
            <dd className="font-semibold text-ink">{formatItemDate(item.item_date)}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Posted</dt>
            <dd className="font-semibold text-ink">
              {formatItemDate(item.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
      </FlyerCard>

      <div className="rounded-flyer border-2 border-ink/20 bg-paper-dark p-5">
        {item.type === "lost" && (
          <p className="text-sm text-ink-faint">
            This is a lost item report — claims aren&apos;t applicable here.
          </p>
        )}

        {item.type === "found" && item.status !== "open" && !existingClaim && (
          <p className="text-sm text-ink-faint">
            This item is {item.status} and isn&apos;t accepting new claims.
          </p>
        )}

        {item.type === "found" && isOwnItem && (
          <p className="text-sm text-ink-faint">
            You can&apos;t send a claim on your own listing.
          </p>
        )}

        {item.type === "found" && !user && item.status === "open" && !isOwnItem && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-ink-faint">Log in to send a claim for this item.</p>
            <Button href={`/login?next=/items/${item.id}`} variant="primary">
              Log in
            </Button>
          </div>
        )}

        {existingClaim && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-ink">
                Your claim:
              </span>
              <ClaimStatusLabel status={existingClaim.status} />
            </div>
            <p className="rounded-flyer border-2 border-ink/10 bg-paper p-3 text-sm text-ink-faint">
              &ldquo;{existingClaim.message}&rdquo;
            </p>
            {existingClaim.status === "accepted" && ownerContact && (
              <OwnerContact
                ownerName={ownerContact.owner_name}
                ownerEmail={ownerContact.owner_email}
              />
            )}
          </div>
        )}

        {canSendNewClaim && <ClaimForm itemId={item.id} />}
      </div>
    </div>
  );
}
