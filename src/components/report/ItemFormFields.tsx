import { CATEGORIES } from "@/lib/types/database.types";
import type { Item } from "@/lib/types/database.types";
import { LostFoundToggle } from "@/components/report/LostFoundToggle";
import { ImageUploadField } from "@/components/report/ImageUploadField";

const fieldClasses =
  "rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:border-brick";
const labelClasses = "font-display text-sm font-semibold text-ink";

export function ItemFormFields({ defaults }: { defaults?: Partial<Item> }) {
  return (
    <div className="flex flex-col gap-5">
      <LostFoundToggle defaultValue={defaults?.type ?? "lost"} />

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Title</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="e.g. Brown Leather Wallet"
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Description</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          placeholder="Describe the item and where/when you found it..."
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Category</span>
        <select
          name="category"
          required
          defaultValue={defaults?.category ?? ""}
          className={fieldClasses}
        >
          <option value="" disabled>
            Select category
          </option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>
          {defaults?.type === "found" || !defaults ? "Date Found" : "Date Lost"}
        </span>
        <input
          type="date"
          name="item_date"
          required
          defaultValue={defaults?.item_date}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Location</span>
        <input
          type="text"
          name="location"
          required
          defaultValue={defaults?.location}
          placeholder="e.g. Library — 2nd Floor"
          className={fieldClasses}
        />
      </label>

      <ImageUploadField defaultPreviewUrl={defaults?.image_url} />
    </div>
  );
}
