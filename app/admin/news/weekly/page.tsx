"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import AdminNewsTabs from "@/components/admin/AdminNewsTabs";
import {
  createWeeklyId,
  DEFAULT_WEEKLY_CITIES,
  getIssuesForCity,
  readWeeklyCities,
  readWeeklyIssues,
  slugifyWeekly,
  writeWeeklyCities,
  writeWeeklyIssues,
  type AdminWeeklyIssue,
  type WeeklyCity,
} from "@/lib/weeklyAdmin";

export default function AdminWeeklyNewsPage() {
  const [cities, setCities] = useState<WeeklyCity[]>([]);
  const [issues, setIssues] = useState<AdminWeeklyIssue[]>([]);
  const [cityId, setCityId] = useState("");
  const [ready, setReady] = useState(false);
  const [cityName, setCityName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadedCities = readWeeklyCities();
    const loadedIssues = readWeeklyIssues();
    setCities(loadedCities);
    setIssues(loadedIssues);
    setCityId(loadedCities[0]?.id ?? "");
    setReady(true);
  }, []);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);
  const cityIssues = useMemo(() => (cityId ? getIssuesForCity(cityId, issues) : []), [cityId, issues]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const addCity = (e: FormEvent) => {
    e.preventDefault();
    const name = cityName.trim();
    if (!name) return;
    const next: WeeklyCity = {
      id: createWeeklyId("city"),
      name,
      slug: slugifyWeekly(name),
    };
    const updated = [...cities, next];
    setCities(updated);
    writeWeeklyCities(updated);
    setCityId(next.id);
    setCityName("");
    flash(`City “${name}” added`);
  };

  const deleteCity = (id: string) => {
    if (!window.confirm("Delete this city and keep its issues unlisted from this city?")) return;
    const updated = cities.filter((c) => c.id !== id);
    setCities(updated);
    writeWeeklyCities(updated);
    if (cityId === id) setCityId(updated[0]?.id ?? "");
    flash("City removed");
  };

  const deleteIssue = (slug: string) => {
    if (!window.confirm("Delete this weekly edition?")) return;
    const updated = issues.filter((item) => item.slug !== slug);
    setIssues(updated);
    writeWeeklyIssues(updated);
    flash("Weekly edition deleted");
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset cities to the default list?")) return;
    setCities(DEFAULT_WEEKLY_CITIES);
    writeWeeklyCities(DEFAULT_WEEKLY_CITIES);
    setCityId(DEFAULT_WEEKLY_CITIES[0]?.id ?? "");
    flash("Default cities restored");
  };

  if (!ready) return <p className="admin-empty mb-0">Loading weekly news…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Weekly News"
        description="Manage city weeklies like the frontend — cover image + PDF per edition."
        actionHref="/admin/news/weekly/new"
        actionLabel="+ Add weekly edition"
      />
      <AdminNewsTabs />

      {message ? <p className="admin-inline-toast mt-3 mb-0">{message}</p> : null}

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
              <button type="submit" className="btn admin-btn-primary">
                Create city
              </button>
              <button type="button" className="btn admin-btn-ghost" onClick={resetDefaults}>
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
                <span className="admin-city-pill-count">{getIssuesForCity(city.id, issues).length}</span>
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
              <button type="button" className="btn admin-btn-ghost btn-sm ms-auto" onClick={() => deleteCity(selectedCity.id)}>
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
                    onDelete={() => deleteIssue(issue.slug)}
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
