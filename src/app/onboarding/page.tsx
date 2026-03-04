"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Step = "type" | "basics" | "done";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("type");
  const [productType, setProductType] = useState<"subscription" | "ecommerce">("subscription");
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <Card className="w-full max-w-lg">
        {step === "type" && (
          <>
            <CardHeader>
              <CardTitle>Welcome! What are you building?</CardTitle>
              <CardDescription>Choose your business model to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => { setProductType("subscription"); setStep("basics"); }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors hover:border-primary ${productType === "subscription" ? "border-primary bg-primary/5" : ""}`}
              >
                <p className="font-semibold">Subscription / SaaS</p>
                <p className="text-sm text-muted-foreground">
                  MRR, churn, cohorts, LTV/CAC. Ideal for apps, platforms, and subscription services.
                </p>
              </button>
              <button
                onClick={() => { setProductType("ecommerce"); setStep("basics"); }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors hover:border-primary ${productType === "ecommerce" ? "border-primary bg-primary/5" : ""}`}
              >
                <p className="font-semibold">E-commerce</p>
                <p className="text-sm text-muted-foreground">
                  AOV, CPC, repeat purchases, unit economics. For online stores and DTC brands.
                </p>
              </button>
            </CardContent>
          </>
        )}

        {step === "basics" && (
          <>
            <CardHeader>
              <CardTitle>Name your project</CardTitle>
              <CardDescription>You can change this later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My App"
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Type: <strong>{productType === "subscription" ? "Subscription / SaaS" : "E-commerce"}</strong>
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("type")}>Back</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create & Start"}
              </Button>
            </CardFooter>
          </>
        )}

        {step === "done" && (
          <>
            <CardHeader>
              <CardTitle>You&apos;re all set!</CardTitle>
              <CardDescription>Redirecting to your dashboard...</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  );
}
