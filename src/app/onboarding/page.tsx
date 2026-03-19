"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const plan = localStorage.getItem("pending_plan") ?? "plus";
    router.replace(`/onboarding/survey?plan=${plan}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-[#8181A5]">Redirecting...</p>
    </div>
  );
}
