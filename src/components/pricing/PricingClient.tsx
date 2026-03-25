"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

/* ─── Data ─── */

const plans = [
  {
    name: "Plus",
    subtitle: "For founders actively building their model",
    monthlyPrice: 29,
    annualPrice: 23,
    annualTotal: 276,
    cta: "Start free trial",
    plan: "plus",
    features: [
      "3 projects",
      "3 scenarios per project (9 total)",
      "Share with up to 3 people",
      "30 AI messages per month per project",
      "3 AI reports per month per project",
      "Scenario comparison",
      "10-day free trial",
    ],
  },
  {
    name: "Pro",
    subtitle: "For serious founders who need no limits",
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
    badge: "Most Popular",
    highlighted: true,
    cta: "Start free trial",
    plan: "pro",
    features: [
      "Unlimited projects",
      "Unlimited scenarios",
      "Share with up to 10 people",
      "Unlimited AI messages",
      "Unlimited AI reports",
      "Scenario comparison",
      "10-day free trial",
      "Everything in Plus",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For teams with custom needs",
    monthlyPrice: -1,
    annualPrice: -1,
    cta: "Contact us",
    href: "mailto:hello@revenuemap.app",
    features: [
      "Everything in Pro",
      "Custom number of projects & scenarios",
      "Unlimited team sharing",
      "Custom AI usage limits",
      "Priority support",
      "Custom onboarding",
      "SLA agreement",
    ],
  },
];

/* ─── Variant ID helpers ─── */

function getVariantId(plan: string, annual: boolean): string {
  if (plan === "plus") {
    return annual
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PLUS_ANNUAL_VARIANT_ID ?? ""
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID ?? "";
  }
  if (plan === "pro") {
    return annual
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID ?? ""
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID ?? "";
  }
  return "";
}

/* ─── Comparison table data ─── */

type CellValue = string | boolean;

interface ComparisonRow {
  feature: string;
  plus: CellValue;
  pro: CellValue;
  enterprise: CellValue;
}

interface ComparisonSection {
  title: string;
  rows: ComparisonRow[];
}

const comparisonData: ComparisonSection[] = [
  {
    title: "Projects & Scenarios",
    rows: [
      { feature: "Projects", plus: "3", pro: "Unlimited", enterprise: "Custom" },
      { feature: "Scenarios per project", plus: "3", pro: "Unlimited", enterprise: "Custom" },
      { feature: "Total scenarios", plus: "9", pro: "Unlimited", enterprise: "Custom" },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      { feature: "Share with others", plus: "Up to 3 people", pro: "Up to 10 people", enterprise: "Custom" },
      { feature: "View shared projects", plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "AI Assistant",
    rows: [
      { feature: "AI messages per month", plus: "30 per project", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "AI reports per month", plus: "3 per project", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Investor Report (view)", plus: true, pro: true, enterprise: true },
      { feature: "Investor Report (download)", plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Analysis",
    rows: [
      { feature: "Scenario comparison", plus: true, pro: true, enterprise: true },
      { feature: "Monte Carlo simulation", plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Extras",
    rows: [
      { feature: "Free trial", plus: "10 days", pro: "10 days", enterprise: false },
      { feature: "Priority support", plus: false, pro: false, enterprise: true },
      { feature: "Custom onboarding", plus: false, pro: false, enterprise: true },
      { feature: "SLA", plus: false, pro: false, enterprise: true },
    ],
  },
];

/* ─── FAQ data ─── */

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes! Both Plus and Pro plans include a 10-day free trial. You won't be charged until the trial ends. Cancel anytime during the trial at no cost.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. You can upgrade or downgrade at any time. When you upgrade, changes take effect immediately. When you downgrade, you keep your current plan until the end of the billing cycle.",
  },
  {
    q: "What happens if my subscription expires?",
    a: "Your data is safe and preserved. You can still view your dashboards and reports, but editing, creating projects, and AI features are disabled until you resubscribe.",
  },
  {
    q: "Is the annual plan billed all at once?",
    a: "Yes. Annual plans are billed as a single payment at the start of the billing cycle. You save approximately 20% compared to monthly billing.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day refund policy for new paid subscriptions. If you're not satisfied, contact us within 7 days of your first payment.",
  },
  {
    q: "Can I use a promo code?",
    a: "Yes! You can enter a promo code during checkout. Discounts are applied automatically at the payment step.",
  },
];

/* ─── Animation helpers ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Cell renderer ─── */

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <svg className="w-5 h-5 text-[#10B981] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (value === false) {
    return (
      <svg className="w-5 h-5 text-[#d1d5db] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return <span className="text-sm text-[#1a1a2e]">{value}</span>;
}

/* ─── FAQ Item ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#e5e7eb]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-bold text-[#1a1a2e] pr-4">{q}</span>
        <motion.svg
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 shrink-0 text-[#6b7280]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[#6b7280] pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */

export function PricingClient() {
  const [annual, setAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("expired");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser({ id: u.id, email: u.email ?? "" });
        supabase.from("profiles").select("plan").eq("id", u.id).single().then(({ data }) => {
          if (data?.plan) setCurrentPlan(data.plan);
        });
      }
    });
  }, []);


  async function handleCheckout(plan: string) {
    if (!user) {
      // Save chosen plan so survey flow knows to auto-checkout
      localStorage.setItem("pending_plan", plan);
      router.push(`/onboarding/survey?plan=${plan}`);
      return;
    }

    // If already on an active plan, redirect to LS portal to change plan
    if (currentPlan === "plus" || currentPlan === "pro") {
      window.location.href = "https://revenuemap.lemonsqueezy.com/billing";
      return;
    }

    setCheckoutLoading(plan);
    try {
      const variantId = getVariantId(plan, annual);
      if (!variantId) {
        alert("Payment is not yet configured. Please try again later.");
        return;
      }

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  function formatPrice(plan: (typeof plans)[number]) {
    if (plan.monthlyPrice === -1) return "Custom";
    const price = annual ? plan.annualPrice : plan.monthlyPrice;
    return `$${price}`;
  }

  function renderCTA(plan: (typeof plans)[number]) {
    if (plan.href) {
      return (
        <Link href={plan.href}>
          <button
            className="w-full h-11 rounded-xl text-sm font-bold transition-all cursor-pointer border border-[#e5e7eb] text-[#6b7280] hover:border-[#2163e7]/50 hover:text-[#1a1a2e]"
          >
            {plan.cta}
          </button>
        </Link>
      );
    }

    const isLoading = checkoutLoading === plan.plan;
    const isCurrentPlan = plan.plan === currentPlan;
    const ctaLabel = isCurrentPlan
      ? "Current Plan"
      : (currentPlan === "plus" || currentPlan === "pro")
        ? "Change Plan"
        : isLoading ? "Loading..." : plan.cta;

    return (
      <button
        onClick={() => !isCurrentPlan && handleCheckout(plan.plan!)}
        disabled={isLoading || isCurrentPlan}
        className={`w-full h-11 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60 ${
          plan.highlighted
            ? "bg-[#2163e7] text-white hover:bg-[#1a53c7] hover:shadow-lg hover:shadow-[#2163e7]/20"
            : "border border-[#e5e7eb] text-[#1a1a2e] hover:border-[#2163e7]/50 hover:bg-[#2163e7]/5"
        }`}
      >
        {ctaLabel}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#1a1a2e] overflow-x-hidden">
      {/* ════════════ HERO ════════════ */}
      <section className="pt-32 pb-16 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-[#1a1a2e] mb-4"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-[#6b7280] mb-10"
        >
          Start with a 10-day free trial. Cancel anytime.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-3"
        >
          <div className="relative flex items-center rounded-full border border-[#e5e7eb] p-1 bg-white">
            <button
              onClick={() => setAnnual(false)}
              className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
              style={{ color: !annual ? "#fff" : "#6b7280" }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
              style={{ color: annual ? "#fff" : "#6b7280" }}
            >
              Annually
            </button>
            <motion.div
              layout
              className="absolute top-1 bottom-1 rounded-full bg-[#2163e7]"
              style={{
                width: "calc(50% - 4px)",
                left: annual ? "calc(50% + 2px)" : "4px",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
          {annual && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>
      </section>

      {/* ════════════ PLAN CARDS ════════════ */}
      <section className="pb-24 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className={`relative rounded-2xl border p-7 transition-all bg-white ${
                plan.highlighted
                  ? "border-[#2163e7] shadow-lg shadow-[#2163e7]/10"
                  : "border-[#e5e7eb] shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4 rounded-full bg-[#2163e7] px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">{plan.name}</h3>
              <p className="text-sm text-[#6b7280] mb-5">{plan.subtitle}</p>

              <div className="flex items-baseline gap-2 mb-1">
                {annual && plan.monthlyPrice > 0 && (
                  <span className="text-2xl font-bold text-[#6b7280]/50 line-through">${plan.monthlyPrice}</span>
                )}
                <span className="text-4xl font-black text-[#1a1a2e]">{formatPrice(plan)}</span>
                {plan.monthlyPrice > 0 && <span className="text-[#6b7280] text-sm">/mo</span>}
              </div>
              {annual && plan.annualTotal && (
                <p className="text-xs text-[#6b7280] mb-1">
                  Billed ${plan.annualTotal.toFixed(2).replace(/\.00$/, "")}/yr
                </p>
              )}
              {plan.monthlyPrice > 0 && (
                <p className="text-xs text-[#F59E0B] font-bold mb-5">10-day free trial</p>
              )}
              {plan.monthlyPrice === -1 && <div className="mb-5" />}

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#1a1a2e]">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {renderCTA(plan)}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════ COMPARISON TABLE ════════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">Compare plans in detail</h2>
            <p className="text-[#6b7280]">Every feature, every plan — at a glance.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-x-auto rounded-2xl border border-[#e5e7eb] bg-white shadow-sm"
          >
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f8f9fc]">
                  <th className="text-left text-sm font-bold text-[#6b7280] p-4 w-[220px] sticky left-0 bg-[#f8f9fc]">
                    Feature
                  </th>
                  <th className="text-center text-sm font-bold text-[#1a1a2e] p-4">
                    Plus
                  </th>
                  <th className="text-center text-sm font-bold text-[#1a1a2e] p-4 border-t-[3px] border-t-[#2163e7]">Pro</th>
                  <th className="text-center text-sm font-bold text-[#1a1a2e] p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((section) => (
                  <>
                    <tr key={`section-${section.title}`}>
                      <td
                        colSpan={4}
                        className="text-xs font-bold uppercase tracking-widest text-[#2163e7] px-4 pt-6 pb-2"
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={row.feature}
                        className={ri % 2 === 0 ? "bg-[#f8f9fc]/50" : ""}
                      >
                        <td className="text-sm text-[#1a1a2e] p-4 sticky left-0 bg-inherit font-medium">
                          {row.feature}
                        </td>
                        <td className="text-center p-4"><CellContent value={row.plus} /></td>
                        <td className="text-center p-4"><CellContent value={row.pro} /></td>
                        <td className="text-center p-4"><CellContent value={row.enterprise} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">Frequently asked questions</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            {faqs.map((faq) => (
              <motion.div key={faq.q} variants={fadeUp} transition={{ duration: 0.4 }}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════ BOTTOM CTA ════════════ */}
      <section className="relative py-24 px-4 text-center overflow-hidden grid-pattern">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(33,99,231,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4"
          >
            Ready to build your model?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[#6b7280] mb-8"
          >
            Start your 10-day free trial today — cancel anytime, no questions asked.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/onboarding/survey">
              <button className="h-14 px-10 bg-[#2163e7] text-white text-base font-bold rounded-xl hover:bg-[#1a53c7] transition-all hover:shadow-xl hover:shadow-[#2163e7]/20 hover:-translate-y-0.5 cursor-pointer">
                Start Free Trial
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-[#e5e7eb] py-12 px-4 text-center bg-white">
        <p className="text-xs text-[#6b7280]">
          &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
