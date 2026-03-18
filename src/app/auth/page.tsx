"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan) {
      localStorage.setItem("pending_plan", plan);
    }
    router.replace(`/auth/register${plan ? `?plan=${plan}` : ""}`);
  }, [router]);

  return null;
}
