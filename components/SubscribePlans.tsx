"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { saveSubscription } from "@/lib/readerAuth";

const plans = [
  {
    id: "digital",
    name: "Digital",
    price: "₹499",
    period: "/ month",
    blurb: "Unlimited ENN stories, morning briefing, and ad-light reading.",
    features: ["Unlimited articles", "Morning Wire inbox", "Exclusive panels archive", "Cancel anytime"],
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹999",
    period: "/ month",
    blurb: "Everything in Digital, plus event discounts and Education Today magazine access.",
    features: ["All Digital benefits", "North Summit ticket discounts", "Education Today magazine", "Priority newsletter"],
    featured: true,
  },
  {
    id: "annual",
    name: "Annual",
    price: "₹4,999",
    period: "/ year",
    blurb: "Best value for schools, educators, and long-term readers.",
    features: ["Two months free", "All Premium benefits", "Yearly receipt for institutions", "Shared school login option"],
    featured: false,
  },
] as const;

export default function SubscribePlans() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("premium");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    if (!name.trim() || !email.trim().includes("@")) {
      setStatus("error");
      setLoading(false);
      return;
    }

    const ok = saveSubscription({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      plan,
    });

    if (!ok) {
      setStatus("error");
      setLoading(false);
      return;
    }

    setStatus("ok");
    setLoading(false);
  };

  return (
    <div className="subscribe-layout">
      <div className="subscribe-plans">
        {plans.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`subscribe-plan${plan === item.id ? " is-selected" : ""}${item.featured ? " is-featured" : ""}`}
            onClick={() => {
              setPlan(item.id);
              setStatus("idle");
            }}
          >
            {item.featured ? <span className="subscribe-plan-badge">Most popular</span> : null}
            <span className="subscribe-plan-name">{item.name}</span>
            <span className="subscribe-plan-price">
              {item.price}
              <span className="subscribe-plan-period">{item.period}</span>
            </span>
            <span className="subscribe-plan-blurb">{item.blurb}</span>
            <ul className="subscribe-plan-features list-unstyled mb-0">
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <form className="account-card subscribe-form-card" onSubmit={onSubmit} noValidate>
        <h2 className="account-card-title serif-headline mb-1">Start your subscription</h2>
        <p className="account-card-sub mb-3">
          Selected plan: <strong>{plans.find((p) => p.id === plan)?.name}</strong>
        </p>

        {status === "ok" ? (
          <div className="account-success">
            <p className="account-success-title mb-2">You&apos;re subscribed</p>
            <p className="account-success-copy mb-3">
              Welcome to ENN. A confirmation will be sent to your inbox. Sign in anytime to manage your reading preferences.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/signin" className="account-submit account-submit--inline">
                Sign in
              </Link>
              <Link href="/newsletter" className="account-ghost-link">
                Manage newsletter
              </Link>
            </div>
          </div>
        ) : (
          <>
            <label className="account-label" htmlFor="subscribe-name">
              Full name
            </label>
            <input
              id="subscribe-name"
              className="account-input mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />

            <label className="account-label" htmlFor="subscribe-email">
              Email address
            </label>
            <input
              id="subscribe-email"
              type="email"
              className="account-input mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />

            {status === "error" ? (
              <p className="account-feedback account-feedback--err mb-3">Please enter your name and a valid email.</p>
            ) : null}

            <button type="submit" className="account-submit w-100" disabled={loading}>
              {loading ? "Activating…" : "Subscribe now"}
            </button>
            <p className="account-fineprint mb-0 mt-3">
              Demo checkout — saves locally for now. Already a member?{" "}
              <Link href="/signin" className="account-inline-link">
                Sign in
              </Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
