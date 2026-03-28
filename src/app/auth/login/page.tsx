"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const plan = searchParams.get("plan");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect);
    }
  }, [authLoading, user, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // Refresh server components so middleware sees the new session cookie
      router.refresh();
      if (plan) {
        localStorage.setItem("pending_plan", plan);
        router.push("/plans");
      } else {
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" width={32} height={32} />
          <span className="text-2xl font-bold text-[#1C1D21]">Revenue Map</span>
        </Link>
      </div>

      <h1 className="text-[28px] font-bold text-[#1C1D21] mb-2">Sign In</h1>
      <p className="text-[#8181A5] text-sm mb-8">Enter your email and password to access your account</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[#1C1D21] mb-2">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-[16px] sm:text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
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
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-[16px] sm:text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#2163E7] hover:bg-[#4B6FE0] text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="flex justify-between mt-6 text-sm">
        <Link href="/auth/register" className="text-[#2163E7] hover:underline">
          Create account
        </Link>
        <Link href="/auth/reset" className="text-[#8181A5] hover:text-[#2163E7] transition-colors">
          Forgot password?
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-[#8181A5]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
