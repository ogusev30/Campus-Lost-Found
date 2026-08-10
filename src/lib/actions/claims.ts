"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function acceptClaim(claimId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("accept_claim", { claim_id_input: claimId });
  if (error) return { error: error.message };

  revalidatePath("/my-listings");
  return { error: null };
}

export async function rejectClaim(claimId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("claims")
    .update({ status: "rejected" })
    .eq("id", claimId)
    .eq("status", "pending")
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Not authorized." };

  revalidatePath("/my-listings");
  return { error: null };
}
