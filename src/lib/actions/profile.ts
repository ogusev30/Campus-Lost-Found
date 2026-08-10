"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfileName(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/my-listings");

  if (!name) {
    return { error: "Please enter your full name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email!, name }, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}
