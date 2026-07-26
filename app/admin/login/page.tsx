"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_DEMO_CREDENTIALS } from "@/lib/admin";
import { isAdminAuthenticated, writeAdminSession } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState(ADMIN_DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      window.location.assign("/admin");
    }
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok =
      email.trim().toLowerCase() === ADMIN_DEMO_CREDENTIALS.email.toLowerCase() &&
      password === ADMIN_DEMO_CREDENTIALS.password;

    if (!ok) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const saved = writeAdminSession(ADMIN_DEMO_CREDENTIALS.email);
    if (!saved) {
      setError("Could not save login session. Please allow site storage and try again.");
      setLoading(false);
      return;
    }

    window.location.assign("/admin");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <aside className="admin-login-aside">
          <div className="admin-login-aside-inner">
            <Image
              src="/images/Enn_logo1.png"
              alt="Education News Network"
              width={280}
              height={80}
              className="admin-login-aside-logo mb-4"
              priority
            />
            <span className="admin-login-kicker">Education News Network</span>
            <h1 className="admin-login-hero-title">Admin Console</h1>
            <p className="admin-login-hero-copy">
              Manage news, panels, podcasts, events, speakers, and contact messages from one elegant workspace.
            </p>
            <ul className="admin-login-points">
              <li>Publish and update website content</li>
              <li>Organize speakers &amp; sponsors by year</li>
              <li>Review contact messages quickly</li>
            </ul>
          </div>
        </aside>

        <main className="admin-login-main">
          <form className="admin-login-card" onSubmit={onSubmit} method="post" action="#">
            <div className="admin-login-card-head">
              <Image
                src="/images/Enn_logo1.png"
                alt="ENN"
                width={200}
                height={56}
                className="admin-login-form-logo"
                priority
              />
              <div>
                <h2 className="admin-login-title mb-1">Welcome back</h2>
                <p className="admin-login-sub mb-0">Sign in to continue to your dashboard</p>
              </div>
            </div>

            <div className="admin-login-demo">
              <span className="admin-login-demo-label">Demo access</span>
              <p className="mb-0">
                <strong>{ADMIN_DEMO_CREDENTIALS.email}</strong>
                <span className="admin-login-demo-sep"> · </span>
                <strong>{ADMIN_DEMO_CREDENTIALS.password}</strong>
              </p>
            </div>

            {error ? <p className="admin-login-error mb-0">{error}</p> : null}

            <div className="admin-login-fields">
              <label className="admin-login-label" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                className="admin-login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="you@ennnews.com"
                required
              />

              <label className="admin-login-label" htmlFor="admin-password">
                Password
              </label>
              <div className="admin-login-password-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="admin-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="admin-login-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </button>

            <p className="admin-login-footer mb-0">
              <Link href="/" className="admin-login-back">
                ← Back to website
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
