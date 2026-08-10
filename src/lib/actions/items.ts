"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseItemFields } from "@/lib/validation/itemSchema";
import { validateImageFile } from "@/lib/validation/imageValidation";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in.", success: false };

  const parsed = parseItemFields(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
      success: false,
    };
  }

  const imageFile = formData.get("image") as File | null;
  const imageError = validateImageFile(imageFile);
  if (imageError) return { error: imageError, success: false };

  let uploaded: { path: string; publicUrl: string };
  try {
    uploaded = await uploadItemImage(supabase, user.id, imageFile as File);
  } catch (err) {
    return { error: (err as Error).message, success: false };
  }

  const { error: insertError } = await supabase.from("items").insert({
    owner_id: user.id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    location: parsed.data.location,
    item_date: parsed.data.item_date,
    image_url: uploaded.publicUrl,
  });

  if (insertError) {
    await supabase.storage.from("item-images").remove([uploaded.path]);
    return { error: insertError.message, success: false };
  }

  revalidatePath("/my-listings");
  return { error: null, success: true };
}

export async function updateItem(
  itemId: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in.", success: false };

  const parsed = parseItemFields(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
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
  if (imageFile && imageFile.size > 0) {
    const imageError = validateImageFile(imageFile);
    if (imageError) return { error: imageError, success: false };

    try {
      const uploaded = await uploadItemImage(supabase, user.id, imageFile);
      updates.image_url = uploaded.publicUrl;
    } catch (err) {
      return { error: (err as Error).message, success: false };
    }
  }

  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", itemId)
    .select("id");

  if (error) return { error: error.message, success: false };
  if (!data || data.length === 0) {
    return { error: "Not authorized to edit this listing.", success: false };
  }

  revalidatePath("/my-listings");
  return { error: null, success: true };
}

export async function closeItem(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
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
  if (!data || data.length === 0) return { error: "Not authorized." };

  revalidatePath("/my-listings");
  return { error: null };
}

export async function deleteItem(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
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
    return {
      error: "This listing has claims and can't be deleted — close it instead.",
    };
  }

  revalidatePath("/my-listings");
  return { error: null };
}

export async function markReturned(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("type, status, owner_id")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) return { error: "Listing not found." };
  if (item.owner_id !== user.id) return { error: "Not authorized." };

  const allowed =
    (item.type === "lost" && item.status === "open") ||
    (item.type === "found" && item.status === "claimed");

  if (!allowed) {
    return {
      error:
        item.type === "found"
          ? "This item must be claimed before it can be marked as returned."
          : "This item can't be marked as returned right now.",
    };
  }

  const { error } = await supabase
    .from("items")
    .update({ status: "returned" })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/my-listings");
  return { error: null };
}
