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
      // Show spinner while useEffect waits for auth state to settle and redirects.
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
        <p className="text-sm text-[#8181A5]">Setting up your account...</p>
      </div>
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
