import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types/database.types";

export async function getRecentNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as Notification[];
}
