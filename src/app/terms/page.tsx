import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service governing your access to and use of the Revenue Map platform.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Terms of Service — Revenue Map",
    description:
      "Terms of Service governing your access to and use of the Revenue Map platform.",
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="mx-auto max-w-3xl px-4 py-20">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-[#F8FAFC] mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-[#64748B]">
              Effective Date: March 10, 2026 &middot; Last Updated: March 10, 2026
            </p>
          </div>

          {/* Body */}
          <div className="space-y-8 text-[#CBD5E1] text-[15px] leading-relaxed">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and Revenue Map (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) governing your access to and use of the Revenue Map platform, website, and related services available at revenuemap.app (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="font-medium text-[#F8FAFC] uppercase text-sm">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>

            <Section title="1. Eligibility and Account Registration">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">1.1 Eligibility</h4>
              <p>You must be at least 16 years of age to use the Service. By using the Service, you represent and warrant that you meet this requirement and have the legal capacity to enter into these Terms.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">1.2 Account Creation</h4>
              <p>To access certain features, you must create an account. You agree to:</p>
              <BulletList items={[
                "Provide accurate, current, and complete registration information",
                "Maintain and promptly update your account information",
                "Keep your password confidential and not share it with third parties",
                "Notify us immediately of any unauthorized use of your account",
                "Accept responsibility for all activities that occur under your account",
              ]} />
              <p>We reserve the right to suspend or terminate accounts that contain inaccurate information or violate these Terms.</p>
            </Section>

            <Section title="2. Description of Service">
              <p>Revenue Map provides a cloud-based financial modeling platform that enables users to:</p>
              <BulletList items={[
                "Build financial models for SaaS, subscription, and e-commerce businesses",
                "Run scenario analyses including Monte Carlo simulations",
                "Generate investor-ready reports and dashboards",
                "Access AI-assisted financial analysis and recommendations",
                "Upload data files for automated analysis and projections",
                "Share financial models and dashboards with collaborators",
              ]} />
              <p>The Service is provided &ldquo;as is&rdquo; and we reserve the right to modify, suspend, or discontinue any feature at any time with reasonable notice.</p>
            </Section>

            <Section title="3. Subscription Plans and Payment">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">3.1 Plans</h4>
              <p>We offer the following subscription tiers:</p>
              <BulletList items={[
                "Free Plan: limited to 1 project and 3 scenarios per project; no payment required",
                "Pro Plan: $29 per month (or as currently displayed on our pricing page); unlimited projects and scenarios, Monte Carlo simulation, public dashboards, and priority support",
                "Enterprise Plan: custom pricing; contact us for details",
              ]} />

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">3.2 Billing</h4>
              <p>Pro and Enterprise subscriptions are billed on a recurring basis (monthly or annually as selected). By subscribing, you authorize us to charge your payment method on a recurring basis. All fees are in USD unless otherwise stated.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">3.3 Free Trial</h4>
              <p>We may offer free trials of paid features. At the end of a trial period, your subscription will automatically convert to a paid plan unless you cancel before the trial ends.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">3.4 Cancellation</h4>
              <p>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the end of the period for which you have already paid.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">3.5 Refunds</h4>
              <p>We offer a 7-day money-back guarantee for new Pro subscriptions. After 7 days, all fees are non-refundable except where required by applicable law. Refund requests must be submitted to <EmailLink email="support@revenuemap.app" />.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">3.6 Price Changes</h4>
              <p>We may change subscription fees at any time. We will provide at least 30 days notice of price increases via email. Continued use of the Service after the effective date of a price change constitutes acceptance of the new fee.</p>
            </Section>

            <Section title="4. Acceptable Use Policy">
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <BulletList items={[
                "Use the Service in any way that violates applicable local, national, or international laws or regulations",
                "Transmit any material that is unlawful, fraudulent, defamatory, or infringes any intellectual property rights",
                "Attempt to gain unauthorized access to any part of the Service, other user accounts, or our systems",
                "Use automated scripts, bots, or crawlers to access the Service without our written permission",
                "Reverse engineer, decompile, or disassemble any part of the Service",
                "Upload files containing viruses, malware, or other harmful code",
                "Use the Service to build a competing product or service",
                "Resell, sublicense, or commercially exploit the Service without our written consent",
                "Share your account credentials with others or allow multiple users to access a single account",
                "Provide false or misleading financial data with intent to deceive investors or other third parties",
              ]} />
              <p>Violation of this Acceptable Use Policy may result in immediate termination of your account without refund.</p>
            </Section>

            <Section title="5. User Content and Data">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">5.1 Your Content</h4>
              <p>You retain full ownership of all financial data, models, projections, and other content you input into or create using the Service (&ldquo;User Content&rdquo;). By using the Service, you grant us a limited, non-exclusive, royalty-free license to process, store, and display your User Content solely as necessary to provide the Service.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">5.2 Your Responsibility</h4>
              <p>You are solely responsible for the accuracy and legality of your User Content. We do not verify the accuracy of financial data you enter. Revenue Map is a modeling tool — projections and AI recommendations are for informational purposes only and do not constitute financial, investment, legal, or tax advice.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">5.3 Data Aggregation</h4>
              <p>We may use anonymized, aggregated, non-identifiable data derived from user activity to improve the Service and generate industry benchmarks. This aggregated data cannot be used to identify individual users or their specific financial information.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">5.4 Data Backup</h4>
              <p>While we maintain regular backups, you are responsible for maintaining your own copies of important financial data. We are not liable for data loss due to technical failures, though we will make commercially reasonable efforts to recover data.</p>
            </Section>

            <Section title="6. Intellectual Property">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">6.1 Our Property</h4>
              <p>The Service, including all software, algorithms, designs, text, graphics, logos, and other content created by Revenue Map (excluding User Content), is owned by or licensed to Revenue Map and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works from our intellectual property without our prior written consent.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">6.2 Feedback</h4>
              <p>If you submit suggestions, ideas, or feedback about the Service (&ldquo;Feedback&rdquo;), you grant us a perpetual, irrevocable, royalty-free license to use that Feedback for any purpose without compensation to you.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">6.3 Trademarks</h4>
              <p>&ldquo;Revenue Map&rdquo; and the Revenue Map logo are trademarks of the Company. You may not use our trademarks without prior written permission.</p>
            </Section>

            <Section title="7. AI Features and Financial Modeling Disclaimer">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">7.1 No Financial Advice</h4>
              <div className="rounded-xl border border-[#F59E0B]/30 p-4 my-3" style={{ background: "rgba(245,158,11,0.05)" }}>
                <p className="text-[#F59E0B] text-sm font-medium">
                  The Service provides financial modeling tools and AI-generated analysis for informational and planning purposes only. Nothing in the Service constitutes financial, investment, accounting, tax, or legal advice. You should consult qualified professionals before making financial decisions based on models or projections generated by the Service.
                </p>
              </div>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">7.2 No Guarantee of Accuracy</h4>
              <p>Financial projections, AI recommendations, and industry benchmarks provided by the Service are based on mathematical models and available data. Actual results may differ materially from projections. We make no representations or warranties regarding the accuracy, completeness, or fitness for a particular purpose of any financial projections or AI-generated content.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">7.3 AI Limitations</h4>
              <p>AI features within the Service may produce errors, hallucinations, or outdated information. You are responsible for reviewing and validating all AI-generated content before relying on it for business decisions.</p>
            </Section>

            <Section title="8. Privacy">
              <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of information as described in the Privacy Policy.</p>
            </Section>

            <Section title="9. Third-Party Services and Links">
              <p>The Service integrates with or links to third-party services (including Stripe for payments, and AI providers for analysis). These third parties have their own terms of service and privacy policies. We are not responsible for the practices or content of third-party services. Your use of third-party services is at your own risk.</p>
            </Section>

            <Section title="10. Disclaimers and Limitation of Liability">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">10.1 Disclaimer of Warranties</h4>
              <p className="uppercase text-sm">
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, title, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, secure, or free of viruses.
              </p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">10.2 Limitation of Liability</h4>
              <p className="uppercase text-sm">
                To the maximum extent permitted by applicable law, Revenue Map, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, including but not limited to loss of profits, data, or business opportunities.
              </p>
              <p className="uppercase text-sm mt-3">
                Our total liability to you for all claims arising from or related to these Terms or the Service shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100 USD if you have not made any payments.
              </p>
              <p className="mt-3">Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability is limited to the greatest extent permitted by law.</p>
            </Section>

            <Section title="11. Indemnification">
              <p>You agree to indemnify, defend, and hold harmless Revenue Map and its officers, directors, employees, agents, and successors from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from:</p>
              <BulletList items={[
                "Your use of the Service in violation of these Terms",
                "Your User Content, including any claims that it infringes third-party rights",
                "Your violation of any applicable law or regulation",
                "Any misrepresentation made by you in connection with the Service",
              ]} />
            </Section>

            <Section title="12. Termination">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">12.1 By You</h4>
              <p>You may terminate your account at any time by contacting <EmailLink email="support@revenuemap.app" /> or using the account deletion feature in your settings. Termination does not entitle you to a refund of prepaid fees except as provided in Section 3.5.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">12.2 By Us</h4>
              <p>We may suspend or terminate your account immediately, without notice, if:</p>
              <BulletList items={[
                "You breach any provision of these Terms",
                "We are required to do so by law",
                "We reasonably believe your account is being used fraudulently",
                "We discontinue the Service",
              ]} />

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">12.3 Effect of Termination</h4>
              <p>Upon termination, your right to access the Service ceases immediately. We will delete your data within 90 days of account termination, except as required by law. Provisions of these Terms that by their nature should survive termination shall survive, including Sections 5, 6, 7, 10, 11, and 14.</p>
            </Section>

            <Section title="13. Modifications to Terms">
              <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by:</p>
              <BulletList items={[
                "Posting updated Terms on this page with a new effective date",
                "Sending an email notification to your registered address at least 14 days before changes take effect",
              ]} />
              <p>Your continued use of the Service after the effective date of updated Terms constitutes your acceptance of the changes. If you do not agree to the updated Terms, you must stop using the Service and cancel your subscription.</p>
            </Section>

            <Section title="14. Governing Law and Dispute Resolution">
              <h4 className="text-[#F8FAFC] font-bold mt-4 mb-2">14.1 Governing Law</h4>
              <p>These Terms are governed by the laws of the Republic of Serbia, without regard to conflict of law principles. For users in the European Union, mandatory consumer protection laws of your country of residence also apply.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">14.2 Dispute Resolution</h4>
              <p>Before initiating any formal legal proceedings, you agree to attempt to resolve disputes informally by contacting us at <EmailLink email="legal@revenuemap.app" />. We will attempt to resolve disputes within 30 days.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">14.3 Jurisdiction</h4>
              <p>Any unresolved disputes shall be subject to the exclusive jurisdiction of the courts of the Republic of Serbia, except where mandatory consumer protection laws of your country require otherwise.</p>

              <h4 className="text-[#F8FAFC] font-bold mt-6 mb-2">14.4 Class Action Waiver</h4>
              <p>To the extent permitted by law, you agree to resolve disputes with us on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.</p>
            </Section>

            <Section title="15. General Provisions">
              <BulletList items={[
                "Entire Agreement: These Terms, together with our Privacy Policy and any additional terms applicable to specific features, constitute the entire agreement between you and Revenue Map.",
                "Severability: If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.",
                "Waiver: Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.",
                "Assignment: You may not assign or transfer your rights or obligations under these Terms without our written consent. We may assign our rights and obligations without restriction.",
                "Force Majeure: We are not liable for delays or failures in performance resulting from causes beyond our reasonable control.",
                "No Agency: Nothing in these Terms creates a partnership, joint venture, employment, or agency relationship between you and Revenue Map.",
              ]} />
            </Section>

            <Section title="16. Contact Information">
              <p>For questions about these Terms of Service, please contact:</p>
              <div className="rounded-xl border border-[#334155]/60 p-5 mt-4" style={{ background: "rgba(30,41,59,0.4)" }}>
                <p className="font-bold text-[#F8FAFC] mb-1">Revenue Map</p>
                <p>Email: <EmailLink email="legal@revenuemap.app" /></p>
                <p>Support: <EmailLink email="support@revenuemap.app" /></p>
                <p>Website: <Link href="/" className="text-[#3B82F6] hover:underline">revenuemap.app</Link></p>
              </div>
              <p className="mt-4">We aim to respond to all legal inquiries within 10 business days.</p>
            </Section>

            <div className="border-t border-[#334155]/40 pt-6 mt-10 text-sm text-[#64748B] text-center">
              These Terms of Service were last reviewed and updated on March 10, 2026.
              <br />
              Revenue Map — revenuemap.app — &copy; 2026 All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Reusable sub-components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="text-[#3B82F6] hover:underline">
      {email}
    </a>
  );
}
