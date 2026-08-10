import { z } from "zod";
import { CATEGORIES } from "@/lib/types/database.types";

export const itemFieldsSchema = z.object({
  type: z.enum(["lost", "found"], { message: "Choose Lost or Found." }),
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  category: z.enum(CATEGORIES, { message: "Choose a category." }),
  item_date: z.string().trim().min(1, "Date is required."),
  location: z.string().trim().min(1, "Location is required.").max(200),
});

export type ItemFields = z.infer<typeof itemFieldsSchema>;

export function parseItemFields(formData: FormData) {
  return itemFieldsSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    item_date: formData.get("item_date"),
    location: formData.get("location"),
  });
}
