"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProject";
import { AppShell } from "@/components/layout/AppShell";

type Step = "type" | "basics" | "done";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("type");
  const [productType, setProductType] = useState<"subscription" | "ecommerce" | "saas">("subscription");
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const { createProject } = useProjects();
  const router = useRouter();

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createProject(
        projectName || "My First Project",
        "Created during onboarding",
        productType
      );
      setStep("done");
      setTimeout(() => router.push(`/dashboard/${productType}`), 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const typeOptions = [
    {
      value: "subscription" as const,
      title: "Subscription / SaaS",
      desc: "MRR, churn, cohorts, LTV/CAC. Ideal for apps, platforms, and subscription services.",
    },
    {
      value: "ecommerce" as const,
      title: "E-commerce",
      desc: "AOV, CPC, repeat purchases, unit economics. For online stores and DTC brands.",
    },
    {
      value: "saas" as const,
      title: "SaaS B2B",
      desc: "ARR, NRR, seat-based pricing, pipeline. For enterprise SaaS products.",
    },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="bg-white rounded-xl border border-[#ECECF2] w-full max-w-lg p-6">
          {step === "type" && (
            <>
              <h2 className="text-xl font-bold text-[#1C1D21] mb-1">Welcome! What are you building?</h2>
              <p className="text-sm text-[#8181A5] mb-6">Choose your business model to get started</p>
              <div className="space-y-3">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setProductType(opt.value); setStep("basics"); }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors hover:border-[#5E81F4] ${
                      productType === opt.value ? "border-[#5E81F4] bg-[#5E81F4]/5" : "border-[#ECECF2]"
                    }`}
                  >
                    <p className="font-bold text-[#1C1D21] text-sm">{opt.title}</p>
                    <p className="text-xs text-[#8181A5] mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "basics" && (
            <>
              <h2 className="text-xl font-bold text-[#1C1D21] mb-1">Name your project</h2>
              <p className="text-sm text-[#8181A5] mb-6">You can change this later</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#1C1D21] mb-2">Project Name</label>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My App"
                    autoFocus
                    className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]"
                  />
                </div>
                <p className="text-sm text-[#8181A5]">
                  Type: <strong className="text-[#1C1D21]">
                    {productType === "subscription" ? "Subscription / SaaS" : productType === "saas" ? "SaaS B2B" : "E-commerce"}
                  </strong>
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep("type")}
                  className="h-9 px-4 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="h-9 px-4 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create & Start"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <>
              <h2 className="text-xl font-bold text-[#1C1D21] mb-1">You&apos;re all set!</h2>
              <p className="text-sm text-[#8181A5]">Redirecting to your dashboard...</p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
