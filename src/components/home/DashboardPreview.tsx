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
            <rect x="24" y="164" width="852" height="196" rx="10" />
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

        {/* ── KPI Cards Row ── */}
        {/* Card 1: MRR */}
        <rect x="24" y="60" width="204" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="40" y="82" fill="#94A3B8" fontSize="10" fontFamily="inherit">Monthly Recurring Revenue</text>
        <text x="40" y="110" fill="#F8FAFC" fontSize="22" fontFamily="inherit" fontWeight="700">$48,200</text>
        <rect x="40" y="120" width="46" height="16" rx="4" fill="#064E3B" />
        <text x="46" y="132" fill="#10B981" fontSize="9" fontFamily="inherit" fontWeight="600">+12.3%</text>
        {/* Sparkline */}
        <polyline points="150,130 162,120 174,125 186,112 198,105" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />

        {/* Card 2: ARR */}
        <rect x="244" y="60" width="204" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="260" y="82" fill="#94A3B8" fontSize="10" fontFamily="inherit">Annual Recurring Revenue</text>
        <text x="260" y="110" fill="#F8FAFC" fontSize="22" fontFamily="inherit" fontWeight="700">$578,400</text>
        <rect x="260" y="120" width="46" height="16" rx="4" fill="#064E3B" />
        <text x="266" y="132" fill="#10B981" fontSize="9" fontFamily="inherit" fontWeight="600">+12.3%</text>

        {/* Card 3: Churn */}
        <rect x="464" y="60" width="204" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="480" y="82" fill="#94A3B8" fontSize="10" fontFamily="inherit">Monthly Churn</text>
        <text x="480" y="110" fill="#F8FAFC" fontSize="22" fontFamily="inherit" fontWeight="700">3.2%</text>
        <rect x="480" y="120" width="38" height="16" rx="4" fill="#064E3B" />
        <text x="486" y="132" fill="#10B981" fontSize="9" fontFamily="inherit" fontWeight="600">-0.5%</text>

        {/* Card 4: Runway */}
        <rect x="684" y="60" width="192" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="700" y="82" fill="#94A3B8" fontSize="10" fontFamily="inherit">Runway</text>
        <text x="700" y="110" fill="#F8FAFC" fontSize="22" fontFamily="inherit" fontWeight="700">18 mo</text>
        <rect x="700" y="120" width="50" height="16" rx="4" fill="#172554" />
        <text x="706" y="132" fill="#3B82F6" fontSize="9" fontFamily="inherit" fontWeight="600">On track</text>

        {/* ── Revenue Chart ── */}
        <rect x="24" y="164" width="852" height="196" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="44" y="188" fill="#F8FAFC" fontSize="12" fontFamily="inherit" fontWeight="700">Revenue Projection</text>
        <rect x="770" y="174" width="80" height="20" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        <text x="786" y="188" fill="#94A3B8" fontSize="9" fontFamily="inherit">12 months</text>

        <g clipPath="url(#chart-clip)">
          {/* Grid lines */}
          <line x1="60" y1="210" x2="850" y2="210" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="240" x2="850" y2="240" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="270" x2="850" y2="270" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="300" x2="850" y2="300" stroke="#0F172A" strokeWidth="1" />
          <line x1="60" y1="330" x2="850" y2="330" stroke="#0F172A" strokeWidth="1" />

          {/* X-axis labels */}
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <text key={m} x={74 + i * 68} y="348" fill="#64748B" fontSize="8" fontFamily="inherit" textAnchor="middle">{m}</text>
          ))}

          {/* Area fill under main line */}
          <path
            d="M74,330 L142,318 L210,302 L278,282 L346,258 L414,240 L482,225 L550,215 L618,205 L686,198 L754,192 L822,185 L822,335 L74,335 Z"
            fill="#3B82F6"
            opacity="0.12"
          />
          {/* Main revenue line (blue) */}
          <polyline
            points="74,330 142,318 210,302 278,282 346,258 414,240 482,225 550,215 618,205 686,198 754,192 822,185"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Optimistic scenario line (green, dashed) */}
          <polyline
            points="74,330 142,312 210,290 278,264 346,235 414,212 482,192 550,178 618,165 686,155 754,148 822,140"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ── Bottom Row ── */}
        {/* Left panel: Scenario Comparison */}
        <rect x="24" y="376" width="412" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x="44" y="398" fill="#F8FAFC" fontSize="11" fontFamily="inherit" fontWeight="700">Scenario Comparison</text>

        {/* Pessimistic bar */}
        <text x="44" y="420" fill="#94A3B8" fontSize="9" fontFamily="inherit">Pessimistic</text>
        <rect x="130" y="411" width="160" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="411" width="64" height="14" rx="3" fill="#EF4444" opacity="0.8" />
        <text x="202" y="421" fill="#94A3B8" fontSize="9" fontFamily="inherit">$28k</text>

        {/* Base bar */}
        <text x="44" y="440" fill="#94A3B8" fontSize="9" fontFamily="inherit">Base</text>
        <rect x="130" y="431" width="160" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="431" width="104" height="14" rx="3" fill="#3B82F6" opacity="0.8" />
        <text x="242" y="441" fill="#94A3B8" fontSize="9" fontFamily="inherit">$48k</text>

        {/* Optimistic bar */}
        <text x="44" y="458" fill="#94A3B8" fontSize="9" fontFamily="inherit">Optimistic</text>
        <rect x="130" y="449" width="160" height="14" rx="3" fill="#0F172A" />
        <rect x="130" y="449" width="144" height="14" rx="3" fill="#10B981" opacity="0.8" />
        <text x="282" y="459" fill="#94A3B8" fontSize="9" fontFamily="inherit">$67k</text>

        {/* Right panel: AI Assistant Chat */}
        <rect x="452" y="376" width="424" height="88" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        {/* Header */}
        <text x="472" y="396" fill="#F8FAFC" fontSize="11" fontFamily="inherit" fontWeight="700">AI Assistant</text>
        <circle cx="844" cy="390" r="3" fill="#10B981" />
        <text x="852" y="394" fill="#10B981" fontSize="8" fontFamily="inherit">Live</text>
        {/* Chat bubbles */}
        <rect x="530" y="404" width="120" height="18" rx="6" fill="#3B82F6" />
        <text x="540" y="416" fill="#FFFFFF" fontSize="8" fontFamily="inherit">What&apos;s our biggest risk?</text>
        <rect x="472" y="428" width="180" height="28" rx="6" fill="#0F172A" />
        <text x="480" y="440" fill="#CBD5E1" fontSize="7.5" fontFamily="inherit">CAC payback is 8.4mo — above</text>
        <text x="480" y="450" fill="#CBD5E1" fontSize="7.5" fontFamily="inherit">the 6mo benchmark. Consider...</text>
      </svg>
    </div>
  );
}
