"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import AdminNewsTabs from "@/components/admin/AdminNewsTabs";
import {
  readWeeklyCities,
  readWeeklyIssues,
  writeWeeklyCities,
  writeWeeklyIssues,
} from "@/lib/weeklyAdmin";
import type { AdminWeeklyIssue, WeeklyAdminState, WeeklyCity } from "@/lib/weeklyTypes";

async function fetchWeekly(): Promise<WeeklyAdminState> {
  const response = await fetch("/api/admin/weekly");
  const data = (await response.json()) as { weekly?: WeeklyAdminState; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Could not load weekly news.");
  return data.weekly ?? { cities: [], issues: [] };
}

export default function AdminWeeklyNewsPage() {
  const [cities, setCities] = useState<WeeklyCity[]>([]);
  const [issues, setIssues] = useState<AdminWeeklyIssue[]>([]);
  const [cityId, setCityId] = useState("");
  const [ready, setReady] = useState(false);
  const [cityName, setCityName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2800);
  }, []);

  const applyState = useCallback((weekly: WeeklyAdminState) => {
    setCities(weekly.cities);
    setIssues(weekly.issues);
    setCityId((current) => {
      if (current && weekly.cities.some((city) => city.id === current)) return current;
      return weekly.cities[0]?.id ?? "";
    });
  }, []);

  const load = useCallback(async () => {
    let weekly = await fetchWeekly();

    const localIssues = readWeeklyIssues();
    const localCities = readWeeklyCities();
    const dbEmpty = !weekly.issues.length && localIssues.length > 0;

    if (dbEmpty) {
      for (const city of localCities) {
        const exists = weekly.cities.some((item) => item.id === city.id);
        if (!exists) {
          await fetch("/api/admin/weekly", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: city.name }),
          });
        }
      }
      weekly = await fetchWeekly();

      for (const issue of localIssues) {
        await fetch("/api/admin/weekly/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: issue.slug,
            cityId: issue.cityId,
            dateLabel: issue.dateLabel,
            weekday: issue.weekday,
            title: issue.title,
            tagline: issue.tagline,
            coverImage: issue.coverImage,
            pdfUrl: issue.pdfUrl,
            highlights: issue.highlights,
            featured: issue.featured,
          }),
        });
      }

      writeWeeklyIssues([]);
      writeWeeklyCities([]);
      weekly = await fetchWeekly();
      flash(`Migrated ${localIssues.length} weekly edition(s) from this browser to the database.`);
    }

    applyState(weekly);
    return weekly;
  }, [applyState, flash]);

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch((error: unknown) => {
        if (!cancelled) {
          window.alert(error instanceof Error ? error.message : "Could not load weekly news.");
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);
  const cityIssues = useMemo(
    () => (cityId ? issues.filter((issue) => issue.cityId === cityId) : []),
    [cityId, issues],
  );

  const addCity = async (e: FormEvent) => {
    e.preventDefault();
    const name = cityName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json()) as { weekly?: WeeklyAdminState; error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not create city.");
        return;
      }
      if (data.weekly) applyState(data.weekly);
      setCityName("");
      flash(`City “${name}” saved to database`);
    } catch {
      window.alert("Could not create city.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCity = async (id: string) => {
    if (!window.confirm("Delete this city and all its weekly editions?")) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/weekly", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: id }),
      });
      const data = (await response.json()) as { weekly?: WeeklyAdminState; error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not delete city.");
        return;
      }
      if (data.weekly) applyState(data.weekly);
      flash("City deleted from database");
    } catch {
      window.alert("Could not delete city.");
    } finally {
      setSaving(false);
    }
  };

  const deleteIssue = async (slug: string) => {
    if (!window.confirm("Delete this weekly edition?")) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/weekly/issues/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not delete edition.");
        return;
      }
      const weekly = await fetchWeekly();
      applyState(weekly);
      flash("Weekly edition deleted from database");
    } catch {
      window.alert("Could not delete edition.");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = async () => {
    if (!window.confirm("Restore default cities in the database?")) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-cities" }),
      });
      const data = (await response.json()) as { weekly?: WeeklyAdminState; error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not reset cities.");
        return;
      }
      if (data.weekly) applyState(data.weekly);
      flash("Default cities restored in database");
    } catch {
      window.alert("Could not reset cities.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <p className="admin-empty mb-0">Loading weekly news…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Weekly News"
        description="Manage city weeklies — cover image + PDF saved in the database and shown on the public Weekly News page."
        actionHref="/admin/news/weekly/new"
        actionLabel="+ Add weekly edition"
      />
      <AdminNewsTabs />

      {message ? <p className="text-success fw-semibold mt-3 mb-0">{message}</p> : null}

      <div className="admin-category-layout mt-3">
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">Cities</h2>
              <p className="admin-form-card-sub mb-0">
                Same city tabs as the public Weekly News page (Bengaluru, Mumbai, and more).
              </p>
            </div>
            <AdminBadge tone="blue">{cities.length}</AdminBadge>
          </div>

          <form className="admin-form-grid" onSubmit={addCity}>
            <label className="admin-field-label admin-field-span">
              Add city
              <input
                className="admin-field"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Bengaluru"
                required
              />
            </label>
            <div className="admin-form-footer-actions admin-field-span" style={{ justifyContent: "flex-start" }}>
              <button type="submit" className="btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Create city"}
              </button>
              <button type="button" className="btn admin-btn-ghost" onClick={() => void resetDefaults()} disabled={saving}>
                Reset defaults
              </button>
            </div>
          </form>

          <div className="admin-city-pills mt-3" role="tablist" aria-label="Weekly cities">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                role="tab"
                aria-selected={cityId === city.id}
                className={`admin-city-pill${cityId === city.id ? " is-active" : ""}`}
                onClick={() => setCityId(city.id)}
              >
                {city.name}
                <span className="admin-city-pill-count">
                  {issues.filter((issue) => issue.cityId === city.id).length}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">Selected city</h2>
              <p className="admin-form-card-sub mb-0">
                {selectedCity
                  ? `Editing weeklies for ${selectedCity.name}. Add cover image + PDF for each edition.`
                  : "Create a city to start."}
              </p>
            </div>
          </div>
          {selectedCity ? (
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <AdminBadge tone="green">{selectedCity.name}</AdminBadge>
              <span className="admin-cell-sub mb-0">slug: {selectedCity.slug}</span>
              <button
                type="button"
                className="btn admin-btn-ghost btn-sm ms-auto"
                disabled={saving}
                onClick={() => void deleteCity(selectedCity.id)}
              >
                Remove city
              </button>
              <Link href={`/admin/news/weekly/new?city=${selectedCity.id}`} className="btn admin-btn-primary btn-sm">
                + Add edition for {selectedCity.name}
              </Link>
            </div>
          ) : (
            <AdminEmpty message="No city selected." />
          )}
        </section>
      </div>

      <div className="admin-panel mt-4">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">
            Weekly editions{selectedCity ? ` — ${selectedCity.name}` : ""}
          </h2>
          <AdminBadge tone="blue">{cityIssues.length}</AdminBadge>
        </div>
        {cityIssues.length === 0 ? (
          <AdminEmpty message="No editions for this city yet. Add a weekly edition with cover image and PDF." />
        ) : (
          <AdminTable columns={["Cover", "Edition", "Date", "PDF", "Featured", "Actions"]}>
            {cityIssues.map((issue) => (
              <tr key={issue.slug}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={issue.coverImage} alt="" className="admin-weekly-thumb" />
                </td>
                <td>
                  <p className="admin-cell-title mb-0">{issue.title}</p>
                  <p className="admin-cell-sub mb-0">{issue.slug}</p>
                </td>
                <td>
                  {issue.dateLabel}
                  <br />
                  <span className="admin-cell-sub">{issue.weekday}</span>
                </td>
                <td>
                  <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                    Open PDF
                  </a>
                </td>
                <td>{issue.featured ? <AdminBadge tone="orange">Featured</AdminBadge> : "—"}</td>
                <td>
                  <AdminRowActions
                    editHref={`/admin/news/weekly/edit/${encodeURIComponent(issue.slug)}`}
                    onDelete={() => void deleteIssue(issue.slug)}
                    deleteLabel="Delete edition"
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
