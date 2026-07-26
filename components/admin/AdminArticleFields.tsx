"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import AdminBlogEditor from "@/components/admin/AdminBlogEditor";
import { readCategories, type NewsCategory } from "@/lib/categories";

export type ArticleFormValues = {
  title?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  author?: string;
  excerpt?: string;
  image?: string;
  tags?: string;
  status?: string;
  publishDate?: string;
  content?: string;
  featuredVideo?: string;
};

type AdminArticleFieldsProps = {
  defaults?: ArticleFormValues;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminArticleFields({ defaults = {} }: AdminArticleFieldsProps) {
  const [title, setTitle] = useState(defaults.title ?? "");
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));
  const [featuredPreview, setFeaturedPreview] = useState(defaults.image ?? "");
  const [featuredVideo, setFeaturedVideo] = useState(defaults.featuredVideo ?? "");
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => {
    const loaded = readCategories();
    setCategories(loaded);

    const byName = loaded.find((cat) => cat.name === defaults.category || cat.slug === defaults.category);
    const initialCat = byName ?? loaded[0];
    setCategoryId(initialCat?.id ?? "");

    const bySub = initialCat?.subcategories.find(
      (sub) => sub.name === defaults.subcategory || sub.slug === defaults.subcategory,
    );
    setSubcategoryId(bySub?.id ?? initialCat?.subcategories[0]?.id ?? "");
  }, [defaults.category, defaults.subcategory]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const onFeaturedFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setFeaturedPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <label className="admin-field-label admin-field-span admin-article-title-field">
        Title
        <input
          className="admin-field admin-article-title-input"
          name="title"
          value={title}
          onChange={(e) => {
            const next = e.target.value;
            setTitle(next);
            if (!slugTouched) setSlug(slugify(next));
          }}
          placeholder="Add title"
          required
        />
      </label>

      <label className="admin-field-label">
        Permalink / slug
        <input
          className="admin-field"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="article-slug"
          required
        />
      </label>

      <label className="admin-field-label">
        Status
        <select className="admin-field" name="status" defaultValue={defaults.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="pending">Pending review</option>
          <option value="published">Published</option>
        </select>
      </label>

      <label className="admin-field-label">
        Category
        <select
          className="admin-field"
          name="category"
          value={categoryId}
          onChange={(e) => {
            const nextId = e.target.value;
            setCategoryId(nextId);
            const nextCat = categories.find((cat) => cat.id === nextId);
            setSubcategoryId(nextCat?.subcategories[0]?.id ?? "");
          }}
          required
        >
          {categories.length === 0 ? <option value="">No categories — create one first</option> : null}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input type="hidden" name="categoryName" value={selectedCategory?.name ?? ""} />
        <span className="admin-blog-hint">
          Manage in{" "}
          <Link href="/admin/categories" className="admin-inline-link">
            Categories
          </Link>
        </span>
      </label>

      <label className="admin-field-label">
        Subcategory
        <select
          className="admin-field"
          name="subcategory"
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
        >
          {(selectedCategory?.subcategories.length ?? 0) === 0 ? (
            <option value="">No subcategories</option>
          ) : null}
          {selectedCategory?.subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        <input
          type="hidden"
          name="subcategoryName"
          value={selectedCategory?.subcategories.find((sub) => sub.id === subcategoryId)?.name ?? ""}
        />
      </label>

      <label className="admin-field-label">
        Author
        <input className="admin-field" name="author" defaultValue={defaults.author ?? ""} placeholder="Author name" />
      </label>

      <label className="admin-field-label">
        Tags
        <input
          className="admin-field"
          name="tags"
          defaultValue={defaults.tags ?? ""}
          placeholder="schools, summit, policy"
        />
      </label>

      <label className="admin-field-label">
        Publish date
        <input
          className="admin-field"
          type="datetime-local"
          name="publishDate"
          defaultValue={defaults.publishDate ?? ""}
        />
      </label>

      <div className="admin-field-label admin-field-span">
        Featured image
        <div className="admin-featured-box">
          {featuredPreview ? (
            <img src={featuredPreview} alt="" className="admin-featured-preview" />
          ) : (
            <div className="admin-featured-empty">No featured image selected</div>
          )}
          <div className="admin-featured-actions">
            <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => fileRef.current?.click()}>
              Upload image
            </button>
            {featuredPreview ? (
              <button
                type="button"
                className="btn admin-btn-ghost btn-sm"
                onClick={() => {
                  setFeaturedPreview("");
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-field-label mb-0" htmlFor={`${uid}-img-url`}>
            Or image URL
            <input
              id={`${uid}-img-url`}
              className="admin-field"
              name="image"
              value={featuredPreview.startsWith("data:") ? "" : featuredPreview}
              onChange={(e) => setFeaturedPreview(e.target.value)}
              placeholder="https://…/cover.jpg"
            />
          </label>
          {featuredPreview.startsWith("data:") ? (
            <input type="hidden" name="imageData" value={featuredPreview} />
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => {
              onFeaturedFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <label className="admin-field-label admin-field-span">
        Featured / hero video embed (optional)
        <input
          className="admin-field"
          name="featuredVideo"
          value={featuredVideo}
          onChange={(e) => setFeaturedVideo(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… or Vimeo URL"
        />
        <span className="admin-blog-hint">Shown at the top of the article like a WordPress video block.</span>
      </label>

      <label className="admin-field-label admin-field-span">
        Excerpt
        <textarea
          className="admin-field"
          name="excerpt"
          rows={3}
          defaultValue={defaults.excerpt ?? ""}
          placeholder="Short summary for cards and search results"
        />
      </label>

      <AdminBlogEditor name="content" defaultValue={defaults.content ?? ""} />
    </>
  );
}
