"use client";

import { FormEvent, useState } from "react";
import { saveNewsletterEmail } from "@/lib/readerAuth";

type NewsletterFormProps = {
  source?: string;
  variant?: "page" | "footer" | "compact";
  buttonLabel?: string;
  placeholder?: string;
};

export default function NewsletterForm({
  source = "newsletter",
  variant = "page",
  buttonLabel = "Subscribe",
  placeholder = "your@email.com",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const ok = saveNewsletterEmail(email, source);
    if (!ok) {
      setStatus("error");
      setLoading(false);
      return;
    }

    setStatus("ok");
    setEmail("");
    setLoading(false);
  };

  if (variant === "footer") {
    return (
      <form className="footer-newsletter-form" onSubmit={onSubmit} noValidate>
        <div className="input-group footer-input-group">
          <input
            type="email"
            className="form-control footer-email-input"
            placeholder={placeholder}
            autoComplete="email"
            aria-label="Email for newsletter"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            required
          />
          <button type="submit" className="btn footer-newsletter-btn" aria-label="Subscribe to newsletter" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.116Z" />
            </svg>
          </button>
        </div>
        {status === "ok" ? <p className="footer-form-feedback footer-form-feedback--ok mb-0 mt-2">You&apos;re on the list. Welcome aboard.</p> : null}
        {status === "error" ? <p className="footer-form-feedback footer-form-feedback--err mb-0 mt-2">Enter a valid email address.</p> : null}
      </form>
    );
  }

  return (
    <form className={`account-form account-form--${variant}`} onSubmit={onSubmit} noValidate>
      <label className="account-label" htmlFor={`newsletter-email-${source}`}>
        Email address
      </label>
      <div className="account-field-row">
        <input
          id={`newsletter-email-${source}`}
          type="email"
          className="account-input"
          placeholder={placeholder}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          required
        />
        <button type="submit" className="account-submit" disabled={loading}>
          {loading ? "Saving…" : buttonLabel}
        </button>
      </div>
      {status === "ok" ? <p className="account-feedback account-feedback--ok mb-0">Thanks — you&apos;re subscribed to the ENN newsletter.</p> : null}
      {status === "error" ? <p className="account-feedback account-feedback--err mb-0">Please enter a valid email address.</p> : null}
    </form>
  );
}
