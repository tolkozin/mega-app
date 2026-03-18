"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

/* ─── Data ─── */

const plans = [
  {
    name: "Free",
    subtitle: "Explore Revenue Map at your own pace",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Get started free",
    href: "/auth",
    features: [
      "1 project",
      "1 scenario per project",
      "View Investor Report (no download)",
      "1 AI report per month",
      "10 AI assistant messages per month",
      "No sharing",
    ],
  },
  {
    name: "Plus",
    subtitle: "For founders actively building their model",
    monthlyPrice: 18,
    annualPrice: 14.4,
    annualTotal: 172.8,
    badge: "Most Popular",
    highlighted: true,
    cta: "Start with Plus",
    plan: "plus",
    features: [
      "3 projects",
      "3 scenarios per project (9 total)",
      "Share with up to 3 people",
      "30 AI messages per month per project",
      "3 AI reports per month per project",
      "Scenario comparison",
      "Everything in Free",
    ],
  },
  {
    name: "Pro",
    subtitle: "For serious founders who need no limits",
    monthlyPrice: 29,
    annualPrice: 23.2,
    annualTotal: 278.4,
    cta: "Start with Pro",
    plan: "pro",
    features: [
      "Unlimited projects",
      "Unlimited scenarios",
      "Share with up to 10 people",
      "Unlimited AI messages",
      "Unlimited AI reports",
      "Scenario comparison",
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
  free: CellValue;
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
      { feature: "Projects", free: "1", plus: "3", pro: "Unlimited", enterprise: "Custom" },
      { feature: "Scenarios per project", free: "1", plus: "3", pro: "Unlimited", enterprise: "Custom" },
      { feature: "Total scenarios", free: "1", plus: "9", pro: "Unlimited", enterprise: "Custom" },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      { feature: "Share with others", free: false, plus: "Up to 3 people", pro: "Up to 10 people", enterprise: "Custom" },
      { feature: "View shared projects", free: true, plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "AI Assistant",
    rows: [
      { feature: "AI messages per month", free: "10 total", plus: "30 per project", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "AI reports per month", free: "1 total", plus: "3 per project", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Investor Report (view)", free: true, plus: true, pro: true, enterprise: true },
      { feature: "Investor Report (download)", free: false, plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Analysis",
    rows: [
      { feature: "Scenario comparison", free: false, plus: true, pro: true, enterprise: true },
      { feature: "Monte Carlo simulation", free: true, plus: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Extras",
    rows: [
      { feature: "Priority support", free: false, plus: false, pro: false, enterprise: true },
      { feature: "Custom onboarding", free: false, plus: false, pro: false, enterprise: true },
      { feature: "SLA", free: false, plus: false, pro: false, enterprise: true },
    ],
  },
];

/* ─── FAQ data ─── */

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. You can upgrade or downgrade at any time. When you upgrade, changes take effect immediately. When you downgrade, you keep your current plan until the end of the billing cycle.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is safe. If you have more projects or scenarios than your new plan allows, existing data stays intact — you just won't be able to create new ones until you're within the plan limits.",
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
      <svg className="w-5 h-5 text-[#475569] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return <span className="text-sm text-[#CBD5E1]">{value}</span>;
}

/* ─── FAQ Item ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#334155]/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-bold text-[#F8FAFC] pr-4">{q}</span>
        <motion.svg
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 shrink-0 text-[#94A3B8]"
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
            <p className="text-sm text-[#94A3B8] pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */

export function PricingClient() {
  const [annual, setAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? "" });
    });
  }, []);

  // Load Lemon Squeezy JS for overlay checkout
  useEffect(() => {
    if (document.getElementById("lemonsqueezy-js")) return;
    const script = document.createElement("script");
    script.id = "lemonsqueezy-js";
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  async function handleCheckout(plan: string) {
    if (!user) {
      router.push(`/auth?plan=${plan}`);
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
      if (!res.ok) throw new Error(data.error);

      // Try overlay checkout, fallback to redirect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.LemonSqueezy) {
        win.LemonSqueezy.Url.Open(data.url);
      } else {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  function formatPrice(plan: (typeof plans)[number]) {
    if (plan.monthlyPrice === -1) return "Custom";
    if (plan.monthlyPrice === 0) return "$0";
    const price = annual ? plan.annualPrice : plan.monthlyPrice;
    const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2).replace(/0$/, "");
    return `$${formatted}`;
  }

  function renderCTA(plan: (typeof plans)[number]) {
    // Free and Enterprise use plain links
    if (plan.href) {
      return (
        <Link href={plan.href}>
          <button
            className={`w-full h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              plan.highlighted
                ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/25"
                : plan.name === "Enterprise"
                  ? "bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC]"
                  : "border border-[#334155] text-[#F8FAFC] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5"
            }`}
          >
            {plan.cta}
          </button>
        </Link>
      );
    }

    // Plus / Pro → checkout
    const isLoading = checkoutLoading === plan.plan;
    return (
      <button
        onClick={() => handleCheckout(plan.plan!)}
        disabled={isLoading}
        className={`w-full h-11 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60 ${
          plan.highlighted
            ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/25"
            : "border border-[#334155] text-[#F8FAFC] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5"
        }`}
      >
        {isLoading ? "Loading..." : plan.cta}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-x-hidden">
      {/* ════════════ HERO ════════════ */}
      <section className="pt-32 pb-16 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-[#94A3B8] mb-10"
        >
          Start free. Upgrade when you&apos;re ready to grow.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-3"
        >
          <div className="relative flex items-center rounded-full border border-[#334155] p-1" style={{ background: "rgba(30,41,59,0.6)" }}>
            <button
              onClick={() => setAnnual(false)}
              className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
              style={{ color: !annual ? "#F8FAFC" : "#94A3B8" }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
              style={{ color: annual ? "#F8FAFC" : "#94A3B8" }}
            >
              Annually
            </button>
            {/* Sliding pill */}
            <motion.div
              layout
              className="absolute top-1 bottom-1 rounded-full bg-[#3B82F6]"
              style={{
                width: "calc(50% - 4px)",
                left: annual ? "calc(50% + 2px)" : "4px",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
          {!annual && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full"
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
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className={`relative rounded-2xl border p-7 transition-all ${
                plan.highlighted
                  ? "border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                  : plan.name === "Enterprise"
                    ? "border-[#334155]/60 bg-[rgba(15,23,42,0.5)]"
                    : "border-[#334155]/60"
              }`}
              style={{
                background: plan.highlighted
                  ? "rgba(30,41,59,0.6)"
                  : plan.name === "Enterprise"
                    ? "rgba(15,23,42,0.5)"
                    : "rgba(30,41,59,0.4)",
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4 rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-[#94A3B8] mb-5">{plan.subtitle}</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">{formatPrice(plan)}</span>
                {plan.monthlyPrice > 0 && <span className="text-[#94A3B8] text-sm">/mo</span>}
                {plan.monthlyPrice === 0 && <span className="text-[#94A3B8] text-sm">/forever</span>}
              </div>
              {annual && plan.annualTotal && (
                <p className="text-xs text-[#64748B] mb-5">
                  Billed ${plan.annualTotal.toFixed(2).replace(/\.00$/, "")}/yr
                </p>
              )}
              {(!annual || !plan.annualTotal) && plan.monthlyPrice >= 0 && (
                <div className="mb-5" />
              )}
              {plan.monthlyPrice === -1 && <div className="mb-5" />}

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
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
      <section className="py-24 px-4" style={{ background: "rgba(30,41,59,0.2)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Compare plans in detail</h2>
            <p className="text-[#94A3B8]">Every feature, every plan — at a glance.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-x-auto rounded-2xl border border-[#334155]/60"
            style={{ background: "rgba(15,23,42,0.5)" }}
          >
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="sticky top-0 z-10" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(8px)" }}>
                  <th className="text-left text-sm font-bold text-[#94A3B8] p-4 w-[220px] sticky left-0 bg-[#0F172A]">
                    Feature
                  </th>
                  <th className="text-center text-sm font-bold text-[#F8FAFC] p-4">Free</th>
                  <th className="text-center text-sm font-bold text-[#F8FAFC] p-4 border-t-[3px] border-t-[#3B82F6]">
                    Plus
                  </th>
                  <th className="text-center text-sm font-bold text-[#F8FAFC] p-4">Pro</th>
                  <th className="text-center text-sm font-bold text-[#F8FAFC] p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((section) => (
                  <>
                    <tr key={`section-${section.title}`}>
                      <td
                        colSpan={5}
                        className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] px-4 pt-6 pb-2"
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={row.feature}
                        className={ri % 2 === 0 ? "bg-[#1E293B]/30" : ""}
                      >
                        <td className="text-sm text-[#CBD5E1] p-4 sticky left-0 bg-inherit font-medium">
                          {row.feature}
                        </td>
                        <td className="text-center p-4"><CellContent value={row.free} /></td>
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
            <h2 className="text-3xl md:text-4xl font-black mb-4">Frequently asked questions</h2>
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
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-black mb-4"
          >
            Still not sure?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[#94A3B8] mb-8"
          >
            Start for free — no credit card required.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/auth">
              <button className="h-14 px-10 bg-[#3B82F6] text-white text-base font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-xl hover:shadow-[#3B82F6]/30 hover:-translate-y-0.5 cursor-pointer">
                Get Started Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-[#334155]/40 py-12 px-4 text-center" style={{ background: "rgba(15,23,42,0.8)" }}>
        <p className="text-xs text-[#64748B]">
          &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
