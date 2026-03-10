"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
          <span className="text-2xl font-bold text-[#1C1D21]">Revenue Map</span>
        </Link>
      </div>

      <h1 className="text-[28px] font-bold text-[#1C1D21] mb-2">Reset Password</h1>
      <p className="text-[#8181A5] text-sm mb-8">
        {sent
          ? `A reset link has been sent to ${email}`
          : "Enter your email to receive a password reset link"}
      </p>

      {!sent && (
        <>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#1C1D21] mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#5E81F4] hover:bg-[#4B6FE0] text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 text-sm">
        <Link href="/auth/login" className="text-[#5E81F4] hover:underline">
          Back to Sign In
        </Link>
      </div>
    </>
  );
}
