export function DashboardPreview() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl shadow-black/50">
      <svg
        viewBox="0 0 900 480"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ background: "#0D1117" }}
      >
        <defs>
          <clipPath id="chart-clip">
            <rect x="24" y="164" width="620" height="196" rx="10" />
          </clipPath>
        </defs>

        {/* ── Top bar ── */}
        <rect x="0" y="0" width="900" height="44" fill="#0F172A" />
        <text x="24" y="28" fill="#64748B" fontSize="13" fontFamily="inherit" fontWeight="700">
          Revenue Map
        </text>
        <circle cx="860" cy="22" r="2" fill="#475569" />
        <circle cx="872" cy="22" r="2" fill="#475569" />
        <circle cx="884" cy="22" r="2" fill="#475569" />
        <line x1="0" y1="44" x2="900" y2="44" stroke="#1E293B" strokeWidth="1" />

        {/* ── KPI Cards Row (left 640px) ── */}
        {/* Card 1: MRR */}
        <rect x="24" y="60" width="148" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="36" y="82" fill="#94A3B8" fontSize="9" fontFamily="inherit">Monthly Recurring Revenue</text>
        <text x="36" y="108" fill="#F8FAFC" fontSize="20" fontFamily="inherit" fontWeight="700">$48,200</text>
        <rect x="36" y="118" width="42" height="16" rx="4" fill="#064E3B" />
        <text x="41" y="130" fill="#10B981" fontSize="8" fontFamily="inherit" fontWeight="600">+12.3%</text>
        {/* Sparkline */}
        <polyline points="110,130 120,120 130,125 140,112 150,105" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />

        {/* Card 2: ARR */}
        <rect x="182" y="60" width="148" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="194" y="82" fill="#94A3B8" fontSize="9" fontFamily="inherit">Annual Recurring Revenue</text>
        <text x="194" y="108" fill="#F8FAFC" fontSize="20" fontFamily="inherit" fontWeight="700">$578,400</text>
        <rect x="194" y="118" width="42" height="16" rx="4" fill="#064E3B" />
        <text x="199" y="130" fill="#10B981" fontSize="8" fontFamily="inherit" fontWeight="600">+12.3%</text>

        {/* Card 3: Churn */}
        <rect x="340" y="60" width="148" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="352" y="82" fill="#94A3B8" fontSize="9" fontFamily="inherit">Monthly Churn</text>
        <text x="352" y="108" fill="#F8FAFC" fontSize="20" fontFamily="inherit" fontWeight="700">3.2%</text>
        <rect x="352" y="118" width="36" height="16" rx="4" fill="#064E3B" />
        <text x="357" y="130" fill="#10B981" fontSize="8" fontFamily="inherit" fontWeight="600">-0.5%</text>

        {/* Card 4: Runway */}
        <rect x="498" y="60" width="148" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="510" y="82" fill="#94A3B8" fontSize="9" fontFamily="inherit">Runway</text>
        <text x="510" y="108" fill="#F8FAFC" fontSize="20" fontFamily="inherit" fontWeight="700">18 mo</text>
        <rect x="510" y="118" width="46" height="16" rx="4" fill="#172554" />
        <text x="515" y="130" fill="#3B82F6" fontSize="8" fontFamily="inherit" fontWeight="600">On track</text>

        {/* ── Revenue Chart (left column) ── */}
        <rect x="24" y="164" width="620" height="196" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="44" y="188" fill="#F8FAFC" fontSize="12" fontFamily="inherit" fontWeight="700">Revenue Projection</text>
        <rect x="540" y="174" width="80" height="20" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        <text x="556" y="188" fill="#94A3B8" fontSize="9" fontFamily="inherit">12 months</text>

        <g clipPath="url(#chart-clip)">
          {/* Grid lines */}
          <line x1="60" y1="210" x2="620" y2="210" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="240" x2="620" y2="240" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="270" x2="620" y2="270" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="300" x2="620" y2="300" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="330" x2="620" y2="330" stroke="#0F172A" strokeWidth="1" />

          {/* X-axis labels */}
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <text key={m} x={64 + i * 50} y="348" fill="#64748B" fontSize="8" fontFamily="inherit" textAnchor="middle">{m}</text>
          ))}

          {/* Area fill under main line */}
          <path
            d="M64,330 L114,318 L164,302 L214,282 L264,258 L314,240 L364,225 L414,215 L464,205 L514,198 L564,192 L614,185 L614,335 L64,335 Z"
            fill="#3B82F6"
            opacity="0.12"
          />
          {/* Main revenue line (blue) */}
          <polyline
            points="64,330 114,318 164,302 214,282 264,258 314,240 364,225 414,215 464,205 514,198 564,192 614,185"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Optimistic scenario line (green, dashed) */}
          <polyline
            points="64,330 114,312 164,290 214,264 264,235 314,212 364,192 414,178 464,165 514,155 564,148 614,140"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ── Bottom Row: Scenario Comparison (left column) ── */}
        <rect x="24" y="376" width="620" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="44" y="398" fill="#F8FAFC" fontSize="11" fontFamily="inherit" fontWeight="700">Scenario Comparison</text>

        {/* Pessimistic bar */}
        <text x="44" y="420" fill="#94A3B8" fontSize="9" fontFamily="inherit">Pessimistic</text>
        <rect x="130" y="411" width="300" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="411" width="100" height="14" rx="3" fill="#EF4444" opacity="0.8" />
        <text x="238" y="421" fill="#94A3B8" fontSize="9" fontFamily="inherit">$28k</text>

        {/* Base bar */}
        <text x="44" y="440" fill="#94A3B8" fontSize="9" fontFamily="inherit">Base</text>
        <rect x="130" y="431" width="300" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="431" width="200" height="14" rx="3" fill="#3B82F6" opacity="0.8" />
        <text x="338" y="441" fill="#94A3B8" fontSize="9" fontFamily="inherit">$48k</text>

        {/* Optimistic bar */}
        <text x="44" y="458" fill="#94A3B8" fontSize="9" fontFamily="inherit">Optimistic</text>
        <rect x="130" y="449" width="300" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="449" width="270" height="14" rx="3" fill="#10B981" opacity="0.8" />
        <text x="408" y="459" fill="#94A3B8" fontSize="9" fontFamily="inherit">$67k</text>

        {/* ══════════════════════════════════════════════════════════════════
            AI ASSISTANT — RIGHT SIDEBAR (x=660, width=220)
            ══════════════════════════════════════════════════════════════════ */}
        <rect x="660" y="60" width="220" height="404" rx="10" fill="#161B22" stroke="#334155" strokeWidth="1" />

        {/* Sidebar header */}
        <rect x="660" y="60" width="220" height="34" rx="10" fill="#1E293B" />
        {/* Flatten bottom corners of header */}
        <rect x="660" y="84" width="220" height="10" fill="#1E293B" />
        <line x1="660" y1="94" x2="880" y2="94" stroke="#334155" strokeWidth="1" />
        <text x="680" y="82" fill="#F8FAFC" fontSize="11" fontFamily="inherit" fontWeight="700">AI Assistant</text>
        <circle cx="848" cy="78" r="3" fill="#10B981" />
        <text x="855" y="82" fill="#10B981" fontSize="8" fontFamily="inherit">Live</text>

        {/* User bubble (right-aligned, blue) */}
        <rect x="740" y="108" width="126" height="24" rx="8" fill="#3B82F6" />
        <text x="752" y="124" fill="#FFFFFF" fontSize="8.5" fontFamily="inherit">What&apos;s our biggest risk?</text>

        {/* AI response bubble (left-aligned, dark) */}
        <rect x="674" y="142" width="192" height="52" rx="8" fill="#0F172A" />
        <text x="684" y="158" fill="#CBD5E1" fontSize="8" fontFamily="inherit">CAC payback is 8.4mo — above</text>
        <text x="684" y="170" fill="#CBD5E1" fontSize="8" fontFamily="inherit">the 6mo benchmark. Consider</text>
        <text x="684" y="182" fill="#CBD5E1" fontSize="8" fontFamily="inherit">reducing paid spend by 15%.</text>

        {/* User bubble 2 */}
        <rect x="748" y="204" width="118" height="24" rx="8" fill="#3B82F6" />
        <text x="758" y="220" fill="#FFFFFF" fontSize="8.5" fontFamily="inherit">How long is our runway?</text>

        {/* AI response bubble 2 */}
        <rect x="674" y="238" width="192" height="40" rx="8" fill="#0F172A" />
        <text x="684" y="254" fill="#CBD5E1" fontSize="8" fontFamily="inherit">18 months at current burn rate.</text>
        <text x="684" y="266" fill="#CBD5E1" fontSize="8" fontFamily="inherit">You&apos;re in a strong position.</text>

        {/* Quick prompt chips */}
        <rect x="674" y="292" width="100" height="20" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="0.5" />
        <text x="684" y="306" fill="#94A3B8" fontSize="7" fontFamily="inherit">Improve our CAC</text>

        <rect x="780" y="292" width="82" height="20" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="0.5" />
        <text x="789" y="306" fill="#94A3B8" fontSize="7" fontFamily="inherit">Revenue tips</text>

        {/* Input bar at bottom of sidebar */}
        <rect x="674" y="432" width="192" height="24" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        <text x="686" y="448" fill="#64748B" fontSize="8.5" fontFamily="inherit">Ask about your data...</text>
        {/* Send button */}
        <circle cx="854" cy="444" r="9" fill="#3B82F6" />
        <path d="M850,444 L856,444 M854,440 L854,448" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
