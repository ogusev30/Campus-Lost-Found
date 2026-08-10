"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseItemFields } from "@/lib/validation/itemSchema";
import { validateImageFile } from "@/lib/validation/imageValidation";
import { getDictionary } from "@/lib/i18n/locale";
import { computeMatchesForItem } from "@/lib/matching/findMatches";
import { syncAchievementUnlocks } from "@/lib/achievements/notify";
import type { Item } from "@/lib/types/database.types";

export interface ItemFormState {
  error: string | null;
  success: boolean;
}

async function uploadItemImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  imageFile: File,
) {
  const ext = imageFile.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("item-images")
    .upload(path, imageFile, { contentType: imageFile.type });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("item-images").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function createItem(
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const supabase = await createClient();
  const { dict } = await getDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: dict.errors.mustBeLoggedIn, success: false };

  const parsed = parseItemFields(formData, dict.errors);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? dict.errors.pleaseCheckForm,
      success: false,
    };
  }

  const imageFile = formData.get("image") as File | null;
  const hasImage = !!imageFile && imageFile.size > 0;

  // A photo is only required for "found" items — if you lost something you
  // may not have a picture of it, but reporting one you found should be
  // identifiable to whoever it belongs to.
  if (parsed.data.type === "found" && !hasImage) {
    return { error: dict.errors.imageRequired, success: false };
  }

  let uploaded: { path: string; publicUrl: string } | null = null;
  if (hasImage) {
    const imageError = validateImageFile(imageFile, dict.errors);
    if (imageError) return { error: imageError, success: false };

    try {
      uploaded = await uploadItemImage(supabase, user.id, imageFile as File);
    } catch (err) {
      return { error: (err as Error).message, success: false };
    }
  }

  const { data: newItem, error: insertError } = await supabase
    .from("items")
    .insert({
      owner_id: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      location: parsed.data.location,
      item_date: parsed.data.item_date,
      image_url: uploaded?.publicUrl ?? null,
    })
    .select()
    .single();

  if (insertError || !newItem) {
    if (uploaded) await supabase.storage.from("item-images").remove([uploaded.path]);
    return { error: insertError?.message ?? dict.errors.pleaseCheckForm, success: false };
  }

  await computeMatchesForItem(supabase, newItem as Item);
  await syncAchievementUnlocks(supabase, user.id);

  revalidatePath("/my-listings");
  return { error: null, success: true };
}

export async function updateItem(
  itemId: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const supabase = await createClient();
  const { dict } = await getDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: dict.errors.mustBeLoggedIn, success: false };

  const parsed = parseItemFields(formData, dict.errors);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? dict.errors.pleaseCheckForm,
      success: false,
    };
  }

  const updates: Record<string, unknown> = {
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    location: parsed.data.location,
    item_date: parsed.data.item_date,
  };

  const imageFile = formData.get("image") as File | null;
  const hasNewImage = !!imageFile && imageFile.size > 0;

  if (hasNewImage) {
    const imageError = validateImageFile(imageFile, dict.errors);
    if (imageError) return { error: imageError, success: false };

    try {
      const uploaded = await uploadItemImage(supabase, user.id, imageFile as File);
      updates.image_url = uploaded.publicUrl;
    } catch (err) {
      return { error: (err as Error).message, success: false };
    }
  } else if (parsed.data.type === "found") {
    // Switched to "found" (or stayed "found") without adding a new photo —
    // make sure it isn't left with no photo at all.
    const { data: existing } = await supabase
      .from("items")
      .select("image_url")
      .eq("id", itemId)
      .single();
    if (!existing?.image_url) {
      return { error: dict.errors.imageRequired, success: false };
    }
  }

  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", itemId)
    .select("id");

  if (error) return { error: error.message, success: false };
  if (!data || data.length === 0) {
    return { error: dict.errors.notAuthorizedEdit, success: false };
  }

  revalidatePath("/my-listings");
  return { error: null, success: true };
}

export async function closeItem(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { dict } = await getDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("items")
    .update({ status: "closed" })
    .eq("id", itemId)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: dict.errors.notAuthorized };

  revalidatePath("/my-listings");
  return { error: null };
}

export async function deleteItem(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { dict } = await getDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: dict.errors.deleteHasClaims };
  }

  revalidatePath("/my-listings");
  return { error: null };
}

export async function markReturned(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { dict } = await getDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("type, status, owner_id, title")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) return { error: dict.errors.listingNotFound };
  if (item.owner_id !== user.id) return { error: dict.errors.notAuthorized };

  const allowed =
    (item.type === "lost" && item.status === "open") ||
    (item.type === "found" && item.status === "claimed");

  if (!allowed) {
    return {
      error:
        item.type === "found"
          ? dict.errors.returnFoundNeedsClaim
          : dict.errors.returnNotAllowed,
    };
  }

  const { error } = await supabase
    .from("items")
    .update({ status: "returned" })
    .eq("id", itemId);

  if (error) return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "item_returned",
    payload: { itemId, itemTitle: item.title },
    link: "/my-listings",
  });
  await syncAchievementUnlocks(supabase, user.id);

  revalidatePath("/my-listings");
  return { error: null };
}
