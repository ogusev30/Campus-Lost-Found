import type { Item } from "@/lib/types/database.types";
import { LostFoundToggle } from "@/components/report/LostFoundToggle";
import { ImageUploadField } from "@/components/report/ImageUploadField";
import type { Dictionary } from "@/lib/i18n/dictionary";

const fieldClasses =
  "rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:border-brick";
const labelClasses = "font-display text-sm font-semibold text-ink";

export function ItemFormFields({
  defaults,
  dict,
  categories,
  itemType,
  errors,
}: {
  defaults?: Partial<Item>;
  dict: Dictionary["report"];
  categories: Dictionary["categories"];
  itemType: Dictionary["itemType"];
  errors: Dictionary["errors"];
}) {
  return (
    <div className="flex flex-col gap-5">
      <LostFoundToggle
        defaultValue={defaults?.type ?? "lost"}
        label={dict.lostFoundLabel}
        itemType={itemType}
      />

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>{dict.titleLabel}</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder={dict.titlePlaceholder}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>{dict.descriptionLabel}</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          placeholder={dict.descriptionPlaceholder}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>{dict.categoryLabel}</span>
        <select
          name="category"
          required
          defaultValue={defaults?.category ?? ""}
          className={fieldClasses}
        >
          <option value="" disabled>
            {dict.categoryPlaceholder}
          </option>
          {Object.entries(categories).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>
          {defaults?.type === "found" || !defaults ? dict.dateFoundLabel : dict.dateLostLabel}
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
        <span className={labelClasses}>{dict.locationLabel}</span>
        <input
          type="text"
          name="location"
          required
          defaultValue={defaults?.location}
          placeholder={dict.locationPlaceholder}
          className={fieldClasses}
        />
      </label>

      <ImageUploadField defaultPreviewUrl={defaults?.image_url} dict={dict} errors={errors} />
    </div>
  );
}
