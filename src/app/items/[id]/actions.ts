"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitClaim(
  itemId: string,
  message: string,
): Promise<{ error: string | null }> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { error: "Proof of ownership is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/items/${itemId}`);

  const { error } = await supabase
    .from("claims")
    .insert({ item_id: itemId, claimant_id: user.id, message: trimmed });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already sent a claim for this item." };
    }
    return {
      error:
        "Couldn't send this claim. It may no longer be open, or it may be your own listing.",
    };
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/sent-claims");
  return { error: null };
}
