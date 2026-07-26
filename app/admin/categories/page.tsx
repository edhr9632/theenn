"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import {
  createId,
  DEFAULT_NEWS_CATEGORIES,
  readCategories,
  slugifyCategory,
  writeCategories,
  type NewsCategory,
  type NewsSubCategory,
} from "@/lib/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catSlugTouched, setCatSlugTouched] = useState(false);
  const [catDescription, setCatDescription] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subSlugTouched, setSubSlugTouched] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loaded = readCategories();
    setCategories(loaded);
    setSelectedId(loaded[0]?.id ?? "");
    setReady(true);
  }, []);

  const persist = (next: NewsCategory[]) => {
    setCategories(next);
    writeCategories(next);
  };

  const selected = useMemo(
    () => categories.find((item) => item.id === selectedId) ?? null,
    [categories, selectedId],
  );

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatSlugTouched(false);
    setCatDescription("");
  };

  const resetSubForm = () => {
    setEditingSubId(null);
    setSubName("");
    setSubSlug("");
    setSubSlugTouched(false);
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const onSubmitCategory = (e: FormEvent) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;
    const slug = (catSlug || slugifyCategory(name)).trim();

    if (editingCatId) {
      persist(
        categories.map((item) =>
          item.id === editingCatId
            ? { ...item, name, slug, description: catDescription.trim() || undefined }
            : item,
        ),
      );
      flash("Category updated");
    } else {
      const next: NewsCategory = {
        id: createId("cat"),
        name,
        slug,
        description: catDescription.trim() || undefined,
        subcategories: [],
      };
      const updated = [...categories, next];
      persist(updated);
      setSelectedId(next.id);
      flash("Category created");
    }
    resetCategoryForm();
  };

  const startEditCategory = (cat: NewsCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatSlugTouched(true);
    setCatDescription(cat.description ?? "");
    setSelectedId(cat.id);
  };

  const deleteCategory = (id: string) => {
    if (!window.confirm("Delete this category and all its subcategories?")) return;
    const updated = categories.filter((item) => item.id !== id);
    persist(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id ?? "");
    if (editingCatId === id) resetCategoryForm();
    flash("Category deleted");
  };

  const onSubmitSubcategory = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const name = subName.trim();
    if (!name) return;
    const slug = (subSlug || slugifyCategory(name)).trim();

    const nextSubs: NewsSubCategory[] = editingSubId
      ? selected.subcategories.map((sub) => (sub.id === editingSubId ? { ...sub, name, slug } : sub))
      : [...selected.subcategories, { id: createId("sub"), name, slug }];

    persist(
      categories.map((item) => (item.id === selected.id ? { ...item, subcategories: nextSubs } : item)),
    );
    flash(editingSubId ? "Subcategory updated" : "Subcategory created");
    resetSubForm();
  };

  const startEditSub = (sub: NewsSubCategory) => {
    setEditingSubId(sub.id);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubSlugTouched(true);
  };

  const deleteSub = (subId: string) => {
    if (!selected) return;
    if (!window.confirm("Delete this subcategory?")) return;
    persist(
      categories.map((item) =>
        item.id === selected.id
          ? { ...item, subcategories: item.subcategories.filter((sub) => sub.id !== subId) }
          : item,
      ),
    );
    if (editingSubId === subId) resetSubForm();
    flash("Subcategory deleted");
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset categories to the default ENN set?")) return;
    persist(DEFAULT_NEWS_CATEGORIES);
    setSelectedId(DEFAULT_NEWS_CATEGORIES[0]?.id ?? "");
    resetCategoryForm();
    resetSubForm();
    flash("Defaults restored");
  };

  if (!ready) {
    return <p className="admin-empty mb-0">Loading categories…</p>;
  }

  return (
    <div className="admin-form-page admin-form-page--wide">
      <AdminPageHeader
        title="Categories"
        description="Create categories and subcategories for news articles — used in the add/edit article form."
      />

      {message ? <p className="admin-inline-toast mb-3">{message}</p> : null}

      <div className="admin-category-layout">
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">
                {editingCatId ? "Edit category" : "Add category"}
              </h2>
              <p className="admin-form-card-sub mb-0">Parent topic shown on the public site and in article filters.</p>
            </div>
            <AdminBadge tone="orange">Saved locally</AdminBadge>
          </div>

          <form className="admin-form-grid" onSubmit={onSubmitCategory}>
            <label className="admin-field-label">
              Category name
              <input
                className="admin-field"
                value={catName}
                onChange={(e) => {
                  const next = e.target.value;
                  setCatName(next);
                  if (!catSlugTouched) setCatSlug(slugifyCategory(next));
                }}
                placeholder="e.g. Daily News"
                required
              />
            </label>
            <label className="admin-field-label">
              Slug
              <input
                className="admin-field"
                value={catSlug}
                onChange={(e) => {
                  setCatSlugTouched(true);
                  setCatSlug(slugifyCategory(e.target.value));
                }}
                placeholder="daily-news"
                required
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Description (optional)
              <input
                className="admin-field"
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Short note for editors"
              />
            </label>
            <div className="admin-form-footer-actions admin-field-span" style={{ justifyContent: "flex-start" }}>
              {editingCatId ? (
                <button type="button" className="btn admin-btn-ghost" onClick={resetCategoryForm}>
                  Cancel edit
                </button>
              ) : null}
              <button type="submit" className="btn admin-btn-primary">
                {editingCatId ? "Update category" : "Create category"}
              </button>
              <button type="button" className="btn admin-btn-ghost" onClick={resetDefaults}>
                Reset defaults
              </button>
            </div>
          </form>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">
                {editingSubId ? "Edit subcategory" : "Add subcategory"}
              </h2>
              <p className="admin-form-card-sub mb-0">
                {selected
                  ? `Under “${selected.name}” — pick a category from the list below first.`
                  : "Create a category first, then add subcategories."}
              </p>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={onSubmitSubcategory}>
            <label className="admin-field-label">
              Parent category
              <select
                className="admin-field"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  resetSubForm();
                }}
                required
              >
                {categories.length === 0 ? <option value="">No categories yet</option> : null}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field-label">
              Subcategory name
              <input
                className="admin-field"
                value={subName}
                onChange={(e) => {
                  const next = e.target.value;
                  setSubName(next);
                  if (!subSlugTouched) setSubSlug(slugifyCategory(next));
                }}
                placeholder="e.g. Policy"
                required
                disabled={!selected}
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Slug
              <input
                className="admin-field"
                value={subSlug}
                onChange={(e) => {
                  setSubSlugTouched(true);
                  setSubSlug(slugifyCategory(e.target.value));
                }}
                placeholder="policy"
                required
                disabled={!selected}
              />
            </label>
            <div className="admin-form-footer-actions admin-field-span" style={{ justifyContent: "flex-start" }}>
              {editingSubId ? (
                <button type="button" className="btn admin-btn-ghost" onClick={resetSubForm}>
                  Cancel edit
                </button>
              ) : null}
              <button type="submit" className="btn admin-btn-primary" disabled={!selected}>
                {editingSubId ? "Update subcategory" : "Create subcategory"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="admin-panel mt-4">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">All categories</h2>
          <AdminBadge tone="blue">{categories.length}</AdminBadge>
        </div>
        {categories.length === 0 ? (
          <AdminEmpty message="No categories yet. Create your first category above." />
        ) : (
          <AdminTable columns={["Category", "Slug", "Subcategories", "Actions"]}>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className={selectedId === cat.id ? "admin-row-selected" : undefined}
                onClick={() => setSelectedId(cat.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <p className="admin-cell-title mb-0">{cat.name}</p>
                  {cat.description ? <p className="admin-cell-sub mb-0">{cat.description}</p> : null}
                </td>
                <td>{cat.slug}</td>
                <td>
                  <AdminBadge tone="green">{cat.subcategories.length}</AdminBadge>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <AdminRowActions
                    onEdit={() => startEditCategory(cat)}
                    onDelete={() => deleteCategory(cat.id)}
                    deleteLabel="Delete category"
                  />
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <div className="admin-panel mt-4">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">
            Subcategories{selected ? ` — ${selected.name}` : ""}
          </h2>
          <AdminBadge tone="blue">{selected?.subcategories.length ?? 0}</AdminBadge>
        </div>
        {!selected ? (
          <AdminEmpty message="Select a category to manage its subcategories." />
        ) : selected.subcategories.length === 0 ? (
          <AdminEmpty message="No subcategories yet. Add one using the form above." />
        ) : (
          <AdminTable columns={["Subcategory", "Slug", "Actions"]}>
            {selected.subcategories.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <p className="admin-cell-title mb-0">{sub.name}</p>
                </td>
                <td>{sub.slug}</td>
                <td>
                  <AdminRowActions
                    onEdit={() => startEditSub(sub)}
                    onDelete={() => deleteSub(sub.id)}
                    deleteLabel="Delete subcategory"
                  />
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
