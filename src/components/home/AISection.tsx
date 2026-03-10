"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const chatStagger = {
  visible: { transition: { staggerChildren: 0.5 } },
};

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Ask anything about your model",
    description: "\u201CWhat happens to runway if churn doubles?\u201D Get an instant, data-backed answer \u2014 no formulas required.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Flags risks before they become problems",
    description: "AI monitors your key ratios and alerts you when CAC payback or burn rate drifts into the danger zone.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Generates your investor narrative",
    description: "One click turns your model into a written summary ready to paste into a deck or send to an angel.",
  },
];

const chatMessages = [
  { role: "user" as const, text: "What\u2019s our biggest risk right now?" },
  {
    role: "ai" as const,
    text: "Your CAC payback period is 8.4 months \u2014 above the 6-month benchmark for your growth stage. If acquisition costs stay flat, you\u2019ll need 14 months of runway just to break even on new customers.\n\nConsider: reduce CAC by 15% OR increase ARPA by $12/mo to hit the 6-month target.",
  },
  { role: "user" as const, text: "What if we raise prices by 10%?" },
  { role: "ai" as const, text: "Modeling that now...", typing: true },
];

export function AISection() {
  const prefersReduced = useReducedMotion();
  const motionProps = (delay = 0) =>
    prefersReduced
      ? {}
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, margin: "-80px" },
          variants: fadeUp,
          transition: { duration: 0.5, delay },
        };

  return (
    <section className="py-24 px-4" style={{ background: "rgba(30,41,59,0.3)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text content */}
          <div>
            <motion.div {...motionProps()}>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] mb-3 block">
                AI Assistant
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#F8FAFC] mb-4">
                Your numbers, explained in plain Language.
              </h2>
              <p className="text-[#94A3B8] leading-relaxed mb-10">
                Stop guessing what your metrics mean. Revenue Map&apos;s AI reads your model,
                spots what matters, and tells you exactly what to do next.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="space-y-6"
            >
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-[#3B82F6]/10 text-[#3B82F6]">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC] mb-1">{f.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...motionProps(0.4)} className="mt-8">
              <Link href="/auth/register" className="text-sm font-bold text-[#3B82F6] hover:underline">
                See AI in action &rarr;
              </Link>
            </motion.div>
          </div>

          {/* Right: chat mock-up */}
          <motion.div
            {...motionProps(0.4)}
            className="rounded-2xl border border-[#1E293B] overflow-hidden"
            style={{ background: "#0F172A" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E293B]">
              <span className="text-sm font-bold text-[#F8FAFC]">AI Financial Assistant</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#10B981] font-medium">Live</span>
              </div>
            </div>

            {/* Chat body */}
            <div className="relative px-5 py-5 space-y-4" style={{ minHeight: 340 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={chatStagger}
                className="space-y-4"
              >
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#3B82F6] text-white rounded-xl rounded-br-sm max-w-[75%]"
                          : "bg-[#1E293B] text-[#CBD5E1] rounded-xl rounded-bl-sm max-w-[85%]"
                      }`}
                    >
                      {msg.text.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.text.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                      {"typing" in msg && msg.typing && (
                        <span className="inline-block w-[2px] h-[14px] bg-[#94A3B8] ml-0.5 align-middle animate-blink" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, #0F172A)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </section>
  );
}
