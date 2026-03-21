export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Left: form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-white">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
      {/* Right: blue illustration panel */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-[#2163E7] rounded-l-[32px]">
        <div className="text-center text-white px-12">
          <svg className="mx-auto mb-8" width="200" height="200" viewBox="0 0 200 200" fill="none">
            <rect x="30" y="60" width="140" height="100" rx="12" fill="white" fillOpacity="0.15" />
            <rect x="45" y="80" width="60" height="8" rx="4" fill="white" fillOpacity="0.4" />
            <rect x="45" y="96" width="40" height="8" rx="4" fill="white" fillOpacity="0.3" />
            <rect x="45" y="120" width="110" height="24" rx="8" fill="white" fillOpacity="0.2" />
            <circle cx="150" cy="50" r="25" fill="white" fillOpacity="0.1" />
            <circle cx="50" cy="40" r="15" fill="white" fillOpacity="0.08" />
          </svg>
          <h2 className="text-2xl font-bold mb-3">Financial Modeling Platform</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Build investor-ready financial models for subscription, e-commerce, and SaaS businesses
          </p>
        </div>
      </div>
    </div>
  );
}
