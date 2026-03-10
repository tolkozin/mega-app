import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Revenue Map cookie policy — how we use cookies and your choices.",
};

export default function CookiesPage() {
  return (
    <>
      <LandingNavbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Cookie Policy</h1>
        <p className="text-[#94A3B8] mb-10 text-sm">
          Effective Date: March 10, 2026 | Last Updated: March 10, 2026
        </p>

        <div className="prose-dark space-y-8 text-[#CBD5E1] text-[15px] leading-relaxed">
          <p>
            This Cookie Policy explains how Revenue Map (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) uses cookies and similar tracking technologies when you visit revenuemap.app (the &ldquo;Site&rdquo;). It explains what these technologies are, why we use them, and your rights to control our use of them.
          </p>
          <p>
            By continuing to use our Site, you consent to our use of cookies as described in this policy. You can withdraw or modify your consent at any time using the Cookie Preferences panel.
          </p>

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide information to website owners.
            </p>
            <p className="mt-3">Similar technologies include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li>Local storage and session storage &mdash; browser-based storage for saving data between page loads</li>
              <li>Pixel tags / web beacons &mdash; tiny invisible images used to track page visits and email opens</li>
              <li>Fingerprinting &mdash; techniques that identify devices based on browser and hardware characteristics</li>
            </ul>
            <p className="mt-3">This policy covers all such technologies collectively referred to as &ldquo;cookies&rdquo;.</p>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <h4 className="text-[#F8FAFC] font-semibold mt-4 mb-2">2.1 Strictly Necessary Cookies</h4>
            <p>
              These cookies are essential for the Site and Service to function. They cannot be disabled. Without them, you would not be able to log in, navigate the platform, or use core features.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li>Session cookie &mdash; keeps you logged in during your visit</li>
              <li>CSRF token cookie &mdash; protects against cross-site request forgery attacks</li>
              <li>Load balancer cookie &mdash; routes your requests to the correct server</li>
            </ul>
            <p className="mt-2 text-[#94A3B8] text-sm">Legal basis: Legitimate interest (necessary for service delivery). These do not require your consent.</p>

            <h4 className="text-[#F8FAFC] font-semibold mt-6 mb-2">2.2 Functional / Preference Cookies</h4>
            <p>These cookies remember your choices and settings to provide a more personalized experience.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li>UI preference cookie &mdash; remembers your theme, language, or layout preferences</li>
              <li>Onboarding state cookie &mdash; tracks whether you have completed the onboarding flow</li>
            </ul>
            <p className="mt-2 text-[#94A3B8] text-sm">Legal basis: Consent. You can disable these without losing core functionality.</p>

            <h4 className="text-[#F8FAFC] font-semibold mt-6 mb-2">2.3 Analytics Cookies</h4>
            <p>
              These cookies help us understand how visitors interact with the Site &mdash; which pages are visited most, where users drop off, and how features are used. This data is aggregated and anonymized.
            </p>
            <p className="mt-2">We use:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li>PostHog &mdash; product analytics and session insights</li>
              <li>Vercel Analytics &mdash; page performance and visit data</li>
            </ul>
            <p className="mt-2 text-[#94A3B8] text-sm">
              Data collected: pages visited, time on page, browser type, device type, referring URL, feature usage events. We do not collect personally identifiable information through analytics cookies.
            </p>
            <p className="mt-2 text-[#94A3B8] text-sm">Legal basis: Consent. You can opt out of analytics cookies without affecting your use of the Service.</p>

            <h4 className="text-[#F8FAFC] font-semibold mt-6 mb-2">2.4 Marketing / Advertising Cookies</h4>
            <p>
              We do not currently use marketing or advertising cookies. We do not run retargeting campaigns or share data with ad networks. If this changes, we will update this policy and request your consent before placing any marketing cookies.
            </p>
          </Section>

          <Section title="3. Cookie Duration">
            <ul className="list-disc pl-6 space-y-1 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Session cookies:</strong> deleted automatically when you close your browser.</li>
              <li><strong className="text-[#CBD5E1]">Authentication token:</strong> up to 30 days</li>
              <li><strong className="text-[#CBD5E1]">Preference cookies:</strong> up to 12 months</li>
              <li><strong className="text-[#CBD5E1]">Analytics cookies:</strong> up to 12 months</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Cookies">
            <p>
              Some cookies on our Site are set by third-party services we use. We do not control these third parties&apos; cookie policies. The relevant third parties are:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Stripe</strong> &mdash; payment processing. Sets cookies to prevent fraud and remember payment state.</li>
              <li><strong className="text-[#CBD5E1]">PostHog</strong> &mdash; analytics.</li>
              <li><strong className="text-[#CBD5E1]">Vercel</strong> &mdash; hosting and performance.</li>
            </ul>
            <p className="mt-2">We have selected these providers carefully and ensure they are GDPR-compliant where applicable.</p>
          </Section>

          <Section title="5. Your Cookie Choices and Rights">
            <h4 className="text-[#F8FAFC] font-semibold mt-4 mb-2">5.1 Cookie Preference Centre</h4>
            <p>
              When you first visit the Site, a cookie banner will appear allowing you to accept all cookies, reject non-essential cookies, or customize your preferences by category. You can change your preferences at any time by clicking &ldquo;Cookie Settings&rdquo; in the website footer.
            </p>

            <h4 className="text-[#F8FAFC] font-semibold mt-6 mb-2">5.2 Browser Controls</h4>
            <p>
              You can control and delete cookies through your browser settings. Note that disabling strictly necessary cookies will prevent you from using the Service.
            </p>

            <h4 className="text-[#F8FAFC] font-semibold mt-6 mb-2">5.3 Do Not Track</h4>
            <p>
              Some browsers send a &ldquo;Do Not Track&rdquo; (DNT) signal. We currently do not respond to DNT signals as there is no agreed industry standard for handling them. Our Cookie Preferences panel gives you equivalent control.
            </p>
          </Section>

          <Section title="6. GDPR and ePrivacy Compliance">
            <p>For users in the European Economic Area (EEA) and United Kingdom, we comply with the EU General Data Protection Regulation (GDPR) and the ePrivacy Directive (Cookie Law). Specifically:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#94A3B8]">
              <li>We obtain your consent before placing non-essential cookies</li>
              <li>Consent is freely given, specific, informed, and unambiguous</li>
              <li>You can withdraw consent as easily as you gave it</li>
              <li>We do not use cookie walls that block access to the Site if you decline non-essential cookies</li>
              <li>We maintain records of consent as required by GDPR Article 7</li>
            </ul>
          </Section>

          <Section title="7. Changes to This Cookie Policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We will notify you of material changes by updating the effective date at the top of this page and, where required by law, by seeking your renewed consent.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>If you have questions about our use of cookies, please contact us:</p>
            <p className="mt-2">
              Revenue Map<br />
              Email:{" "}
              <a href="mailto:privacy@revenuemap.app" className="text-[#3B82F6] hover:underline">
                privacy@revenuemap.app
              </a>
              <br />
              Website:{" "}
              <Link href="/cookies" className="text-[#3B82F6] hover:underline">
                revenuemap.app/cookies
              </Link>
            </p>
            <p className="mt-2 text-[#94A3B8] text-sm">For GDPR-related requests, we aim to respond within 30 days.</p>
          </Section>

          <p className="text-[#64748B] text-sm pt-4 border-t border-[#334155]/40">
            This Cookie Policy was last reviewed and updated on March 10, 2026.
          </p>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-[#F8FAFC] mb-3">{title}</h3>
      {children}
    </section>
  );
}
