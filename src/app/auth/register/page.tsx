"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  // If already logged in, go back to survey (not dashboard)
  // so auto-submit can pick up the draft
  useEffect(() => {
    if (!authLoading && user) {
      if (plan) {
        router.replace(`/onboarding/survey?plan=${plan}`);
      } else {
        router.replace("/onboarding/survey");
      }
    }
  }, [authLoading, user, router, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, displayName);
      // Email confirmation is disabled — user is auto-logged in.
      // Redirect to survey so auto-submit picks up the draft.
      if (plan) {
        router.replace(`/onboarding/survey?plan=${plan}`);
      } else {
        router.replace("/onboarding/survey");
      }
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" width={32} height={32} />
            <span className="text-2xl font-bold text-[#1C1D21]">Revenue Map</span>
          </Link>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#2163E7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-[28px] font-bold text-[#1C1D21] mb-2 text-center">Check Your Email</h1>
        <p className="text-[#8181A5] text-sm mb-2 text-center">
          We sent a verification link to <strong className="text-[#1C1D21]">{email}</strong>.
        </p>
        <p className="text-[#8181A5] text-sm mb-8 text-center">
          Click the link in your email to continue. Your survey answers are saved — you&apos;ll pick up right where you left off.
        </p>
        <div className="bg-[#F8F8FC] rounded-lg p-4 mb-6">
          <p className="text-xs text-[#8181A5] text-center">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={handleSubmit}
              className="text-[#2163E7] hover:underline font-bold"
            >
              resend it
            </button>.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" width={32} height={32} />
          <span className="text-2xl font-bold text-[#1C1D21]">Revenue Map</span>
        </Link>
      </div>

      <h1 className="text-[28px] font-bold text-[#1C1D21] mb-2">Create Account</h1>
      <p className="text-[#8181A5] text-sm mb-8">Start building your financial models</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-[#1C1D21] mb-2">Display Name</label>
          <input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[#1C1D21] mb-2">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-[#1C1D21] mb-2">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#2163E7] hover:bg-[#4B6FE0] text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-[#2163E7] hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </>
  );
}
