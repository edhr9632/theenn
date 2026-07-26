import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to your Education News Network reader account.",
  path: "/signin",
  noIndex: true,
});

export default function SignInPage() {
  return (
    <>
      <SiteMasthead />
      <main className="account-page">
        <section className="account-hero account-hero--compact" aria-labelledby="signin-heading">
          <div className="container">
            <p className="account-hero-eyebrow text-uppercase mb-2 mb-lg-3">Reader account</p>
            <h1 id="signin-heading" className="account-hero-title serif-headline mb-3 mb-lg-4">
              Sign in
            </h1>
            <p className="account-hero-deck mb-0">Access your ENN preferences, subscription, and saved reading experience.</p>
          </div>
        </section>

        <section className="account-body">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-xl-5">
                <SignInForm />
                <p className="account-crosslinks text-center mb-0 mt-4">
                  Staff member?{" "}
                  <Link href="/admin/login" className="account-inline-link">
                    Admin console login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
