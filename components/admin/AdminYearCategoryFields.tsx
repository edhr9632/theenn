"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EVENT_YEAR_OPTIONS,
  getDefaultEventCategory,
  getEventCategoriesForYear,
} from "@/lib/eventCategories";

type AdminYearCategoryFieldsProps = {
  /** Form field name for category (speakers/sponsors use "category", events use "tag") */
  categoryName?: string;
  defaultYear?: string | number;
  defaultCategory?: string;
  /** Show year + category side by side (default) or category only with hidden year */
  showYear?: boolean;
};

export default function AdminYearCategoryFields({
  categoryName = "category",
  defaultYear = 2026,
  defaultCategory,
  showYear = true,
}: AdminYearCategoryFieldsProps) {
  const initialYear = String(defaultYear);
  const [year, setYear] = useState(initialYear);
  const categories = useMemo(() => getEventCategoriesForYear(year), [year]);
  const [category, setCategory] = useState(
    defaultCategory && getEventCategoriesForYear(initialYear).includes(defaultCategory)
      ? defaultCategory
      : getDefaultEventCategory(initialYear),
  );

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] ?? "");
    }
  }, [categories, category]);

  return (
    <>
      {showYear ? (
        <label className="admin-field-label">
          Year
          <select
            className="admin-field"
            name="year"
            value={year}
            onChange={(event) => {
              const nextYear = event.target.value;
              setYear(nextYear);
              setCategory(getDefaultEventCategory(nextYear));
            }}
            required
          >
            {EVENT_YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="year" value={year} />
      )}

      <label className={`admin-field-label${showYear ? "" : " admin-field-span"}`}>
        Category
        <select
          className="admin-field"
          name={categoryName}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
