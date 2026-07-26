"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  READER_DEMO,
  clearReaderSession,
  readReaderSession,
  writeReaderSession,
  type ReaderSession,
} from "@/lib/readerAuth";

export default function SignInForm() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(READER_DEMO.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ReaderSession | null>(null);

  useEffect(() => {
    setSession(readReaderSession());
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || password.length < 6) {
      setError("Use a valid email and a password with at least 6 characters.");
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const demoOk =
        cleanEmail === READER_DEMO.email.toLowerCase() && password === READER_DEMO.password;

      // Allow any previously registered local account (stored under same demo pattern for now)
      const registeredOk = Boolean(window.localStorage.getItem(`enn_reader_user_${cleanEmail}`));
      let displayName = READER_DEMO.name;

      if (registeredOk) {
        try {
          const raw = window.localStorage.getItem(`enn_reader_user_${cleanEmail}`);
          const parsed = raw ? (JSON.parse(raw) as { name: string; password: string }) : null;
          if (!parsed || parsed.password !== password) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
          }
          displayName = parsed.name;
        } catch {
          setError("Could not read your account. Please try again.");
          setLoading(false);
          return;
        }
      } else if (!demoOk) {
        setError("Invalid email or password. Try the demo account or create one.");
        setLoading(false);
        return;
      }

      const saved = writeReaderSession({ email: cleanEmail, name: displayName });
      if (!saved) {
        setError("Could not save your session. Please allow site storage.");
        setLoading(false);
        return;
      }
      setSession(readReaderSession());
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      window.localStorage.setItem(
        `enn_reader_user_${cleanEmail}`,
        JSON.stringify({ name: name.trim(), password, email: cleanEmail }),
      );
    } catch {
      setError("Could not create your account. Please allow site storage.");
      setLoading(false);
      return;
    }

    const saved = writeReaderSession({ email: cleanEmail, name: name.trim() });
    if (!saved) {
      setError("Account created, but session could not be saved.");
      setLoading(false);
      return;
    }

    setSession(readReaderSession());
    setLoading(false);
  };

  const logout = () => {
    clearReaderSession();
    setSession(null);
    setPassword("");
  };

  if (session) {
    return (
      <div className="account-card">
        <p className="account-kicker mb-2">Signed in</p>
        <h2 className="account-card-title serif-headline mb-2">Welcome, {session.name}</h2>
        <p className="account-card-sub mb-4">
          You&apos;re signed in as <strong>{session.email}</strong>. Explore the latest education coverage anytime.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/news" className="account-submit account-submit--inline">
            Read news
          </Link>
          <Link href="/subscribe" className="account-ghost-link">
            View plans
          </Link>
          <button type="button" className="account-text-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="account-card" onSubmit={onSubmit} noValidate>
      <div className="account-tabs" role="tablist" aria-label="Sign in or register">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={`account-tab${mode === "signin" ? " is-active" : ""}`}
          onClick={() => {
            setMode("signin");
            setError("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          className={`account-tab${mode === "register" ? " is-active" : ""}`}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Create account
        </button>
      </div>

      <h2 className="account-card-title serif-headline mb-1">
        {mode === "signin" ? "Welcome back" : "Join ENN"}
      </h2>
      <p className="account-card-sub mb-3">
        {mode === "signin"
          ? "Sign in to sync preferences and manage your subscription."
          : "Create a free reader account in under a minute."}
      </p>

      <div className="account-demo mb-3">
        <span className="account-demo-label">Demo sign in</span>
        <p className="mb-0">
          <strong>{READER_DEMO.email}</strong>
          <span className="opacity-50"> · </span>
          <strong>{READER_DEMO.password}</strong>
        </p>
      </div>

      {error ? <p className="account-feedback account-feedback--err mb-3">{error}</p> : null}

      {mode === "register" ? (
        <>
          <label className="account-label" htmlFor="signin-name">
            Full name
          </label>
          <input
            id="signin-name"
            className="account-input mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
            required
          />
        </>
      ) : null}

      <label className="account-label" htmlFor="signin-email">
        Email address
      </label>
      <input
        id="signin-email"
        type="email"
        className="account-input mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        placeholder="you@email.com"
        required
      />

      <label className="account-label" htmlFor="signin-password">
        Password
      </label>
      <div className="account-password-wrap mb-3">
        <input
          id="signin-password"
          type={showPassword ? "text" : "password"}
          className="account-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="At least 6 characters"
          required
          minLength={6}
        />
        <button type="button" className="account-eye" onClick={() => setShowPassword((v) => !v)}>
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button type="submit" className="account-submit w-100" disabled={loading}>
        {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>

      <p className="account-fineprint mb-0 mt-3">
        Prefer email only?{" "}
        <Link href="/newsletter" className="account-inline-link">
          Join the newsletter
        </Link>
        {" · "}
        <Link href="/subscribe" className="account-inline-link">
          View subscribe plans
        </Link>
      </p>
    </form>
  );
}
