"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, displayName);
      setSuccess(true);
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
          <Link href="/" className="text-2xl font-bold text-[#1C1D21]">Revenue Map</Link>
        </div>
        <h1 className="text-[28px] font-bold text-[#1C1D21] mb-2">Check Your Email</h1>
        <p className="text-[#8181A5] text-sm mb-8">
          We sent a verification link to <strong className="text-[#1C1D21]">{email}</strong>. Click the link to activate your account.
        </p>
        <Link href="/auth/login">
          <button className="w-full h-11 border border-[#ECECF2] text-[#1C1D21] font-bold text-sm rounded-lg hover:bg-[#F8F8FC] transition-colors">
            Back to Sign In
          </button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-[#1C1D21]">Revenue Map</Link>
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
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] transition-colors"
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
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] transition-colors"
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
            className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#5E81F4] hover:bg-[#4B6FE0] text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-[#5E81F4] hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </>
  );
}
