import { z } from "zod";
import { CATEGORIES } from "@/lib/types/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

function buildItemFieldsSchema(errors: Dictionary["errors"]) {
  return z.object({
    type: z.enum(["lost", "found"], { message: errors.chooseLostFound }),
    title: z.string().trim().min(1, errors.titleRequired).max(120),
    description: z.string().trim().min(1, errors.descriptionRequired).max(2000),
    category: z.enum(CATEGORIES, { message: errors.chooseCategory }),
    item_date: z.string().trim().min(1, errors.dateRequired),
    location: z.string().trim().min(1, errors.locationRequired).max(200),
  });
}

export type ItemFields = z.infer<ReturnType<typeof buildItemFieldsSchema>>;

export function parseItemFields(formData: FormData, errors: Dictionary["errors"]) {
  return buildItemFieldsSchema(errors).safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    item_date: formData.get("item_date"),
    location: formData.get("location"),
  });
}
