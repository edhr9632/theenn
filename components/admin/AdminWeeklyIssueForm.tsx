"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { createWeeklyId, slugifyWeekly } from "@/lib/weeklyTypes";
import type { AdminWeeklyIssue, WeeklyCity } from "@/lib/weeklyTypes";
import {
  compressWeeklyCover,
  isDataUrl,
  isRemoteOrPublicPath,
  uploadWeeklyAsset,
} from "@/lib/weeklyUpload";

type WeeklyFormProps = {
  mode: "new" | "edit";
  slug?: string;
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HIGHLIGHT_TONES = ["red", "blue", "purple", "teal", "ink"] as const;

async function fetchWeeklyData() {
  const response = await fetch("/api/admin/weekly");
  const data = (await response.json()) as {
    weekly?: { cities: WeeklyCity[]; issues: AdminWeeklyIssue[] };
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load weekly data.");
  return data.weekly ?? { cities: [], issues: [] };
}

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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [featured, setFeatured] = useState(false);
  const [highlights, setHighlights] = useState("Bengaluru 360°, Academia, Funorama");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const weekly = await fetchWeeklyData();
        if (cancelled) return;
        setCities(weekly.cities);

        if (mode === "edit" && slug) {
          const existing = weekly.issues.find((item) => item.slug === slug);
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
          const preferred = searchParams.get("city") || weekly.cities[0]?.id || "";
          setCityId(preferred);
          const city = weekly.cities.find((c) => c.id === preferred);
          if (city) {
            setTitle(`Weekly ${city.name} News`);
            setTagline(`Smart reads for ${city.name} families.`);
          }
        }
      } catch (error) {
        if (!cancelled) {
          window.alert(error instanceof Error ? error.message : "Could not load weekly form.");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [mode, slug, searchParams]);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);

  const onCoverFile = async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressWeeklyCover(file);
      setCoverFile(compressed);
      setCoverImage(URL.createObjectURL(compressed));
    } catch {
      window.alert("Could not process cover image. Try a JPG or PNG.");
    }
  };

  const onPdfFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      window.alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      window.alert("PDF is larger than 50 MB. Upload a smaller file or host it under /public and paste the path.");
      return;
    }
    setPdfFile(file);
    setPdfName(file.name);
    setPdfUrl("");
  };

  const onSubmit = async () => {
    if (!selectedCity) {
      window.alert("Please select a city.");
      return;
    }

    const finalSlug =
      issueSlug ||
      slugifyWeekly(`${selectedCity.slug}-${dateLabel || createWeeklyId("week")}`);

    setSaving(true);
    try {
      let resolvedCover = coverImage.trim();
      let resolvedPdf = pdfUrl.trim();

      if (coverFile) {
        setUploadStatus("Uploading cover image…");
        resolvedCover = await uploadWeeklyAsset(coverFile, "covers", finalSlug);
      } else if (!resolvedCover) {
        window.alert("Please add a cover image.");
        return;
      } else if (isDataUrl(resolvedCover)) {
        window.alert("Cover image is too large. Click Upload cover image again, then save.");
        return;
      } else if (!isRemoteOrPublicPath(resolvedCover)) {
        window.alert("Cover must be uploaded or a valid URL/path.");
        return;
      }

      if (pdfFile) {
        setUploadStatus("Uploading PDF…");
        resolvedPdf = await uploadWeeklyAsset(pdfFile, "pdfs", finalSlug);
      } else if (!resolvedPdf) {
        window.alert("Please upload or paste a PDF.");
        return;
      } else if (isDataUrl(resolvedPdf)) {
        window.alert("PDF is too large to save directly. Click Upload PDF again, then save.");
        return;
      } else if (!isRemoteOrPublicPath(resolvedPdf)) {
        window.alert("PDF must be uploaded or a valid URL/path like /weekly-pdfs/edition.pdf");
        return;
      }

      const parsedHighlights = highlights
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label, index) => ({ label, tone: HIGHLIGHT_TONES[index % HIGHLIGHT_TONES.length] }));

      setUploadStatus("Saving edition…");
      const payload = {
        slug: finalSlug,
        cityId: selectedCity.id,
        dateLabel: dateLabel || "01.01.2026",
        weekday,
        title: title || `Weekly ${selectedCity.name} News`,
        tagline,
        coverImage: resolvedCover,
        pdfUrl: resolvedPdf,
        featured,
        highlights: parsedHighlights,
      };

      const url =
        mode === "edit" && slug
          ? `/api/admin/weekly/issues/${encodeURIComponent(slug)}`
          : "/api/admin/weekly/issues";
      const response = await fetch(url, {
        method: mode === "edit" && slug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { issue?: AdminWeeklyIssue; error?: string };
      if (!response.ok) {
        window.alert(
          data.error ??
            (response.status === 413
              ? "Files are too large. Upload cover/PDF using the buttons so they go to storage."
              : "Could not save weekly edition to the database."),
        );
        return;
      }
      router.push("/admin/news/weekly");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save weekly edition.");
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  };

  if (!ready) return <p className="admin-empty mb-0">Loading form…</p>;

  return (
    <AdminFormLayout
      title={mode === "edit" ? "Edit weekly edition" : "Add weekly edition"}
      description="Upload cover + PDF to storage, then save edition details in the database."
      backHref="/admin/news/weekly"
      submitLabel={
        saving ? uploadStatus || "Saving…" : mode === "edit" ? "Update edition" : "Save edition"
      }
      wide
      cardSubtitle="Choose city, add cover + PDF, then save to database."
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
          {coverImage || coverFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="admin-featured-preview" />
          ) : (
            <div className="admin-featured-empty">Upload the weekly magazine cover</div>
          )}
          <div className="admin-featured-actions">
            <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => coverRef.current?.click()}>
              Upload cover image
            </button>
            {coverImage || coverFile ? (
              <button
                type="button"
                className="btn admin-btn-ghost btn-sm"
                onClick={() => {
                  setCoverImage("");
                  setCoverFile(null);
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-field-label mb-0" htmlFor={`${uid}-cover-url`}>
            Or cover image URL
            <input
              id={`${uid}-cover-url`}
              className="admin-field"
              value={coverFile ? "" : coverImage.startsWith("data:") ? "" : coverImage}
              onChange={(e) => {
                setCoverFile(null);
                setCoverImage(e.target.value);
              }}
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
          {pdfFile || pdfUrl ? (
            <div className="admin-pdf-ready">
              <strong>{pdfName || pdfUrl.split("/").pop() || "PDF ready"}</strong>
              <span className="admin-cell-sub d-block">
                {pdfFile
                  ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB — will upload to storage on save`
                  : pdfUrl}
              </span>
              {pdfUrl && !pdfFile ? (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                  Preview PDF
                </a>
              ) : null}
            </div>
          ) : (
            <div className="admin-featured-empty">Upload the weekly PDF magazine</div>
          )}
          <div className="admin-featured-actions">
            <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => pdfRef.current?.click()}>
              Upload PDF
            </button>
            {pdfFile || pdfUrl ? (
              <button
                type="button"
                className="btn admin-btn-ghost btn-sm"
                onClick={() => {
                  setPdfUrl("");
                  setPdfName("");
                  setPdfFile(null);
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-field-label mb-0" htmlFor={`${uid}-pdf-url`}>
            Or PDF URL / path (recommended for large files)
            <input
              id={`${uid}-pdf-url`}
              className="admin-field"
              value={pdfFile ? "" : pdfUrl.startsWith("data:") ? "" : pdfUrl}
              onChange={(e) => {
                setPdfFile(null);
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
