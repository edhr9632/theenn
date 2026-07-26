"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import {
  createWeeklyId,
  readWeeklyCities,
  readWeeklyIssues,
  slugifyWeekly,
  writeWeeklyIssues,
  type AdminWeeklyIssue,
  type WeeklyCity,
} from "@/lib/weeklyAdmin";

type WeeklyFormProps = {
  mode: "new" | "edit";
  slug?: string;
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminWeeklyIssueForm({ mode, slug }: WeeklyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = useId();
  const coverRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const [cities, setCities] = useState<WeeklyCity[]>([]);
  const [cityId, setCityId] = useState("");
  const [title, setTitle] = useState("");
  const [issueSlug, setIssueSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const [weekday, setWeekday] = useState("Saturday");
  const [tagline, setTagline] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [featured, setFeatured] = useState(false);
  const [highlights, setHighlights] = useState("Bengaluru 360°, Academia, Funorama");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadedCities = readWeeklyCities();
    setCities(loadedCities);

    if (mode === "edit" && slug) {
      const existing = readWeeklyIssues().find((item) => item.slug === slug);
      if (existing) {
        setCityId(existing.cityId);
        setTitle(existing.title);
        setIssueSlug(existing.slug);
        setSlugTouched(true);
        setDateLabel(existing.dateLabel);
        setWeekday(existing.weekday);
        setTagline(existing.tagline);
        setCoverImage(existing.coverImage);
        setPdfUrl(existing.pdfUrl);
        setFeatured(Boolean(existing.featured));
        setHighlights(existing.highlights.map((h) => h.label).join(", "));
      }
    } else {
      const preferred = searchParams.get("city") || loadedCities[0]?.id || "";
      setCityId(preferred);
      const city = loadedCities.find((c) => c.id === preferred);
      if (city) {
        setTitle(`Weekly ${city.name} News`);
        setTagline(`Smart reads for ${city.name} families.`);
      }
    }
    setReady(true);
  }, [mode, slug, searchParams]);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);

  const onCoverFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const onPdfFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      window.alert("Please upload a PDF file.");
      return;
    }
    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPdfUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const onSubmit = () => {
    if (!selectedCity) {
      window.alert("Please select a city.");
      return;
    }
    if (!coverImage) {
      window.alert("Please add a cover image.");
      return;
    }
    if (!pdfUrl) {
      window.alert("Please upload or paste a PDF.");
      return;
    }

    const tones = ["red", "blue", "purple", "teal", "ink"] as const;
    const parsedHighlights = highlights
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label, index) => ({ label, tone: tones[index % tones.length] }));

    const finalSlug =
      issueSlug ||
      slugifyWeekly(`${selectedCity.slug}-${dateLabel || createWeeklyId("week")}`);

    const nextIssue: AdminWeeklyIssue = {
      slug: finalSlug,
      dateLabel: dateLabel || "01.01.2026",
      weekday,
      title: title || `Weekly ${selectedCity.name} News`,
      tagline,
      coverImage,
      pdfUrl,
      featured,
      highlights: parsedHighlights,
      cityId: selectedCity.id,
      cityName: selectedCity.name,
    };

    const existing = readWeeklyIssues();
    let updated: AdminWeeklyIssue[];
    if (mode === "edit" && slug) {
      updated = existing.map((item) => (item.slug === slug ? nextIssue : item));
      if (featured) {
        updated = updated.map((item) =>
          item.cityId === selectedCity.id ? { ...item, featured: item.slug === nextIssue.slug } : item,
        );
      }
    } else {
      updated = [nextIssue, ...existing.filter((item) => item.slug !== nextIssue.slug)];
      if (featured) {
        updated = updated.map((item) =>
          item.cityId === selectedCity.id ? { ...item, featured: item.slug === nextIssue.slug } : item,
        );
      }
    }

    writeWeeklyIssues(updated);
    router.push("/admin/news/weekly");
  };

  if (!ready) return <p className="admin-empty mb-0">Loading form…</p>;

  return (
    <AdminFormLayout
      title={mode === "edit" ? "Edit weekly edition" : "Add weekly edition"}
      description="City weekly magazine — upload cover image and PDF, same as the public Weekly News page."
      backHref="/admin/news/weekly"
      submitLabel={mode === "edit" ? "Update edition" : "Save edition"}
      wide
      cardSubtitle="Choose city, add cover + PDF, then publish."
      showSeo
      onSubmit={onSubmit}
      seoDefaults={{
        metaTitle: title,
        metaDescription: tagline,
        metaKeywords: selectedCity ? `${selectedCity.name}, weekly news, Education Today` : undefined,
        ogImage: coverImage.startsWith("data:") ? undefined : coverImage,
      }}
    >
      <label className="admin-field-label">
        City
        <select
          className="admin-field"
          name="cityId"
          value={cityId}
          onChange={(e) => {
            const nextId = e.target.value;
            setCityId(nextId);
            const city = cities.find((c) => c.id === nextId);
            if (city && mode === "new" && !slugTouched) {
              setTitle(`Weekly ${city.name} News`);
              setTagline(`Smart reads for ${city.name} families.`);
            }
          }}
          required
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-field-label">
        Weekday
        <select className="admin-field" name="weekday" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
          {WEEKDAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-field-label admin-field-span">
        Title
        <input
          className="admin-field admin-article-title-input"
          name="title"
          value={title}
          onChange={(e) => {
            const next = e.target.value;
            setTitle(next);
            if (!slugTouched && selectedCity) {
              setIssueSlug(slugifyWeekly(`${selectedCity.slug}-${dateLabel || next}`));
            }
          }}
          placeholder="Weekly Bengaluru News"
          required
        />
      </label>

      <label className="admin-field-label">
        Slug
        <input
          className="admin-field"
          name="slug"
          value={issueSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setIssueSlug(slugifyWeekly(e.target.value));
          }}
          placeholder="bengaluru-aug-week-1-2025"
          required
        />
      </label>

      <label className="admin-field-label">
        Date label
        <input
          className="admin-field"
          name="dateLabel"
          value={dateLabel}
          onChange={(e) => setDateLabel(e.target.value)}
          placeholder="09.08.2025"
          required
        />
      </label>

      <label className="admin-field-label admin-field-span">
        Tagline
        <input
          className="admin-field"
          name="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Smart reads, happy feeds — the city’s week in a peek!"
        />
      </label>

      <label className="admin-field-label admin-field-span">
        Highlights (comma separated)
        <input
          className="admin-field"
          name="highlights"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          placeholder="Bengaluru 360°, Karnataka, Funorama"
        />
      </label>

      <div className="admin-field-label admin-field-span">
        Cover image
        <div className="admin-featured-box">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="admin-featured-preview" />
          ) : (
            <div className="admin-featured-empty">Upload the weekly magazine cover</div>
          )}
          <div className="admin-featured-actions">
            <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => coverRef.current?.click()}>
              Upload cover image
            </button>
            {coverImage ? (
              <button type="button" className="btn admin-btn-ghost btn-sm" onClick={() => setCoverImage("")}>
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-field-label mb-0" htmlFor={`${uid}-cover-url`}>
            Or cover image URL
            <input
              id={`${uid}-cover-url`}
              className="admin-field"
              value={coverImage.startsWith("data:") ? "" : coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/images/weekly/aug-week-1.png"
            />
          </label>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => {
              onCoverFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="admin-field-label admin-field-span">
        Weekly PDF
        <div className="admin-featured-box">
          {pdfUrl ? (
            <div className="admin-pdf-ready">
              <strong>{pdfName || "PDF ready"}</strong>
              <span className="admin-cell-sub d-block">
                {pdfUrl.startsWith("data:") ? "Uploaded file (saved locally for demo)" : pdfUrl}
              </span>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                Preview PDF
              </a>
            </div>
          ) : (
            <div className="admin-featured-empty">Upload the weekly PDF magazine</div>
          )}
          <div className="admin-featured-actions">
            <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => pdfRef.current?.click()}>
              Upload PDF
            </button>
            {pdfUrl ? (
              <button
                type="button"
                className="btn admin-btn-ghost btn-sm"
                onClick={() => {
                  setPdfUrl("");
                  setPdfName("");
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-field-label mb-0" htmlFor={`${uid}-pdf-url`}>
            Or PDF URL / path
            <input
              id={`${uid}-pdf-url`}
              className="admin-field"
              value={pdfUrl.startsWith("data:") ? "" : pdfUrl}
              onChange={(e) => {
                setPdfUrl(e.target.value);
                setPdfName("");
              }}
              placeholder="/weekly-pdfs/aug-week-1-2025.pdf"
            />
          </label>
          <input
            ref={pdfRef}
            type="file"
            accept="application/pdf,.pdf"
            className="d-none"
            onChange={(e) => {
              onPdfFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <label className="admin-field-label admin-field-span admin-check-row">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        <span>Featured edition for this city (shows as latest on the frontend)</span>
      </label>
    </AdminFormLayout>
  );
}
